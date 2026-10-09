// After tsc (npm run build:lib): copies src/**/*.css to dist/, where the compiled components
// import them from, and css.d.ts, which tsc doesn't copy, so the type files'
// CSS imports resolve in an app that checks them.
import { cpSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith('.css') ? [join(dir, entry.name)] : [])

for (const file of files('src')) cpSync(file, file.replace(/^src/, 'dist'))
cpSync('src/css.d.ts', 'dist/css.d.ts')

// tsc drops the reference from index.d.ts, so it's added here.
const index = 'dist/index.d.ts'
writeFileSync(index, `/// <reference path="./css.d.ts" />\n${readFileSync(index, 'utf8')}`)
