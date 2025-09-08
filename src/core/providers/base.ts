import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

export interface ValidationResult {
  answerable: 'YES' | 'PARTIAL' | 'NO' | 'ERROR'
  reason: string
  location?: string
}

export interface AIProvider {
  name: string
  checkAnswerability(question: string, docs: string): Promise<ValidationResult>
}

export function createProvider(
  provider: string,
  apiKey: string,
  model?: string
): AIProvider {
  switch (provider) {
    case 'anthropic': {
      return new AnthropicProvider(apiKey, model)
    }
    case 'openai':
    default: {
      return new OpenAIProvider(apiKey, model)
    }
  }
}
