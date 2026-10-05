#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { RgblRepositoryProvider } from './source-provider/rgbl-repository.js'
import { verifyAnalysisSources } from './source-provider/verify.js'
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
  npm run verify:source -- <analysis-file> --provider-root <path-to-rocksoul-rgbl>

The default validation target is data/golden-candidates.`)
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

async function runValidate(targets: string[]): Promise<number> {
  const ctx = loadValidationContext()
  const requested = targets.length > 0 ? targets : [join(ctx.rootDir, 'data', 'golden-candidates')]
  const files = requested.flatMap(collectJsonFiles)
  if (files.length === 0) {
    console.error('No JSON analysis records found.')
    return 2
  }

  let failed = 0
  let warningCount = 0
  for (const file of files) {
    const report = validateAnalysis(readAnalysisFile(file), ctx)
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
  return failed === 0 ? 0 : 1
}

async function runVerifySource(args: string[]): Promise<number> {
  const file = args.find((arg) => !arg.startsWith('--') && arg !== option(args, '--provider-root'))
  const providerRoot = option(args, '--provider-root')
  if (!file || !providerRoot) {
    printUsage()
    return 2
  }

  const provider = new RgblRepositoryProvider({ rootDir: providerRoot })
  const record = readAnalysisFile(file)
  const report = await verifyAnalysisSources(record, new Map([[provider.id, provider]]))
  const state = report.valid ? (report.warnings > 0 ? 'PASS+WARN' : 'PASS') : 'FAIL'
  console.log(`${state} live source verification (${report.errors} errors, ${report.warnings} warnings)`)
  console.log(`  ${report.verifiedBindings} binding(s), ${report.verifiedResources} resource(s), ${report.verifiedSelectors} selector(s) verified.`)
  for (const item of report.findings) {
    const prefix = item.severity === 'error' ? 'ERROR' : item.severity === 'warning' ? 'WARN' : 'INFO'
    console.log(`  ${prefix} ${item.code} ${item.path}: ${item.message}`)
  }
  return report.valid ? 0 : 1
}

async function main(): Promise<number> {
  const [command, ...args] = process.argv.slice(2)
  if (command === 'validate') return runValidate(args)
  if (command === 'verify-source') return runVerifySource(args)
  printUsage()
  return command ? 2 : 0
}

process.exit(await main())
