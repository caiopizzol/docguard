interface ValidationResults {
  critical: any[]
  important: any[]
  nice_to_have: any[]
}

export function formatGitHubComment(results: ValidationResults): string {
  const criticalFailed = results.critical.filter((r) => r.answerable === 'NO')
  const criticalPartial = results.critical.filter(
    (r) => r.answerable === 'PARTIAL'
  )
  const importantFailed = results.important.filter((r) => r.answerable === 'NO')

  const hasFailures = criticalFailed.length > 0
  const hasWarnings = criticalPartial.length > 0 || importantFailed.length > 0

  let comment = '## 📋 Documentation Check Results\n\n'

  if (!hasFailures && !hasWarnings) {
    comment += '✅ **All documentation checks passed!**\n\n'
    comment += 'All critical and important questions are answerable.\n'
    return comment
  }

  if (criticalFailed.length > 0) {
    comment += '### ❌ Critical Questions Failing\n\n'
    for (const result of criticalFailed) {
      comment += `- **${result.question}**\n`
      comment += `  - ${result.reason}\n`
    }
    comment += '\n'
  }

  if (criticalPartial.length > 0) {
    comment += '### ⚠️ Critical Questions Incomplete\n\n'
    for (const result of criticalPartial) {
      comment += `- **${result.question}**\n`
      comment += `  - ${result.reason}\n`
    }
    comment += '\n'
  }

  if (importantFailed.length > 0) {
    comment += '### 📝 Important Questions Missing\n\n'
    for (const result of importantFailed) {
      comment += `- ${result.question}\n`
    }
    comment += '\n'
  }

  comment += '---\n'
  comment += hasFailures
    ? '⚠️ This check is failing. Please update the documentation to answer critical questions.'
    : '💡 This check found some improvements. Consider addressing them when possible.'

  return comment
}
