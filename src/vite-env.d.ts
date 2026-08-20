/*
 * Vite's ambient types — `import.meta.glob` and friends.
 *
 * A reference file rather than a `types` entry in tsconfig, because setting
 * `types` at all switches off automatic inclusion of every other global type
 * package, and `@types/node` is one the token-binding test depends on.
 */
/// <reference types="vite/client" />
