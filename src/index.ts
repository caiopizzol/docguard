#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init.js'
import { check } from './commands/check.js'
import { test } from './commands/test.js'

const program = new Command()

program
  .name('docworks')
  .description('Ensure your docs work for developers and AI')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize DocWorks configuration')
  .option('-t, --template <t>', 'Template: default, api, library', 'default')
  .option('-p, --platform <p>', 'Platform: mintlify, readme, gitbook')
  .action(init)

program
  .command('check')
  .description('Validate documentation completeness')
  .option('-c, --config <path>', 'Config file', 'docworks.yml')
  .option('-j, --journey <name>', 'Check specific journey')
  .option('--no-cache', 'Disable caching')
  .option('-f, --format <type>', 'Output: terminal, json, github', 'terminal')
  .action(check)

program
  .command('test')
  .description('Test if AI can complete tasks using your docs')
  .option('-c, --config <path>', 'Config file', 'docworks.yml')
  .option('--ai <task>', 'Task for AI to complete')
  .action(test)

program.parse()
