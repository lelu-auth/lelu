// Prism Platform — Cloud Control Plane entrypoint.
//
// Environment variables:
//   LISTEN_ADDR        HTTP listen address (default: :9090)
//   DATABASE_URL       Postgres DSN (required)
//   PLATFORM_API_KEY   API key for engine → platform authentication
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prism/platform/internal/audit"
	"github.com/prism/platform/internal/db"
	"github.com/prism/platform/internal/handlers"
	"github.com/prism/platform/internal/policy"
)

func main() {
	addr := envOr("LISTEN_ADDR", ":9090")
	dsn := envOr("DATABASE_URL", "postgres://prism:prism@localhost:5432/prism?sslmode=disable")
	apiKey := envOr("PLATFORM_API_KEY", "change-me-in-production")
	oidcIssuer := envOr("OIDC_ISSUER_URL", "")
	oidcAudience := envOr("OIDC_AUDIENCE", "")

	// ── Database ──────────────────────────────────────────────────────────────
	database, err := db.Open(dsn)
	if err != nil {
		log.Fatalf("platform: db connect: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(database); err != nil {
		log.Fatalf("platform: migrate: %v", err)
	}
	log.Println("platform: database migrations applied")

	// ── Stores ────────────────────────────────────────────────────────────────
	policyStore := policy.New(database, apiKey)
	auditStore := audit.New(database)

	// ── HTTP server ───────────────────────────────────────────────────────────
	mux := http.NewServeMux()
	var oidcAuth *handlers.OIDCAuth
	if oidcIssuer != "" && oidcAudience != "" {
		auth, authErr := handlers.NewOIDCAuth(context.Background(), oidcIssuer, oidcAudience)
		if authErr != nil {
			log.Fatalf("platform: oidc init: %v", authErr)
		}
		oidcAuth = auth
		log.Printf("platform: oidc enabled (issuer=%s)", oidcIssuer)
	}
	h := handlers.New(policyStore, auditStore, apiKey, oidcAuth)
	h.RegisterRoutes(mux)

	srv := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("platform: listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("platform: server: %v", err)
		}
	}()

	// ── Graceful shutdown ─────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("platform: shutting down…")
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("platform: forced shutdown: %v", err)
	}
	log.Println("platform: bye")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
