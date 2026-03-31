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
  {
    importKey: '#nitro-internal-virtual/error-handler',
    rel: './dist/runtime/internal/nitro-virtual-error-handler-fallback.mjs',
    source: `/** Dev error UI when Rollup did not inline the real virtual module (Node ESM resolving nitropack/internal/app). */
export { default } from "./error/dev.mjs";
`,
  },
  {
    importKey: '#nitro-internal-virtual/plugins',
    rel: './dist/runtime/internal/nitro-virtual-plugins-fallback.mjs',
    source: `export const plugins = [];
`,
  },
  {
    importKey: '#nitro-internal-virtual/server-handlers',
    rel: './dist/runtime/internal/nitro-virtual-server-handlers-fallback.mjs',
    source: `/** Empty: real handlers come from the Nuxt/Nitro dev bundle. Only used if raw internal/app.mjs is resolved. */
export const handlers = [];
`,
  },
  {
    importKey: '#nitro-internal-virtual/tasks',
    rel: './dist/runtime/internal/nitro-virtual-tasks-fallback.mjs',
    source: `export const scheduledTasks = false;
export const tasks = {};
`,
  },
  {
    importKey: '#nitro-internal-virtual/database',
    rel: './dist/runtime/internal/nitro-virtual-database-fallback.mjs',
    source: `/** Empty: real DB config is injected when Nitro bundles; Node resolving internals needs this. */
export const connectionConfigs = {};
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
