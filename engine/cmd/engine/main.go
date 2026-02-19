package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prism/engine/internal/audit"
	"github.com/prism/engine/internal/confidence"
	"github.com/prism/engine/internal/evaluator"
	"github.com/prism/engine/internal/queue"
	"github.com/prism/engine/internal/server"
	syncer "github.com/prism/engine/internal/sync"
	"github.com/prism/engine/internal/tokens"
	"github.com/redis/go-redis/v9"
)

func main() {
	// ── Config from environment ──────────────────────────────────────────────
	addr := envOr("LISTEN_ADDR", ":8080")
	policyPath := envOr("POLICY_PATH", "/etc/prism/auth.yaml")
	redisAddr := envOr("REDIS_ADDR", "")
	signingKey := envOr("JWT_SIGNING_KEY", "change-me-in-production")
	cpURL := envOr("CONTROL_PLANE_URL", "")
	cpHMACSecret := envOr("CP_HMAC_SECRET", "")

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

	tokenSvc := tokens.New(tokens.Config{
		SigningKey: signingKey,
		RedisAddr:  redisAddr,
	})
	confGate := confidence.New()
	auditWriter := audit.New()

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

	// ── HTTP server ───────────────────────────────────────────────────────────
	h := server.New(eval, tokenSvc, confGate, auditWriter, reviewQueue)
	srv := server.NewHTTPServer(addr, h)

	// ── Policy sync worker (optional) ─────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if cpURL != "" {
		worker := syncer.New(syncer.Config{
			ControlPlaneURL: cpURL,
			HMACSecret:      cpHMACSecret,
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
