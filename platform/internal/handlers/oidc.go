package handlers

import (
	"context"
	"fmt"

	oidc "github.com/coreos/go-oidc/v3/oidc"
)

// OIDCAuth validates enterprise JWT access tokens issued by an OIDC provider.
type OIDCAuth struct {
	verifier *oidc.IDTokenVerifier
}

func NewOIDCAuth(ctx context.Context, issuerURL, audience string) (*OIDCAuth, error) {
	provider, err := oidc.NewProvider(ctx, issuerURL)
	if err != nil {
		return nil, fmt.Errorf("oidc: discovery failed: %w", err)
	}
	verifier := provider.Verifier(&oidc.Config{ClientID: audience})
	return &OIDCAuth{verifier: verifier}, nil
}

func (o *OIDCAuth) Verify(ctx context.Context, rawToken string) error {
	_, err := o.verifier.Verify(ctx, rawToken)
	if err != nil {
		return fmt.Errorf("oidc: token verification failed: %w", err)
	}
	return nil
}
