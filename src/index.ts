#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init.js'
import { check } from './commands/check.js'

const program = new Command()

program
  .name('docguard')
  .description('Ensure your docs answer critical questions')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize DocGuard configuration')
  .option(
    '-t, --template <type>',
    'Use template (api, library, default)',
    'default'
  )
  .action(init)

program
  .command('check')
  .description('Check if docs answer configured questions')
  .option('-c, --config <path>', 'Config file path', 'docguard.yml')
  .option('--no-cache', 'Disable caching')
  .option('--verbose', 'Show detailed output')
  .action(check)

program.parse()
