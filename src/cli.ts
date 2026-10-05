#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { loadValidationContext, readAnalysisFile } from './validation/context.js'
import { validateAnalysis } from './validation/validator.js'

function collectJsonFiles(path: string): string[] {
  const absolute = resolve(path)
  if (statSync(absolute).isFile()) return [absolute]
  const files: string[] = []
  for (const name of readdirSync(absolute).sort()) {
    const child = join(absolute, name)
    if (statSync(child).isDirectory()) files.push(...collectJsonFiles(child))
    else if (name.endsWith('.json')) files.push(child)
  }
  return files
}

function printUsage(): void {
  console.log(`Usage:
  npm run validate
  npm run validate -- <file-or-directory> [...]

The default target is data/golden-candidates.`)
}

const [command, ...targets] = process.argv.slice(2)
if (command !== 'validate') {
  printUsage()
  process.exit(command ? 2 : 0)
}

const ctx = loadValidationContext()
const requested = targets.length > 0 ? targets : [join(ctx.rootDir, 'data', 'golden-candidates')]
const files = requested.flatMap(collectJsonFiles)

if (files.length === 0) {
  console.error('No JSON analysis records found.')
  process.exit(2)
}

let failed = 0
let warningCount = 0

for (const file of files) {
  const record = readAnalysisFile(file)
  const report = validateAnalysis(record, ctx)
  const display = relative(ctx.rootDir, file)
  const state = report.valid ? (report.warnings > 0 ? 'PASS+WARN' : 'PASS') : 'FAIL'
  console.log(`${state} ${display} (${report.errors} errors, ${report.warnings} warnings)`)

  for (const item of report.findings) {
    const prefix = item.severity === 'error' ? 'ERROR' : item.severity === 'warning' ? 'WARN' : 'INFO'
    console.log(`  ${prefix} ${item.code} ${item.path}: ${item.message}`)
  }

  if (!report.valid) failed += 1
  warningCount += report.warnings
}

console.log(`Validated ${files.length} record(s): ${files.length - failed} passed, ${failed} failed, ${warningCount} warning(s).`)
process.exit(failed === 0 ? 0 : 1)
