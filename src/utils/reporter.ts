import chalk from 'chalk'

export function report(results: any, verbose: boolean = false): number {
  console.log('\n' + '='.repeat(50))
  console.log(chalk.bold('\n📋 Documentation Validation Report\n'))

  let hasFailures = false
  let hasWarnings = false

  // Check critical questions
  if (results.critical && results.critical.length > 0) {
    const failed = results.critical.filter((r: any) => r.answerable === 'NO')
    const partial = results.critical.filter(
      (r: any) => r.answerable === 'PARTIAL'
    )

    if (failed.length > 0) {
      console.log(
        chalk.red.bold(`❌ Critical Questions Failing: ${failed.length}\n`)
      )
      hasFailures = true

      for (const result of failed) {
        console.log(chalk.red(`  • ${result.question}`))
        if (verbose) {
          console.log(chalk.gray(`    Reason: ${result.reason}`))
        }
      }
      console.log()
    }

    if (partial.length > 0) {
      console.log(
        chalk.yellow.bold(
          `⚠️  Critical Questions Incomplete: ${partial.length}\n`
        )
      )
      hasWarnings = true

      for (const result of partial) {
        console.log(chalk.yellow(`  • ${result.question}`))
        if (verbose) {
          console.log(chalk.gray(`    Reason: ${result.reason}`))
        }
      }
      console.log()
    }
  }

  // Check important questions
  if (results.important && results.important.length > 0) {
    const failed = results.important.filter((r: any) => r.answerable === 'NO')

    if (failed.length > 0) {
      console.log(
        chalk.yellow(`⚠️  Important Questions Missing: ${failed.length}\n`)
      )
      hasWarnings = true

      for (const result of failed) {
        console.log(chalk.yellow(`  • ${result.question}`))
      }
      console.log()
    }
  }

  // Summary
  console.log('='.repeat(50))

  if (hasFailures) {
    console.log(chalk.red('\n❌ Documentation check failed'))
    console.log('Critical questions cannot be answered from current docs\n')
    return 1 // Exit with error
  } else if (hasWarnings) {
    console.log(chalk.yellow('\n⚠️  Documentation needs improvement'))
    console.log('Some questions are not fully answerable\n')
    return 0 // Exit success (warnings don't fail by default)
  } else {
    console.log(chalk.green('\n✅ Documentation check passed'))
    console.log('All critical questions are answerable\n')
    return 0
  }
}
//*
