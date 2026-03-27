/**
 * Nitropack runtime imports `#nitro-internal-virtual/*` modules that Rollup inlines
 * during build. Raw Node resolution (preview, tooling, some runners) needs `imports`
 * in nitropack/package.json — add minimal fallbacks for the ones that break locally.
 */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

let nitroPkgPath
try {
  nitroPkgPath = require.resolve('nitropack/package.json')
} catch {
  process.exit(0)
}

const nitroRoot = dirname(nitroPkgPath)
const internalDir = join(nitroRoot, 'dist/runtime/internal')

const fallbacks = [
  {
    importKey: '#nitro-internal-virtual/storage',
    rel: './dist/runtime/internal/nitro-virtual-storage-fallback.mjs',
    source: `import { createStorage } from "unstorage";

/** Minimal storage when virtual module is not bundled (e.g. Node resolving nitropack internals). */
export const storage = createStorage({});
`,
  },
  {
    importKey: '#nitro-internal-virtual/app-config',
    rel: './dist/runtime/internal/nitro-virtual-app-config-fallback.mjs',
    source: `/** Minimal app config when virtual module is not bundled (Nuxt injects real config at build). */
export const appConfig = {};
`,
  },
]

if (!existsSync(internalDir)) {
  process.exit(0)
}

for (const { rel, source } of fallbacks) {
  const abs = join(nitroRoot, rel)
  writeFileSync(abs, source, 'utf8')
}

const pkg = JSON.parse(readFileSync(nitroPkgPath, 'utf8'))
pkg.imports = pkg.imports && typeof pkg.imports === 'object' ? pkg.imports : {}
let changed = false
for (const { importKey, rel } of fallbacks) {
  if (!pkg.imports[importKey]) {
    pkg.imports[importKey] = rel
    changed = true
  }
}
if (changed) {
  writeFileSync(nitroPkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}
