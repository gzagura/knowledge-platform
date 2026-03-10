import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// Start the MSW server before all tests in this suite.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers added during individual tests.
afterEach(() => server.resetHandlers())

// Clean up after the test suite is complete.
afterAll(() => server.close())
