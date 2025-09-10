<img width="150" height="62" alt="logo-light" src="https://github.com/user-attachments/assets/a538da6b-3443-45d3-bc25-1604ea3b31b1" />
<br/><br/>

Ensure your docs work for developers and AI. Validates that critical questions can be answered from your documentation.

## Quick Start

```bash
# Install globally
npm install -g docworks

# Initialize for your platform
docworks init --platform mintlify

# Edit docworks.yml with your docs URL
# source: https://docs.yourcompany.com

# Run validation
OPENAI_API_KEY=sk-... docworks check
```

## How It Works

1. **Point to your docs** - Provide your documentation URL
2. **Define journeys** - What must developers accomplish?
3. **AI validates** - Can these journeys be completed?
4. **Get results** - See what's missing

## Supported Platforms

DocWorks automatically detects and fetches documentation from:

- **Mintlify** - via llms.txt
- **ReadMe** - via llms.txt
- **GitBook** - via llms.txt
- **Any site with llms.txt** - [llmstxt.org](https://llmstxt.org)
- **Local folders** - for private docs

## Configuration

```yaml
# docworks.yml
source: https://docs.yourcompany.com # Your docs URL

journeys:
  authentication:
    - How do I authenticate?
    - Where do I get API keys?
    - What are the rate limits?

provider: openai # or anthropic
model: gpt-4o-mini
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
      - run: npx docworks check
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Templates

```bash
# For documentation platforms
docworks init --platform mintlify
docworks init --platform readme
docworks init --platform gitbook

# For local documentation
docworks init --platform local
```

## Local Documentation

For private or local documentation:

```yaml
source: ./docs # Path to folder with .md/.mdx files

journeys:
  internal:
    - How do I deploy?
    - Where are the runbooks?
```

## FAQ

**Q: What if my platform doesn't have llms.txt?**  
A: Use local mode by pointing to your docs folder, or ask your platform to support [llmstxt.org](https://llmstxt.org)

**Q: How does it fetch online docs?**  
A: DocWorks looks for `/llms.txt` at your docs URL, which lists all documentation pages

**Q: Can I test private documentation?**  
A: Yes, use local mode with `source: ./docs`

## License

MIT
