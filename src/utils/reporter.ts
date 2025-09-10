import { JourneyResults } from '../types/config.js'

export function formatReport(results: JourneyResults): number {
  let totalQuestions = 0
  let answeredQuestions = 0
  let partialQuestions = 0
  const failedJourneys: string[] = []

  // Calculate stats
  for (const [journey, questions] of Object.entries(results)) {
    const answered = questions.filter((q) => q.answerable === 'YES').length
    const partial = questions.filter((q) => q.answerable === 'PARTIAL').length
    const failed = questions.filter((q) => q.answerable === 'NO').length

    totalQuestions += questions.length
    answeredQuestions += answered
    partialQuestions += partial

    if (failed > 0) {
      failedJourneys.push(journey)
    }
  }

  const score = Math.round((answeredQuestions / totalQuestions) * 100)

  // Terminal output
  console.log('\n' + '='.repeat(50))
  console.log('\nDocumentation Validation Report\n')

  for (const [journey, questions] of Object.entries(results)) {
    console.log(`Journey: ${journey}`)
    console.log('─'.repeat(40))

    for (const q of questions) {
      const icon =
        q.answerable === 'YES' ? '✅' : q.answerable === 'PARTIAL' ? '⚠️' : '❌'

      console.log(`${icon} ${q.question}`)
      console.log(`   Confidence: ${Math.round(q.confidence * 100)}%`)
      console.log(`   Path: ${q.path.length} pages searched`)

      if (q.missing && q.missing.length > 0) {
        console.log(`   Missing:`)
        q.missing.forEach((m) => console.log(`     - ${m}`))
      }
    }
    console.log()
  }

  // Summary
  console.log('='.repeat(50))
  console.log(`\nOverall Score: ${score}/100\n`)

  if (score >= 80) {
    console.log('Documentation is AI-ready!')
    console.log('Developers and AI agents can successfully use your docs.\n')
    return 0
  } else if (score >= 50) {
    console.log('Documentation needs improvement')
    console.log('Some journeys cannot be completed.\n')
    return 0
  } else {
    console.log('Documentation is incomplete')
    console.log('Many developer journeys will fail.\n')
    return 1
  }
}

export function formatJSON(results: JourneyResults, source: string): string {
  const stats = {
    total: 0,
    answered: 0,
    partial: 0,
    missing: 0,
  }

  for (const questions of Object.values(results)) {
    stats.total += questions.length
    stats.answered += questions.filter((q) => q.answerable === 'YES').length
    stats.partial += questions.filter((q) => q.answerable === 'PARTIAL').length
    stats.missing += questions.filter((q) => q.answerable === 'NO').length
  }

  return JSON.stringify(
    {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source,
      score: Math.round((stats.answered / stats.total) * 100),
      stats,
      results,
    },
    null,
    2
  )
}
