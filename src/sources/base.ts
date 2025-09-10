import { DocSource, DocWorksConfig } from '../types/config.js'

export async function createSource(config: DocWorksConfig): Promise<DocSource> {
  const source = config.source

  // URL - use llms.txt
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const { LLMSTxtSource } = await import('./llms-txt.js')
    return new LLMSTxtSource(source)
  }

  throw new Error(`Unsupported source: ${source}`)
}
