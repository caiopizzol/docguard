#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init.js'
import { check } from './commands/check.js'

const program = new Command()

program
  .name('docworks')
  .description('Ensure your docs work for developers and AI')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize DocWorks configuration')
  .option('-t, --template <type>', 'Template: simple or journeys', 'simple')
  .action(init)

program
  .command('check')
  .description('Validate documentation')
  .option('-c, --config <path>', 'Config file', 'docworks.yml')
  .option('-j, --journey <name>', 'Check specific journey')
  .option('-f, --format <type>', 'Output: json or terminal', 'terminal')
  .option('--provider <name>', 'Override provider')
  .option('--model <name>', 'Override model')
  .action(check)

program.parse()
