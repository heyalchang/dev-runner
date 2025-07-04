await Bun.build({
  entrypoints: ['./src/main.tsx'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: true,
  sourcemap: 'external',
  minify: process.env.NODE_ENV === 'production',
});