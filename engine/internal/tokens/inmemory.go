package tokens

import (
	"context"
	"sync"
	"time"
)

// inMemoryCache provides a TTL-based in-memory cache for token IDs.
// Used as a fallback when Redis is unavailable and FALLBACK_REDIS_MODE=open.
type inMemoryCache struct {
	mu    sync.RWMutex
	items map[string]time.Time // tokenID -> expiration time
}

func newInMemoryCache() *inMemoryCache {
	c := &inMemoryCache{
		items: make(map[string]time.Time),
	}
	// Start background cleanup goroutine
	go c.cleanup()
	return c
}

// Set stores a token ID with the given TTL.
func (c *inMemoryCache) Set(_ context.Context, tokenID string, ttl time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[tokenID] = time.Now().Add(ttl)
	return nil
}

// Exists checks if a token ID exists and hasn't expired.
func (c *inMemoryCache) Exists(_ context.Context, tokenID string) (bool, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	exp, ok := c.items[tokenID]
	if !ok {
		return false, nil
	}
	if time.Now().After(exp) {
		return false, nil
	}
	return true, nil
}

// Delete removes a token ID from the cache.
func (c *inMemoryCache) Delete(_ context.Context, tokenID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, tokenID)
	return nil
}

// cleanup periodically removes expired entries.
func (c *inMemoryCache) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for id, exp := range c.items {
			if now.After(exp) {
				delete(c.items, id)
			}
		}
		c.mu.Unlock()
	}
}
