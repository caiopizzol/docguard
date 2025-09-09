import { DocSource, DocWorksConfig } from '../types/config.js'

export async function createSource(config: DocWorksConfig): Promise<DocSource> {
  const sourceConfig =
    typeof config.source === 'string'
      ? { type: 'llms.txt' as const, path: config.source }
      : config.source

  switch (sourceConfig.type) {
    case 'mcp': {
      const { MCPSource } = await import('./mcp.js')
      return new MCPSource(sourceConfig.server!)
    }
    case 'llms.txt':
    default: {
      const { LLMSTxtSource } = await import('./llms-txt.js')
      return new LLMSTxtSource()
    }
  }
}
