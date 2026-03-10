import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This MSW server intercepts fetch calls made during Vitest (Node.js) tests.
export const server = setupServer(...handlers)
