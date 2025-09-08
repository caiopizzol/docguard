#!/usr/bin/env node

// DocGuard CLI Entry Point
import { CheckCommand } from './commands/check';
import { InitCommand } from './commands/init';

const args = process.argv.slice(2);

function getOption(args: string[], flag: string): string | undefined {
    const index = args.findIndex(arg => arg.startsWith(flag + '='));
    if (index !== -1) {
        return args[index].split('=')[1];
    }
    const flagIndex = args.findIndex(arg => arg === flag);
    return flagIndex !== -1 ? args[flagIndex + 1] : undefined;
}

async function main() {
    const command = args[0] || 'check';

    switch (command) {
        case 'check':
            const checkCommand = new CheckCommand();
            const format = args.includes('--format=json') ? 'json' as const : 'terminal' as const;
            const options = {
                path: args.find(arg => !arg.startsWith('-')),
                noGit: args.includes('--no-git'),
                baseCommit: getOption(args, '--base'),
                format
            };
            const exitCode = await checkCommand.execute(options);
            process.exit(exitCode);
            break;

        case 'init':
            const initCommand = new InitCommand();
            initCommand.execute();
            process.exit(0);
            break;

        case '--version':
        case '-v':
            const packageJson = require('../package.json');
            console.log(packageJson.version);
            process.exit(0);
            break;

        case '--help':
        case '-h':
        case 'help':
            printHelp();
            process.exit(0);
            break;

        default:
            console.error(`Unknown command: ${command}`);
            console.error('Run "docguard --help" for usage information');
            process.exit(1);
    }
}

function printHelp() {
    console.log(`
DocGuard - Documentation regression detection

Usage:
  docguard [command] [options]

Commands:
  check [path]     Check for documentation regressions (default)
  init             Create a docguard.yml configuration file

Options:
  --no-git         Check files without git comparison
  --base <commit>  Compare against specific commit (default: HEAD)
  --format=json    Output results in JSON format
  --version, -v    Show version number
  --help, -h       Show this help message

Examples:
  docguard check           # Check current directory
  docguard check docs/     # Check specific path
  docguard check --no-git  # Check without git
  docguard init            # Create config file
  docguard --version       # Show version
`);
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Run the CLI
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
