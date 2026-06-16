package handlers

import "testing"

func TestParsePagination(t *testing.T) {
	const (
		def = int64(20)
		max = int64(100)
	)

	tests := []struct {
		name       string
		limitRaw   string
		cursorRaw  string
		wantLimit  int64
		wantCursor int64
		wantErr    bool
	}{
		{name: "defaults when empty", wantLimit: def, wantCursor: 0},
		{name: "valid limit", limitRaw: "50", wantLimit: 50},
		{name: "limit clamped to max", limitRaw: "500", wantLimit: max},
		{name: "limit exactly max", limitRaw: "100", wantLimit: 100},
		{name: "limit not a number", limitRaw: "abc", wantErr: true},
		{name: "limit zero rejected", limitRaw: "0", wantErr: true},
		{name: "limit negative rejected", limitRaw: "-5", wantErr: true},
		{name: "valid cursor", cursorRaw: "30", wantLimit: def, wantCursor: 30},
		{name: "cursor zero allowed", cursorRaw: "0", wantLimit: def, wantCursor: 0},
		{name: "cursor not a number", cursorRaw: "abc", wantErr: true},
		{name: "cursor negative rejected", cursorRaw: "-1", wantErr: true},
		{name: "whitespace is trimmed", limitRaw: " 10 ", cursorRaw: " 5 ", wantLimit: 10, wantCursor: 5},
		{name: "both provided", limitRaw: "50", cursorRaw: "30", wantLimit: 50, wantCursor: 30},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			limit, cursor, err := parsePagination(tc.limitRaw, tc.cursorRaw, def, max)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got limit=%d cursor=%d", limit, cursor)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if limit != tc.wantLimit {
				t.Errorf("limit = %d, want %d", limit, tc.wantLimit)
			}
			if cursor != tc.wantCursor {
				t.Errorf("cursor = %d, want %d", cursor, tc.wantCursor)
			}
		})
	}
}
