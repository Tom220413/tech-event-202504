// Simple test to verify test environment is working

describe('Test Environment', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to jest-dom matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)
    
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello World')
  })

  it('should have environment variables set', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-key')
  })
})