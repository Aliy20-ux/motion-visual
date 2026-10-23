// Lets Node run the project's TypeScript directly: the source imports sibling files without an extension
// ('../../src/pricing'), which Node's ESM loader doesn't resolve. Test-only; the app is built by Vite.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && /^\.{1,2}\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const suffix of ['.ts', '/index.ts']) {
        try { return await nextResolve(specifier + suffix, context); } catch { /* try the next */ }
      }
    }
    throw err;
  }
}
