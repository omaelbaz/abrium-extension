/**
 * Production stand-in for dev-seed.ts.
 *
 * vite.config.ts aliases ./dev-seed.ts to this file for `vite build`, which is
 * what keeps tests/fixtures/artifacts.ts out of the shipped service worker.
 * Tree-shaking alone did not manage it — see dev-seed.ts for why.
 *
 * A production build seeds nothing: the vault is empty until capture writes to
 * it, and the gallery's empty state is the correct thing to show.
 */
export async function seedDevFixtures(): Promise<void> {
  // Intentionally empty.
}
