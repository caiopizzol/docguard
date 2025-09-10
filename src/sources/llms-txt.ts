import { DocSource } from '../types/config.js'

export class LLMSTxtSource implements DocSource {
  name: string
  private llmsTxtContent: string = ''

  constructor(private url: string) {
    this.name = `llms.txt from ${new URL(url).hostname}`
  }

  async fetch(): Promise<string> {
    try {
      // Just fetch the llms.txt file
      const llmsTxtUrl = new URL('/llms.txt', this.url).href

      console.log(`Fetching ${llmsTxtUrl}...`)
      const response = await fetch(llmsTxtUrl)

      if (!response.ok) {
        // Maybe they provided the llms.txt URL directly
        const directResponse = await fetch(this.url)
        if (!directResponse.ok) {
          throw new Error(`No llms.txt found at ${this.url}`)
        }
        this.llmsTxtContent = await directResponse.text()
      } else {
        this.llmsTxtContent = await response.text()
      }

      console.log('✓ Fetched llms.txt index\n')
      return this.llmsTxtContent
    } catch (error: any) {
      throw new Error(
        `Failed to fetch llms.txt from ${this.url}: ${error.message}`
      )
    }
  }

  // New method to fetch specific URLs on demand
  async fetchUrl(url: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)
    return response.text()
  }
}
