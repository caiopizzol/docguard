// Check command for DocGuard CLI
import { Detector, GitDiffer, FileChange } from '@docguard/core';
import { TerminalFormatter } from '../formatters/terminal';
import path from 'path';

export interface CheckOptions {
    path?: string;
    baseCommit?: string;
    noGit?: boolean;
}

export class CheckCommand {
    private detector: Detector;
    private formatter: TerminalFormatter;

    constructor() {
        this.detector = new Detector();
        this.formatter = new TerminalFormatter();
    }

    /**
     * Execute the check command
     */
    async execute(options: CheckOptions = {}): Promise<number> {
        try {
            const targetPath = path.resolve(options.path || process.cwd());
            const differ = new GitDiffer(targetPath);

            let changes: FileChange[];

            if (options.noGit) {
                // Check all documentation files in directory
                changes = await differ.getAllDocFiles();
                console.log('Checking documentation files in current state...\n');
            } else {
                // Check git changes
                const baseCommit = options.baseCommit || 'HEAD';
                changes = await differ.getChangedFiles(baseCommit);

                if (changes.length === 0) {
                    console.log('✅ No documentation files changed');
                    return 0;
                }

                console.log(`Checking ${changes.length} changed documentation file${changes.length === 1 ? '' : 's'}...\n`);
            }

            // Run detection
            const results = this.detector.detect(changes);

            // Format and display results
            const output = this.formatter.format(results);
            console.log(output);

            // Return exit code based on severity
            const hasCritical = results.some(r => r.severity === 'critical');
            const hasWarnings = results.some(r => r.severity === 'warning');

            if (hasCritical) {
                return 2; // Critical issues
            } else if (hasWarnings) {
                return 1; // Warnings
            } else {
                return 0; // Success
            }

        } catch (error) {
            console.error('✗ DocGuard check failed\n');

            if (error instanceof Error) {
                if (error.message.includes('Not a git repository')) {
                    console.error('  DocGuard needs a git repository to compare changes.');
                    console.error('  Initialize with: git init');
                    console.error('  Or check specific files: docguard check docs/ --no-git');
                } else {
                    console.error(`  ${error.message}`);
                }
            } else {
                console.error('  An unexpected error occurred');
            }

            return 3; // Error
        }
    }
}
