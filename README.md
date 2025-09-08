# DocGuard

Documentation regression detection tool - catch when critical information disappears from your docs.

## Installation

```bash
# Global install (recommended)
npm install -g docguard

# Project dependency
npm install --save-dev docguard

# Run without install
npx docguard check
```

## Usage

```bash
# Check current directory
docguard check

# Check specific path
docguard check docs/

# Check without git comparison
docguard check --no-git

# Compare against specific commit
docguard check --base HEAD~1
```

## How it Works

DocGuard analyzes your documentation changes and alerts you when important information might have been removed:

- **API keys and authentication** - Never accidentally remove auth docs
- **Error codes and status codes** - Keep error documentation complete  
- **Rate limits and quotas** - Preserve important usage information
- **Endpoints and parameters** - Track API documentation changes

## Example Output

```
⚠️  Authentication information may have been removed

  docs/api/auth.md:
    - Removed: "API key" (line 45)
    - Removed: "Bearer token" (line 47)
    + Possible replacement: "access token" (line 48)

  This change removed 2 critical terms. Please verify this is intentional.

1 warning found
```

## Development

This is a TypeScript monorepo. To work on DocGuard:

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Test the CLI locally
npm run dev check ../test-repo/docs
```

## License

MIT
