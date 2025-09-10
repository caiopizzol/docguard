import { DocSource } from '../types/config.js'

export class LLMSTxtSource implements DocSource {
  name: string

  constructor(private url: string) {
    this.name = `llms.txt from ${new URL(url).hostname}`
  }

  async fetch(): Promise<string> {
    try {
      // Try to fetch llms.txt from the domain
      const llmsTxtUrl = new URL('/llms.txt', this.url).href

      console.log(`Fetching ${llmsTxtUrl}...`)
      const response = await fetch(llmsTxtUrl)

      if (!response.ok) {
        // Maybe they provided the llms.txt URL directly
        const directResponse = await fetch(this.url)
        if (!directResponse.ok) {
          throw new Error(`No llms.txt found at ${this.url}`)
        }
        return await this.fetchFromLLMSTxt(await directResponse.text())
      }

      return await this.fetchFromLLMSTxt(await response.text())
    } catch (error: any) {
      throw new Error(
        `Failed to fetch documentation from ${this.url}\n` +
          `Ensure the site has an llms.txt file.\n` +
          `Error: ${error.message}`
      )
    }
  }

  private async fetchFromLLMSTxt(content: string): Promise<string> {
    // Parse llms.txt format (lines starting with # are comments)
    const urls = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .filter((line) => line.startsWith('http'))

    if (urls.length === 0) {
      throw new Error('No documentation URLs found in llms.txt')
    }

    console.log(`Found ${urls.length} documentation URLs`)

    // Fetch all documentation URLs in parallel
    const docs = await Promise.all(
      urls.map(async (url, i) => {
        try {
          console.log(`  Fetching (${i + 1}/${urls.length}): ${url}`)
          const response = await fetch(url)
          if (!response.ok) {
            console.warn(`  ⚠️  Failed to fetch: ${url}`)
            return null
          }
          const content = await response.text()
          return `\n=== ${url} ===\n${content}`
        } catch (error) {
          console.warn(`  ⚠️  Error fetching ${url}: ${error}`)
          return null
        }
      })
    )

    const validDocs = docs.filter(Boolean)

    if (validDocs.length === 0) {
      throw new Error('Could not fetch any documentation from llms.txt URLs')
    }

    console.log(`Successfully fetched ${validDocs.length} documents\n`)
    return validDocs.join('\n\n')
  }
}
