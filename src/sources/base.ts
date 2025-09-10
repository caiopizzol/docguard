import { DocSource, DocWorksConfig } from '../types/config.js'

export async function createSource(config: DocWorksConfig): Promise<DocSource> {
  const source = config.source

  // URL - use llms.txt
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const { LLMSTxtSource } = await import('./llms-txt.js')
    return new LLMSTxtSource(source)
  }

  // Local path - read markdown files
  const { LocalSource } = await import('./local.js')
  return new LocalSource(source)
}
