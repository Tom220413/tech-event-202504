import { render } from '@testing-library/react'
import { AuthProvider } from '../../lib/auth-context'
import React, { createContext } from 'react'

// Create a mock AuthContext
const MockAuthContext = createContext({})

// Mock auth context value
const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      display_name: 'Test User'
    }
  },
  loading: false,
  isAuthenticated: true,
  signOut: jest.fn(),
}

// Custom render function that includes providers
export function renderWithAuth(ui, options = {}) {
  const { authValue = mockAuthContext, ...renderOptions } = options

  function Wrapper({ children }) {
    return (
      <MockAuthContext.Provider value={authValue}>
        {children}
      </MockAuthContext.Provider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock issue data
export const mockIssue = {
  id: 1,
  title: 'Test Issue',
  content: 'Test Description',
  urgency: '高',
  tag: '開発',
  username: 'Test User',
  create_date: '2024-01-01',
  limit: '2024-12-31',
  flg: false,
}

export const mockIssues = [
  mockIssue,
  {
    id: 2,
    title: 'Another Issue',
    content: 'Another Description',
    urgency: '中',
    tag: 'デザイン',
    username: 'Another User',
    create_date: '2024-01-02',
    limit: '2024-11-30',
    flg: true,
  },
  {
    id: 3,
    title: 'Third Issue',
    content: 'Third Description',
    urgency: '低',
    tag: 'ドキュメント',
    username: 'Third User',
    create_date: '2024-01-03',
    limit: '2024-10-31',
    flg: false,
  },
]

// Re-export testing library utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'