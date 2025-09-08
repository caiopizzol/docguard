<img width="250" height="70" alt="logo-light" src="https://github.com/user-attachments/assets/ab45ecc7-adad-42e2-84bd-a87145fbc01b" />
<br/><br/>

Ensure your docs answer critical questions. AI-powered validation that checks if developers can actually find what they need.

## The Problem

Your docs mention "authentication" 50 times, but developers still can't figure out HOW to authenticate. Keywords exist, but answers are fragmented across pages. Support tickets spike.

## How It Works

Define what questions your docs must answer. DocGuard uses AI to verify they remain answerable after every change.

```yaml
# docguard.yml
questions:
  critical:
    - How do I authenticate?
    - What are the rate limits?
    - How do I handle errors?
```

## Install

```bash
npm install -g docguard
```

## Quick Start

```bash
# 1. Initialize with smart defaults
docguard init

# 2. Check your docs (with your OpenAI key)
OPENAI_API_KEY=sk-... docguard check
```

Output:

```
✅ How do I authenticate?
✅ What are the rate limits?
❌ How do I handle errors?

Documentation check failed:
Critical questions cannot be answered from current docs
```

## CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Documentation Check
on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx docguard check
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Configuration

```yaml
# docguard.yml
questions:
  critical: # These block PRs if unanswerable
    - How do I install this?
    - How do I authenticate?

  important: # These warn but don't block
    - How do I debug issues?
    - What are the rate limits?

  nice_to_have: # Informational only
    - Are there TypeScript types?

# Optional: Use your preferred AI provider
provider: openai # or anthropic, azure
model: gpt-4o-mini
```

## Templates

Start quickly with pre-built templates:

```bash
# API documentation
docguard init --template api

# NPM package
docguard init --template library

# Internal platform
docguard init --template internal
```

## Why DocGuard?

- **Explicit control** - You define what matters, not magic patterns
- **AI-powered** - Understands context, not just keywords
- **Progressive adoption** - Start advisory, enable blocking when ready
- **Provider flexible** - OpenAI, Anthropic, Azure (BYO keys)
- **Fast** - Cached responses, parallel validation

## Examples

### API Documentation

```yaml
questions:
  critical:
    - How do I authenticate with the API?
    - What are the API endpoints?
    - How do I handle errors?
```

### Library/Package

```yaml
questions:
  critical:
    - How do I install this package?
    - How do I import and use it?
    - What's a basic example?
```

### Internal Docs

```yaml
questions:
  critical:
    - How do I get access?
    - Who do I contact for help?
    - Where are the runbooks?
```

## How It Really Works

1. **You define questions** your docs must answer
2. **DocGuard reads** all your documentation
3. **AI validates** each question is answerable
4. **CI/CD enforces** on every PR

No keyword matching. No regex patterns. Just: "Can a developer find this answer?"

## Requirements

- Node.js 16+
- OpenAI API key (or Anthropic, Azure)
- Documentation in Markdown

## Pricing

- **DocGuard**: Free, open source, MIT licensed
- **AI costs**: ~$0.01 per check with caching (you pay provider directly)

## Development

```bash
# Clone and install
git clone https://github.com/caiopizzol/docguard
cd docguard
npm install

# Run locally
npm run dev

# Run tests
npm test
```

## FAQ

**Q: Will this block my PRs?**  
A: Not by default. Starts in advisory mode. Enable blocking when ready.

**Q: What if the AI is wrong?**  
A: Adjust confidence thresholds, use advisory mode, or override specific questions.

**Q: Can I use this with private docs?**  
A: Yes. Runs in your CI with your API keys. Docs never leave your infrastructure.

**Q: Does it support other languages?**  
A: Currently Markdown/MDX. More formats coming soon.

## License

MIT

## Links

- [Documentation](https://docguard.dev)
- [GitHub](https://github.com/caiopizzol/docguard)
- [NPM](https://npmjs.com/package/docguard)
