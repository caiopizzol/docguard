import chalk from 'chalk'
import { JourneyResults } from '../types/config.js'

export function formatReport(results: JourneyResults, github = false): number {
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

  // Format output
  if (github) {
    return formatGitHub(results, score)
  }

  // Terminal output
  console.log('\n' + '═'.repeat(50))
  console.log(chalk.bold('\n📋 Documentation Validation Report\n'))

  for (const [journey, questions] of Object.entries(results)) {
    const failed = questions.filter((q) => q.answerable === 'NO')
    const partial = questions.filter((q) => q.answerable === 'PARTIAL')
    const success = questions.filter((q) => q.answerable === 'YES')

    const journeyScore = Math.round((success.length / questions.length) * 100)
    const color =
      journeyScore >= 80
        ? chalk.green
        : journeyScore >= 50
          ? chalk.yellow
          : chalk.red

    console.log(chalk.bold(`Journey: ${journey}`))
    console.log(color(`  Score: ${journeyScore}%`))
    console.log(`  ✅ Complete: ${success.length}`)
    if (partial.length > 0) console.log(`  ⚠️  Partial: ${partial.length}`)
    if (failed.length > 0) {
      console.log(`  ❌ Missing: ${failed.length}`)
      for (const q of failed) {
        console.log(chalk.red(`     • ${q.question}`))
      }
    }
    console.log()
  }

  // Summary
  console.log('═'.repeat(50))
  console.log(chalk.bold(`\n📊 Overall Score: ${score}/100\n`))

  if (score >= 80) {
    console.log(chalk.green('✅ Documentation is AI-ready!'))
    console.log('Developers and AI agents can successfully use your docs.\n')
    return 0
  } else if (score >= 50) {
    console.log(chalk.yellow('⚠️  Documentation needs improvement'))
    console.log('Some journeys cannot be completed.\n')
    return 0
  } else {
    console.log(chalk.red('❌ Documentation is incomplete'))
    console.log('Many developer journeys will fail.\n')
    return 1
  }
}

function formatGitHub(results: JourneyResults, score: number): number {
  // GitHub PR comment format
  console.log('## 📋 Documentation Check Results\n')
  console.log(`**Score: ${score}/100**\n`)

  for (const [journey, questions] of Object.entries(results)) {
    const failed = questions.filter((q) => q.answerable === 'NO')
    if (failed.length > 0) {
      console.log(`### ❌ Journey: ${journey}`)
      for (const q of failed) {
        console.log(`- ${q.question}`)
      }
      console.log()
    }
  }

  if (score < 50) {
    console.log('⚠️ **This check is failing.** Documentation is incomplete.')
    return 1
  }

  return 0
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
