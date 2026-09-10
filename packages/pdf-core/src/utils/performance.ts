/**
 * Performance measurement utilities
 */

export function measureAsync<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  return new Promise((resolve, reject) => {
    const start = performance.now()
    fn()
      .then(result => {
        const durationMs = performance.now() - start
        resolve({ result, durationMs })
      })
      .catch(reject)
  })
}
