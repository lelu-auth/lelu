package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/lelu/engine/internal/audit"
	"github.com/lelu/engine/internal/confidence"
	"github.com/lelu/engine/internal/evaluator"
	"github.com/lelu/engine/internal/fallback"
	"github.com/lelu/engine/internal/incident"
	"github.com/lelu/engine/internal/queue"
	"github.com/lelu/engine/internal/ratelimit"
	"github.com/lelu/engine/internal/server"
	syncer "github.com/lelu/engine/internal/sync"
	"github.com/lelu/engine/internal/telemetry"
	"github.com/lelu/engine/internal/tokens"
)

func main() {
	// ── Config from environment ──────────────────────────────────────────────
	addr := envOr("LISTEN_ADDR", ":8080")
	policyPath := envOr("POLICY_PATH", "/etc/lelu/auth.yaml")
	redisAddr := envOr("REDIS_ADDR", "")
	signingKey := envOr("JWT_SIGNING_KEY", "change-me-in-production")
	cpURL := envOr("CONTROL_PLANE_URL", "")
	cpHMACSecret := envOr("CP_HMAC_SECRET", "")
	regoPolicyPath := envOr("REGO_POLICY_PATH", "")
	regoPolicyQuery := envOr("REGO_POLICY_QUERY", "data.lelu.authz")
	apiKey := envOr("API_KEY", "")
	tenantID := envOr("TENANT_ID", "default")
	allowUnverifiedConfidence := envOr("CONFIDENCE_ALLOW_UNVERIFIED", "false") == "true"
	missingConfidenceMode := server.ParseMissingConfidenceMode(envOr("CONFIDENCE_MISSING_MODE", "deny"))
	enforcementMode := server.ParseEnforcementMode(envOr("LELU_MODE", "enforce"))
	incidentWebhookURL := envOr("INCIDENT_WEBHOOK_URL", "")
	incidentTimeoutMS := parseIntOr(envOr("INCIDENT_WEBHOOK_TIMEOUT_MS", "2000"), 2000)
	otelEnabled := envOr("OTEL_ENABLED", "false") == "true"
	otelEndpoint := envOr("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317")
	otelSampleRate := parseFloatOr(envOr("OTEL_SAMPLE_RATE", "1.0"), 1.0)

	if isProductionEnv() {
		if signingKey == "" || signingKey == "change-me-in-production" {
			log.Fatal("JWT_SIGNING_KEY must be explicitly set to a strong secret in production")
		}
		if apiKey == "" || apiKey == "change-me-in-production" {
			log.Fatal("API_KEY must be explicitly set in production")
		}
	}

	// ── Bootstrap components ─────────────────────────────────────────────────
	eval := evaluator.New()
	if _, err := os.Stat(policyPath); err == nil {
		if err := eval.LoadPolicy(policyPath); err != nil {
			log.Fatalf("failed to load policy from %s: %v", policyPath, err)
		}
		log.Printf("policy loaded from %s", policyPath)
	} else {
		log.Printf("no policy file at %s — starting with empty policy", policyPath)
	}

	if regoPolicyPath != "" {
		if err := eval.LoadRegoPolicy(regoPolicyPath, regoPolicyQuery); err != nil {
			log.Fatalf("failed to load rego policy from %s: %v", regoPolicyPath, err)
		}
		log.Printf("rego policy loaded from %s (query: %s)", regoPolicyPath, regoPolicyQuery)
	}

	// ── Operational fallback modes (Phase 2) ─────────────────────────────────
	fb := fallback.New(fallback.Config{
		RedisMode:        fallback.ParseMode(envOr("FALLBACK_REDIS_MODE", "closed")),
		ControlPlaneMode: fallback.ParseMode(envOr("FALLBACK_CP_MODE", "closed")),
	})
	log.Printf("fallback modes: redis=%s, control_plane=%s",
		envOr("FALLBACK_REDIS_MODE", "closed"), envOr("FALLBACK_CP_MODE", "closed"))

	// ── OpenTelemetry (Phase 2) ──────────────────────────────────────────────
	tp, err := telemetry.InitProvider(telemetry.Config{
		Enabled:      otelEnabled,
		OTLPEndpoint: otelEndpoint,
		SampleRate:   otelSampleRate,
	})
	if err != nil {
		log.Fatalf("failed to initialize telemetry: %v", err)
	}
	defer func() {
		shutCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := tp.Shutdown(shutCtx); err != nil {
			log.Printf("telemetry shutdown error: %v", err)
		}
	}()

	tokenSvc := tokens.New(tokens.Config{
		SigningKey:      signingKey,
		RedisAddr:       redisAddr,
		FallbackService: fb,
	})
	confGate := confidence.New()
	auditWriter := audit.New()
	incidentNotifier := incident.New(incident.Config{
		WebhookURL: incidentWebhookURL,
		Timeout:    time.Duration(incidentTimeoutMS) * time.Millisecond,
	})

	// ── Human review queue (Phase 2) ──────────────────────────────────────────
	var reviewQueue *queue.Queue
	if redisAddr != "" {
		rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
		var qErr error
		reviewQueue, qErr = queue.New(rdb)
		if qErr != nil {
			log.Printf("warning: could not init review queue: %v", qErr)
			reviewQueue = queue.NewInMemory()
		} else {
			log.Printf("human review queue ready (Redis %s)", redisAddr)
		}
	} else {
		reviewQueue = queue.NewInMemory()
	}

	// ── Tenant rate limiter (Phase 2) ────────────────────────────────────────
	rl := ratelimit.New(ratelimit.Config{
		Defaults: ratelimit.TenantLimits{
			AuthChecksPerMinute: parseIntOr(envOr("TENANT_AUTH_RATE_LIMIT", "0"), 0),
			TokenMintsPerMinute: parseIntOr(envOr("TENANT_MINT_RATE_LIMIT", "0"), 0),
		},
	})
	if rl != nil {
		log.Printf("tenant rate limiter enabled (auth=%s/min, mint=%s/min)",
			envOr("TENANT_AUTH_RATE_LIMIT", "0"), envOr("TENANT_MINT_RATE_LIMIT", "0"))
	}

	// ── HTTP server ───────────────────────────────────────────────────────────
	h := server.New(eval, tokenSvc, confGate, auditWriter, reviewQueue, apiKey, server.ConfidenceConfig{
		AllowUnverifiedConfidence: allowUnverifiedConfidence,
		MissingSignalMode:         missingConfidenceMode,
	}, enforcementMode, incidentNotifier, rl, fb, tp)
	srv := server.NewHTTPServer(addr, h)

	// ── Policy sync worker (optional) ─────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if cpURL != "" {
		worker := syncer.New(syncer.Config{
			ControlPlaneURL: cpURL,
			HMACSecret:      cpHMACSecret,
			TenantID:        tenantID,
			APIKey:          apiKey,
		}, eval)
		go worker.Start(ctx)
		log.Printf("policy sync worker started → %s", cpURL)
	}

	// ── Start server ──────────────────────────────────────────────────────────
	go func() {
		log.Printf("Auth Permission Engine listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// ── Graceful shutdown ─────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down…")
	cancel()

	shutCtx, shutCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutCancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Printf("forced shutdown: %v", err)
	}

	auditWriter.Close()
	log.Println("bye")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseIntOr(value string, fallback int) int {
	v, err := strconv.Atoi(value)
	if err != nil || v <= 0 {
		return fallback
	}
	return v
}

func parseFloatOr(value string, fallback float64) float64 {
	v, err := strconv.ParseFloat(value, 64)
	if err != nil || v <= 0 {
		return fallback
	}
	return v
}

func isProductionEnv() bool {
	v := envOr("APP_ENV", envOr("ENV", ""))
	switch v {
	case "prod", "production":
		return true
	default:
		return false
	}
}
