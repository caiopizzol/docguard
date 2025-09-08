import OpenAI from 'openai'

export async function checkAnswerability(
  question: string,
  docs: string,
  apiKey: string
): Promise<any> {
  const openai = new OpenAI({ apiKey })

  const prompt = `You are a documentation validator. Given the documentation below, determine if it can answer the following question.

Question: "${question}"

Documentation:
${docs.substring(0, 50000)} // Limit context to avoid token limits

Analyze if someone reading this documentation could find the answer to the question.

Respond in this exact format:
ANSWER: [YES/PARTIAL/NO]
REASON: [One sentence explanation]
LOCATION: [Where the answer is found, or "Not found"]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper model for MVP
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Low temperature for consistency
      max_tokens: 150,
    })

    const content = response.choices[0].message.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse response
    const answerMatch = content.match(/ANSWER:\s*(YES|PARTIAL|NO)/)
    const reasonMatch = content.match(/REASON:\s*(.+)/)
    const locationMatch = content.match(/LOCATION:\s*(.+)/)

    return {
      answerable: answerMatch ? answerMatch[1] : 'NO',
      reason: reasonMatch ? reasonMatch[1] : 'Could not determine',
      location: locationMatch ? locationMatch[1] : 'Not found',
    }
  } catch (error) {
    console.error(`Failed to check question: ${(error as Error).message}`)
    return {
      answerable: 'ERROR',
      reason: (error as Error).message,
      location: 'N/A',
    }
  }
}
