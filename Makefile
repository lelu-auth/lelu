# ─────────────────────────────────────────────────────────────────────────────
# Auth Permission Engine — Makefile
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: all generate build test lint fmt docker-up docker-down clean help

# ── Tooling ───────────────────────────────────────────────────────────────────
GO          := go
PROTOC      := protoc
PROTO_DIR   := engine/proto
GEN_DIR     := engine/gen
ENGINE_DIR  := engine
BINARY      := bin/engine

# ── Default ───────────────────────────────────────────────────────────────────
all: generate build test

# ── Protobuf code generation ──────────────────────────────────────────────────
generate:
	@echo "→ Generating protobuf stubs…"
	@mkdir -p $(GEN_DIR)
	$(PROTOC) \
		--go_out=$(GEN_DIR) --go_opt=paths=source_relative \
		--go-grpc_out=$(GEN_DIR) --go-grpc_opt=paths=source_relative \
		-I $(PROTO_DIR) \
		$(PROTO_DIR)/auth.proto
	@echo "✓ Proto generation done"

# ── Build ─────────────────────────────────────────────────────────────────────
build:
	@echo "→ Building engine binary…"
	@mkdir -p bin
	cd $(ENGINE_DIR) && $(GO) build -ldflags="-s -w" -o ../$(BINARY) ./cmd/engine
	@echo "✓ Binary at $(BINARY)"

# ── Tests ─────────────────────────────────────────────────────────────────────
test:
	@echo "→ Running Go tests (race detector on)…"
	cd $(ENGINE_DIR) && $(GO) test -race -v -coverprofile=../coverage.out ./...
	@echo "✓ Tests passed"

test-short:
	cd $(ENGINE_DIR) && $(GO) test -short ./...

# ── Lint ──────────────────────────────────────────────────────────────────────
lint:
	@echo "→ Linting…"
	cd $(ENGINE_DIR) && golangci-lint run ./...

# ── Format ────────────────────────────────────────────────────────────────────
fmt:
	cd $(ENGINE_DIR) && $(GO) fmt ./...
	cd $(ENGINE_DIR) && goimports -w .

# ── Docker ────────────────────────────────────────────────────────────────────
docker-build:
	docker build -t prism/engine:latest -f engine/Dockerfile .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f engine

# ── SDK ───────────────────────────────────────────────────────────────────────
sdk-ts-install:
	cd sdk/typescript && npm install

sdk-ts-build:
	cd sdk/typescript && npm run build

sdk-ts-test:
	cd sdk/typescript && npm test

sdk-py-install:
	cd sdk/python && pip install -e ".[dev]"

sdk-py-test:
	cd sdk/python && pytest -v

# ── Clean ─────────────────────────────────────────────────────────────────────
clean:
	rm -rf bin/ coverage.out $(GEN_DIR)
	cd sdk/typescript && rm -rf node_modules dist

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  make generate      Generate protobuf Go stubs"
	@echo "  make build         Build the engine binary"
	@echo "  make test          Run tests with race detector"
	@echo "  make lint          Run golangci-lint"
	@echo "  make fmt           Format all Go code"
	@echo "  make docker-up     Start engine + Redis via docker compose"
	@echo "  make docker-down   Stop containers"
	@echo "  make sdk-ts-build  Build TypeScript SDK"
	@echo "  make sdk-py-test   Run Python SDK tests"
	@echo "  make clean         Remove build artefacts"
	@echo ""
