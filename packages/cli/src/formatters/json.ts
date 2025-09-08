// JSON output formatter for DocGuard CLI
import { DetectionResult } from '@docguard/core';

export class JSONFormatter {
    format(results: DetectionResult[]): string {
        const output = {
            version: "1.0.0",
            results: results.map(r => ({
                file: r.file,
                category: r.category,
                severity: r.severity,
                removals: r.removals.map(t => ({ term: t.value, line: t.line })),
                additions: r.additions.map(t => ({ term: t.value, line: t.line }))
            })),
            summary: {
                total: results.length,
                critical: results.filter(r => r.severity === 'critical').length,
                warnings: results.filter(r => r.severity === 'warning').length
            }
        };

        return JSON.stringify(output, null, 2);
    }
}
