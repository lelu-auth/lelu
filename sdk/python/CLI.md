# Lelu Python SDK CLI

The Lelu Python SDK includes a built-in CLI for viewing audit logs and other utilities.

## Installation

```bash
pip install lelu-agent-auth-sdk
```

## Usage

### View Audit Logs

```bash
lelu audit-log
```

### Help

```bash
lelu help
```

## Docker Usage

If you prefer to use Docker:

```bash
# Build the CLI image
docker build -t lelu-python-cli .

# Run audit-log command
docker run --rm lelu-python-cli audit-log

# Run with custom environment variables
docker run --rm -e LELU_PLATFORM_URL=http://host.docker.internal:3001 lelu-python-cli audit-log
```

## Environment Variables

- `LELU_PLATFORM_URL` - Platform API URL (default: http://localhost:3001)
- `LELU_AUDIT_LIMIT` - Number of events to fetch (default: 20)

## Examples

```bash
# View recent audit events
lelu audit-log

# View 50 recent events
LELU_AUDIT_LIMIT=50 lelu audit-log

# Use custom platform URL
LELU_PLATFORM_URL=https://api.example.com lelu audit-log
```

## Requirements

- Python 3.11+
- The Lelu platform service must be running (not just the engine)
- Network access to the platform API