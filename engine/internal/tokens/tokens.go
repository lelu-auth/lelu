// Package tokens issues and validates JIT-scoped JWT tokens backed by Redis.
package tokens

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/lelu/engine/internal/fallback"
	"github.com/redis/go-redis/v9"
)

const defaultTTL = 60 * time.Second

// ─── Claims ──────────────────────────────────────────────────────────────────

// AgentClaims extends standard JWT claims with agent-specific fields.
type AgentClaims struct {
	Scope       string         `json:"scope"`
	ActingFor   string         `json:"acting_for"`
	Permissions []string       `json:"permissions,omitempty"`
	Constraints map[string]any `json:"constraints,omitempty"`
	jwt.RegisteredClaims
}

// ─── Service ─────────────────────────────────────────────────────────────────

// Service mints and validates agent-scoped JIT tokens.
type Service struct {
	signingKey  []byte
	rdb         *redis.Client
	defaultTTL  time.Duration
	memCache    *inMemoryCache
	fallbackSvc *fallback.Strategy
}

// Config holds Service constructor options.
type Config struct {
	SigningKey      string
	RedisAddr       string
	DefaultTTL      time.Duration
	FallbackService *fallback.Strategy
}

// New creates a Service. If RedisAddr is empty, token revocation is in-memory
// (suitable for testing only).
func New(cfg ...Config) *Service {
	s := &Service{
		signingKey: []byte("change-me-in-production"),
		defaultTTL: defaultTTL,
		memCache:   newInMemoryCache(),
	}
	if len(cfg) > 0 {
		c := cfg[0]
		if c.SigningKey != "" {
			s.signingKey = []byte(c.SigningKey)
		}
		if c.DefaultTTL > 0 {
			s.defaultTTL = c.DefaultTTL
		}
		if c.RedisAddr != "" {
			s.rdb = redis.NewClient(&redis.Options{Addr: c.RedisAddr})
		}
		s.fallbackSvc = c.FallbackService
	}
	return s
}

// ─── Mint ─────────────────────────────────────────────────────────────────────

// MintResult holds the output of a successful mint operation.
type MintResult struct {
	Token     string
	TokenID   string
	ExpiresAt time.Time
}

// MintAgentToken creates a signed JWT for the given scope and optional TTL.
func (s *Service) MintAgentToken(ctx context.Context, scope, actingFor string, ttl time.Duration) (*MintResult, error) {
	if ttl <= 0 {
		ttl = s.defaultTTL
	}
	tokenID := uuid.NewString()
	now := time.Now().UTC()
	exp := now.Add(ttl)

	claims := AgentClaims{
		Scope:     scope,
		ActingFor: actingFor,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "agent/" + scope,
			ID:        tokenID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.signingKey)
	if err != nil {
		return nil, fmt.Errorf("tokens: sign: %w", err)
	}

	// Record token ID in Redis so we can revoke it.
	if s.rdb != nil {
		if err := s.rdb.Set(ctx, redisKey(tokenID), "1", ttl).Err(); err != nil {
			// Check fallback strategy
			if s.fallbackSvc != nil {
				s.fallbackSvc.RecordFailure(fallback.DepRedis)
				if allowed, _ := s.fallbackSvc.ShouldAllow(fallback.DepRedis); allowed {
					log.Printf("tokens: redis unavailable, using in-memory fallback for token %s", tokenID)
					if err := s.memCache.Set(ctx, tokenID, ttl); err != nil {
						return nil, fmt.Errorf("tokens: fallback cache: %w", err)
					}
				} else {
					return nil, fmt.Errorf("tokens: redis: %w", err)
				}
			} else {
				return nil, fmt.Errorf("tokens: redis: %w", err)
			}
		} else if s.fallbackSvc != nil {
			s.fallbackSvc.RecordSuccess(fallback.DepRedis)
		}
	} else {
		// No Redis configured, use in-memory cache
		if err := s.memCache.Set(ctx, tokenID, ttl); err != nil {
			return nil, fmt.Errorf("tokens: cache: %w", err)
		}
	}

	return &MintResult{Token: signed, TokenID: tokenID, ExpiresAt: exp}, nil
}

// ─── Validate ─────────────────────────────────────────────────────────────────

// ValidateToken parses and validates a signed JWT, checking Redis revocation.
func (s *Service) ValidateToken(ctx context.Context, raw string) (*AgentClaims, error) {
	var claims AgentClaims
	_, err := jwt.ParseWithClaims(raw, &claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.signingKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("tokens: validate: %w", err)
	}

	// Check revocation list.
	if s.rdb != nil {
		exists, err := s.rdb.Exists(ctx, redisKey(claims.ID)).Result()
		if err != nil {
			// Check fallback strategy
			if s.fallbackSvc != nil {
				s.fallbackSvc.RecordFailure(fallback.DepRedis)
				if allowed, _ := s.fallbackSvc.ShouldAllow(fallback.DepRedis); allowed {
					log.Printf("tokens: redis unavailable, checking in-memory fallback for token %s", claims.ID)
					exists, err := s.memCache.Exists(ctx, claims.ID)
					if err != nil {
						return nil, fmt.Errorf("tokens: fallback cache check: %w", err)
					}
					if !exists {
						return nil, errors.New("tokens: token has been revoked or not found in fallback cache")
					}
				} else {
					return nil, fmt.Errorf("tokens: redis check: %w", err)
				}
			} else {
				return nil, fmt.Errorf("tokens: redis check: %w", err)
			}
		} else {
			if s.fallbackSvc != nil {
				s.fallbackSvc.RecordSuccess(fallback.DepRedis)
			}
			if exists == 0 {
				return nil, errors.New("tokens: token has been revoked")
			}
		}
	} else {
		// No Redis configured, check in-memory cache
		exists, err := s.memCache.Exists(ctx, claims.ID)
		if err != nil {
			return nil, fmt.Errorf("tokens: cache check: %w", err)
		}
		if !exists {
			return nil, errors.New("tokens: token has been revoked or not found")
		}
	}

	return &claims, nil
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

// RevokeToken removes a token ID from the Redis allowlist, immediately
// invalidating it.
func (s *Service) RevokeToken(ctx context.Context, tokenID string) error {
	if s.rdb != nil {
		if err := s.rdb.Del(ctx, redisKey(tokenID)).Err(); err != nil {
			// Check fallback strategy
			if s.fallbackSvc != nil {
				s.fallbackSvc.RecordFailure(fallback.DepRedis)
				if allowed, _ := s.fallbackSvc.ShouldAllow(fallback.DepRedis); allowed {
					log.Printf("tokens: redis unavailable, revoking from in-memory fallback for token %s", tokenID)
					if err := s.memCache.Delete(ctx, tokenID); err != nil {
						return fmt.Errorf("tokens: fallback cache delete: %w", err)
					}
					return nil
				}
			}
			return fmt.Errorf("tokens: revoke: %w", err)
		}
		if s.fallbackSvc != nil {
			s.fallbackSvc.RecordSuccess(fallback.DepRedis)
		}
	}
	// Also remove from in-memory cache
	return s.memCache.Delete(ctx, tokenID)
}

func redisKey(tokenID string) string {
	return "lelu:token:" + tokenID
}
