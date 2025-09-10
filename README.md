# DocWorks

Ensure your docs work for developers and AI. Tests if humans and AI agents can actually accomplish tasks using your documentation.

## Quick Start

```bash
# Install
npm install -g docworks

# Initialize
docworks init

# Run validation
OPENAI_API_KEY=sk-... docworks check
```

## How It Works

DocWorks tests documentation the way developers actually use it - by having AI search and navigate your docs to answer questions:

1. **AI explores your docs** - Uses web search to navigate pages
2. **Tracks the journey** - Records which pages were visited
3. **Reports confidence** - Shows how easily answers were found
4. **Identifies gaps** - Lists exactly what's missing

## Configuration

### Simple Questions

```yaml
# docworks.yml
source: https://docs.yourcompany.com

questions:
  - How do I authenticate?
  - What are the rate limits?
  - Where are code examples?

provider: openai
model: gpt-4o-mini
```

### Journey Validation

```yaml
source: https://docs.yourcompany.com

journeys:
  authentication:
    - How do I get API keys?
    - How do I authenticate requests?
    - How do I handle token refresh?

  error_handling:
    - What are the error codes?
    - How do I retry failed requests?

provider: openai
model: gpt-4o-mini
```

## Rich Feedback

Instead of simple YES/NO, get actionable insights:

```
⚠️ How do I authenticate?
   Confidence: 60%
   Searched: 3 pages
   Missing:
     - API key generation steps
     - Token refresh documentation
```

## Multi-Model Testing

Test against multiple AI models using CI/CD:

```yaml
# .github/workflows/docs.yml
name: Documentation Validation
on: [pull_request]

jobs:
  validate:
    strategy:
      matrix:
        include:
          - provider: openai
            model: gpt-4o
          - provider: openai
            model: gpt-4o-mini
          - provider: anthropic
            model: claude-3-opus

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx docworks check
        env:
          PROVIDER: ${{ matrix.provider }}
          MODEL: ${{ matrix.model }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Supported Documentation

- **Public docs** - Any site with [llms.txt](https://llmstxt.org)
- **Platforms** - Mintlify, ReadMe, GitBook

## Commands

```bash
# Initialize config
docworks init

# Validate all journeys
docworks check

# Test specific journey
docworks check --journey authentication

# Output as JSON
docworks check --format json
```

## Why DocWorks?

- **Real-world testing** - AI navigates docs like developers do
- **Actionable feedback** - Know exactly what to fix
- **CI/CD ready** - Catch doc regressions before merge
- **Progressive** - Start simple, add complexity as needed

## License

MIT
