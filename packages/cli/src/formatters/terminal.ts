// Terminal output formatter for DocGuard CLI
import { DetectionResult } from '@docguard/core';

export class TerminalFormatter {
    /**
     * Format detection results for terminal output
     */
    format(results: DetectionResult[]): string {
        if (results.length === 0) {
            return '✅ No documentation regressions detected\n';
        }

        const output: string[] = [];
        const groupedResults = this.groupByCategory(results);

        for (const [category, categoryResults] of Object.entries(groupedResults)) {
            output.push(this.formatCategory(category, categoryResults));
        }

        // Add summary
        const warnings = results.filter(r => r.severity === 'warning').length;
        const critical = results.filter(r => r.severity === 'critical').length;
        const info = results.filter(r => r.severity === 'info').length;

        output.push(this.formatSummary(warnings, critical, info));

        return output.join('\n\n') + '\n';
    }

    /**
     * Group results by category
     */
    private groupByCategory(results: DetectionResult[]): Record<string, DetectionResult[]> {
        const grouped: Record<string, DetectionResult[]> = {};

        for (const result of results) {
            if (!grouped[result.category]) {
                grouped[result.category] = [];
            }
            grouped[result.category].push(result);
        }

        return grouped;
    }

    /**
     * Format a category of results
     */
    private formatCategory(category: string, results: DetectionResult[]): string {
        const severity = this.getCategorySeverity(results);
        const icon = this.getSeverityIcon(severity);
        const title = this.formatCategoryTitle(category);

        const output: string[] = [];
        output.push(`${icon} ${title} information may have been removed`);
        output.push('');

        for (const result of results) {
            output.push(this.formatFileResult(result));
        }

        const totalRemovals = results.reduce((sum, r) => sum + r.removals.length, 0);
        const totalAdditions = results.reduce((sum, r) => sum + r.additions.length, 0);

        if (totalRemovals > 0) {
            output.push(`  This change removed ${totalRemovals} ${severity} term${totalRemovals === 1 ? '' : 's'}. Please verify this is intentional.`);
        }

        return output.join('\n');
    }

    /**
     * Format results for a single file
     */
    private formatFileResult(result: DetectionResult): string {
        const output: string[] = [];
        output.push(`  ${result.file}:`);

        // Show removals
        for (const removal of result.removals) {
            output.push(`    - Removed: "${removal.value}" (line ${removal.line})`);
        }

        // Show additions (possible replacements)
        for (const addition of result.additions) {
            output.push(`    + Possible replacement: "${addition.value}" (line ${addition.line})`);
        }

        return output.join('\n');
    }

    /**
     * Get the highest severity in a category
     */
    private getCategorySeverity(results: DetectionResult[]): string {
        const severities = results.map(r => r.severity);

        if (severities.includes('critical')) return 'critical';
        if (severities.includes('warning')) return 'warning';
        return 'info';
    }

    /**
     * Get icon for severity level
     */
    private getSeverityIcon(severity: string): string {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '•';
        }
    }

    /**
     * Format category title (convert snake_case to Title Case)
     */
    private formatCategoryTitle(category: string): string {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Format summary line
     */
    private formatSummary(warnings: number, critical: number, info: number): string {
        const parts: string[] = [];

        if (critical > 0) {
            parts.push(`${critical} critical issue${critical === 1 ? '' : 's'}`);
        }
        if (warnings > 0) {
            parts.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);
        }
        if (info > 0) {
            parts.push(`${info} info item${info === 1 ? '' : 's'}`);
        }

        if (parts.length === 0) {
            return '';
        }

        return parts.join(', ') + ' found';
    }
}
