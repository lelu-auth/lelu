package queue_test

import (
	"context"
	"testing"

	"github.com/lelu/engine/internal/queue"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Tests use NewInMemory (no Redis required) to validate business logic.

func TestEnqueue_NoRedis(t *testing.T) {
	q := queue.NewInMemory()
	id, err := q.Enqueue(context.Background(), "default", "invoice_bot", "approve_refund", nil, 0.75, "low confidence", "user_1")
	require.NoError(t, err)
	assert.Empty(t, id, "no-op without Redis returns empty id")
}

func TestListPending_NoRedis(t *testing.T) {
	q := queue.NewInMemory()
	items, err := q.ListPending(context.Background(), 10)
	require.NoError(t, err)
	assert.Empty(t, items)
}

func TestApprove_NoRedis(t *testing.T) {
	q := queue.NewInMemory()
	err := q.Approve(context.Background(), "fake-id", "admin", "looks good")
	assert.NoError(t, err)
}

func TestDeny_NoRedis(t *testing.T) {
	q := queue.NewInMemory()
	err := q.Deny(context.Background(), "fake-id", "admin", "too risky")
	assert.NoError(t, err)
}

func TestConstants(t *testing.T) {
	assert.Equal(t, "pending", string(queue.StatusPending))
	assert.Equal(t, "approved", string(queue.StatusApproved))
	assert.Equal(t, "denied", string(queue.StatusDenied))
}
