import { vi } from 'vitest'

// Create a mock function that records all calls
export const mockGA = vi.fn()

// Mock the SDK bridge module so all calls are captured
vi.mock('../core/sdk', () => ({
  callSDK: (...args: unknown[]) => mockGA(...args),
}))
