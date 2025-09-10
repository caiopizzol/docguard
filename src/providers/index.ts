import OpenAI from 'openai'
import { ValidationResult } from '../types/config.js'

const VALIDATION_SCHEMA = {
  type: 'object',
  properties: {
    answerable: {
      type: 'string',
      enum: ['YES', 'PARTIAL', 'NO'],
    },
    confidence: {
      type: 'number',
      description: '0-1 confidence score',
    },
    path: {
      type: 'array',
      items: { type: 'string' },
      description: 'URLs visited to find answer',
    },
    reason: {
      type: 'string',
      description: 'Brief explanation',
    },
    missing: {
      type: 'array',
      items: { type: 'string' },
      description: 'What info is missing',
    },
  },
  required: ['answerable', 'confidence', 'path', 'reason'],
  additionalProperties: false,
}

export async function callProvider(
  provider: string,
  model: string,
  apiKey: string,
  question: string,
  docs: string
): Promise<ValidationResult> {
  const prompt = `Documentation URLs available:
${docs}

Task: Search these docs to answer: "${question}"

Instructions:
1. Use web_search to explore the documentation
2. Track which pages you visit
3. Determine if docs can answer the question
4. Note what's missing if incomplete`

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey })

      try {
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          tools: [
            {
              type: 'function',
              function: {
                name: 'web_search',
                description: 'Search the web for documentation content',
                parameters: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'URL to search' },
                  },
                  required: ['url'],
                },
              },
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'doc_validation',
              strict: true,
              schema: VALIDATION_SCHEMA,
            },
          },
        })

        const content = response.choices[0].message.content
        if (!content) {
          throw new Error('No response content from OpenAI')
        }

        const result = JSON.parse(content)

        return {
          question,
          ...result,
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
        // Fallback response
        return {
          question,
          answerable: 'NO',
          confidence: 0,
          path: [],
          reason: 'Failed to validate due to API error',
          missing: ['Unable to complete validation'],
        }
      }
    }

    case 'anthropic': {
      // Similar implementation
      throw new Error('Anthropic not yet implemented')
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
