#!/bin/bash
# Build the Lelu CLI for Python SDK

echo "Building Lelu CLI with Docker..."
docker build -t lelu-python-cli .

echo "CLI built successfully! Usage:"
echo "  docker run --rm lelu-python-cli audit-log    # View audit events"
echo "  docker run --rm lelu-python-cli help         # Show help"
echo ""
echo "With environment variables:"
echo "  docker run --rm -e LELU_PLATFORM_URL=http://host.docker.internal:3001 lelu-python-cli audit-log"