import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/core/index.ts' },
    outDir: 'dist/core',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'next'],
    noExternal: ['gameanalytics'],
  },
  {
    entry: { index: 'src/react/index.ts' },
    outDir: 'dist/react',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'next'],
    noExternal: ['gameanalytics'],
    banner: { js: '"use client";' },
  },
  {
    entry: { index: 'src/next/index.ts' },
    outDir: 'dist/next',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'next', 'next/navigation', 'next/router'],
    noExternal: ['gameanalytics'],
    banner: { js: '"use client";' },
  },
])
