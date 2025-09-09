import { OpenAIProvider } from './openai.js'
import { AnthropicProvider } from './anthropic.js'

export interface ValidationResult {
  answerable: 'YES' | 'PARTIAL' | 'NO'
  reason: string
  location?: string
}

export interface AIProvider {
  name: string
  checkAnswerability(question: string, docs: string): Promise<ValidationResult>
  complete(prompt: string): Promise<string>
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
