<img width="150" height="62" alt="logo-light" src="https://github.com/user-attachments/assets/a538da6b-3443-45d3-bc25-1604ea3b31b1" />
<br/><br/>

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

See [`schema.yaml`](./schema.yaml) for the complete configuration schema with validation rules.

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

### Configurable Thresholds

Set pass/fail criteria to match your documentation maturity:

```yaml
source: https://docs.yourcompany.com

# Global threshold - fail if less than 85% questions are answerable
threshold: 85

journeys:
  authentication:
    threshold: 100 # Critical path - must be perfect
    questions:
      - How do I get API keys?
      - How do I authenticate?

  examples: # Uses global 85% threshold
    - Where are code samples?
    - Are there tutorials?
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

Journey: authentication
  Score: 75% (Threshold: 100%)
  ❌ FAILED - Below required threshold
```

## CI/CD Integration

### Progressive Validation

Different thresholds for different environments:

```yaml
# .github/workflows/docs.yml
name: Documentation Validation
on: [pull_request, push]

jobs:
  validate-pr:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate PR docs (lenient)
        run: npx docworks check --threshold 70
        env:
          DOCWORKS_SOURCE: https://preview-${{ github.event.pull_request.number }}.docs.example.com
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

  validate-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate production docs (strict)
        run: npx docworks check --threshold 95
        env:
          DOCWORKS_SOURCE: https://docs.example.com
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Multi-Model Testing

Test against multiple AI models:

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
            threshold: 90
          - provider: openai
            model: gpt-4o-mini
            threshold: 85
          - provider: anthropic
            model: claude-3-opus
            threshold: 90

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx docworks check --threshold ${{ matrix.threshold }}
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

# Validate all journeys (uses config threshold or defaults to 100%)
docworks check

# Override threshold via command line
docworks check --threshold 80

# Test specific journey
docworks check --journey authentication

# Output as JSON (includes threshold data)
docworks check --format json
```

## Exit Codes

- `0` - All thresholds met ✅
- `1` - Below threshold ❌

```bash
# Strict validation - fail on any missing docs
docworks check --threshold 100

# Allow 20% missing during initial setup
docworks check --threshold 80
```

## Progressive Adoption

Start lenient and increase strictness as your documentation improves:

1. **Initial Setup** - `threshold: 60` (allow gaps while building)
2. **Development** - `threshold: 80` (most questions answered)
3. **Staging** - `threshold: 90` (nearly complete)
4. **Production** - `threshold: 95-100` (comprehensive docs)

## Why DocWorks?

- **Real-world testing** - AI navigates docs like developers do
- **Configurable strictness** - Match your documentation maturity
- **Actionable feedback** - Know exactly what to fix
- **CI/CD ready** - Different thresholds for PR vs production
- **Progressive** - Start simple, add complexity as needed

## License

MIT
