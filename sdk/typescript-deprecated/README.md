# ⚠️ DEPRECATED PACKAGE

This package has been **renamed** and is no longer maintained.

## Migration Required

Please migrate to the new package:

```bash
# Uninstall old package
npm uninstall @lelu-auth/lelu

# Install new package
npm install lelu-agent-auth
```

## Update Your Code

Change your imports from:

```typescript
import { createClient } from "@lelu-auth/lelu";
```

To:

```typescript
import { createClient } from "lelu-agent-auth";
```

## Why the Change?

We renamed the package to:
- Remove the scoped namespace for better discoverability
- Provide a clearer, more descriptive name
- Align with our branding

## New Package

👉 **Use this instead:** [`lelu-agent-auth`](https://www.npmjs.com/package/lelu-agent-auth)

## Documentation

Visit our documentation at: https://github.com/lelu-auth/lelu

---

**This package will not receive any updates. All development continues in `lelu-agent-auth`.**
