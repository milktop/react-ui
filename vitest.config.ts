import { defineConfig } from 'vitest/config'

export default defineConfig({
  // CSS read as text (?raw) keeps its rules, for tests on them; imported CSS stays out of jsdom.
  test: { environment: 'jsdom', include: ['test/**/*.test.tsx'], css: { include: [/\.css\?raw$/] } },
})
