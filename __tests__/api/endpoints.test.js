/**
 * API Endpoints Integration Tests
 * 
 * These tests validate the actual API endpoints by making HTTP requests
 * and verifying the responses, authentication, and error handling.
 */

// Mock Supabase for API route testing
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => mockQueryBuilder),
}

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      data: data,
      statusCode: options?.status || 200,
    }))
  },
}))

// Import API route handlers after mocking
import { GET as issuesGET } from '../../app/api/issues/route'
import { POST as registerPOST } from '../../app/api/register/route'
import { PUT as updatePUT } from '../../app/api/update/route'
import { PUT as statusPUT, GET as statusGET, POST as statusPOST } from '../../app/api/status/route'

describe('API Endpoints Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default successful auth mock
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      error: null
    })
    
    // Setup mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  describe('GET /api/issues - 課題一覧取得', () => {
    it('should return issues list for authenticated user', async () => {
      // Mock database response
      const mockIssues = [
        {
          id: 1,
          title: 'Test Issue',
          content: 'Test content',
          priority: '高',
          tag: '開発',
          inputter_name: 'Test User',
          is_resolved: false,
          created_at: '2024-01-01T00:00:00Z',
          user_id: 'test-user-id'
        }
      ]

      // Mock the query result for all issues
      mockQueryBuilder.order.mockResolvedValue({
        data: mockIssues,
        error: null
      })

      // Create request with proper URL
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(200)
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    })

    it('should return specific issue when id parameter is provided', async () => {
      const mockIssue = {
        id: 1,
        title: 'Specific Issue',
        content: 'Specific content',
        priority: '中',
        tag: 'デザイン',
        inputter_name: 'Test User',
        is_resolved: true,
        created_at: '2024-01-01T00:00:00Z',
        user_id: 'test-user-id'
      }

      // Mock the query result for single issue
      mockQueryBuilder.single.mockResolvedValue({
        data: mockIssue,
        error: null
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/issues?id=1'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(200)
      expect(response.data).toEqual(mockIssue)
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })

      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(401)
    })

    it('should handle database errors', async () => {
      // Mock database error
      mockQueryBuilder.order.mockRejectedValue(new Error('Database connection failed'))

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(500)
    })
  })

  describe('認証エラーのテスト', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(401)
    })

    it('should return 401 when token is invalid', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' }
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer invalid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(401)
    })

    it('should return 401 when user is null', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer expired-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/issues'
      }

      const response = await issuesGET(mockRequest)
      
      expect(response.statusCode).toBe(401)
    })
  })

  describe('POST /api/register - 課題作成', () => {
    const validIssueData = {
      inputter_name: 'Test User',
      priority: '高',
      title: 'New Issue',
      content: 'Issue content',
      tag: '開発',
      limit: '2024-12-31'
    }

    beforeEach(() => {
      // Reset mocks for register tests
      mockQueryBuilder.select.mockReturnThis()
      mockQueryBuilder.eq.mockReturnThis()
      mockQueryBuilder.insert.mockReturnThis()
    })

    it('should create new issue with valid data', async () => {
      const mockCreatedIssue = {
        id: 123,
        title: 'New Issue',
        content: 'Issue content',
        priority: '高',
        tag: '開発',
        inputter_name: 'Test User',
        limit_date: '2024-12-31',
        is_resolved: false,
        created_at: '2024-01-01T10:00:00Z',
        user_id: 'test-user-id'
      }

      // Mock profile check (profile not found)
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      })

      // Mock profile creation
      mockQueryBuilder.insert.mockReturnValueOnce({
        data: [{ id: 'test-user-id' }],
        error: null
      })

      // Mock issue creation - need to mock insert().select().single() chain
      mockQueryBuilder.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCreatedIssue,
            error: null
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(validIssueData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(201)
      expect(response.data.success).toBe(true)
      expect(response.data.id).toBe(123)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        inputter_name: 'Test User',
        // missing required fields
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('必須')
    })

    it('should validate title length', async () => {
      const invalidData = {
        ...validIssueData,
        title: 'a'.repeat(31) // Exceeds 30 character limit
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('30文字以内')
    })

    it('should validate content length', async () => {
      const invalidData = {
        ...validIssueData,
        content: 'b'.repeat(226) // Exceeds 225 character limit
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('225文字以内')
    })

    it('should validate priority values', async () => {
      const invalidData = {
        ...validIssueData,
        priority: '超高' // Invalid priority
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('無効な優先度')
    })

    it('should validate tag values', async () => {
      const invalidData = {
        ...validIssueData,
        tag: '無効なタグ' // Invalid tag
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('無効なタグ')
    })

    it('should validate date format', async () => {
      const invalidData = {
        ...validIssueData,
        limit: 'invalid-date'
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('有効な日付')
    })

    it('should return 401 for unauthenticated requests', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        json: jest.fn().mockResolvedValue(validIssueData)
      }

      const response = await registerPOST(mockRequest)
      
      expect(response.statusCode).toBe(401)
      expect(response.data.success).toBe(false)
    })
  })

  describe('PUT /api/update - 課題更新', () => {
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
      priority: '中'
    }

    it('should update issue with valid data', async () => {
      const mockUpdatedIssue = {
        id: 1,
        title: 'Updated Title',
        content: 'Updated content',
        priority: '中',
        tag: '開発',
        inputter_name: 'Test User',
        limit_date: '2024-12-31',
        is_resolved: false,
        created_at: '2024-01-01T10:00:00Z',
        user_id: 'test-user-id'
      }

      // Mock the update().eq().eq().select().single() chain
      mockQueryBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedIssue,
                error: null
              })
            })
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/update?id=1',
        json: jest.fn().mockResolvedValue(updateData)
      }

      const response = await updatePUT(mockRequest)
      
      expect(response.statusCode).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data.title).toBe('Updated Title')
    })

    it('should return 400 when id parameter is missing', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/update',
        json: jest.fn().mockResolvedValue(updateData)
      }

      const response = await updatePUT(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.error).toContain('ID')
    })

    it('should return 404 when issue is not found', async () => {
      // Mock the update().eq().eq().select().single() chain returning no rows
      mockQueryBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found' }
              })
            })
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/update?id=999',
        json: jest.fn().mockResolvedValue(updateData)
      }

      const response = await updatePUT(mockRequest)
      
      expect(response.statusCode).toBe(404)
      expect(response.data.success).toBe(false)
    })

    it('should return 401 for unauthenticated requests', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        url: 'http://localhost:3000/api/update?id=1',
        json: jest.fn().mockResolvedValue(updateData)
      }

      const response = await updatePUT(mockRequest)
      
      expect(response.statusCode).toBe(401)
      expect(response.data.success).toBe(false)
    })

    it('should handle database errors', async () => {
      // Mock the update() chain to throw an error
      mockQueryBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        url: 'http://localhost:3000/api/update?id=1',
        json: jest.fn().mockResolvedValue(updateData)
      }

      const response = await updatePUT(mockRequest)
      
      expect(response.statusCode).toBe(500)
      expect(response.data.success).toBe(false)
    })
  })

  describe('PUT /api/status - ステータス更新', () => {
    it('should update issue status successfully', async () => {
      const statusData = {
        id: 1,
        flg: 1 // Mark as resolved
      }

      const mockUpdatedIssue = {
        id: 1,
        is_resolved: true,
        updated_at: '2024-01-01T10:00:00Z'
      }

      // Mock the update().eq().eq().select().single() chain
      mockQueryBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedIssue,
                error: null
              })
            })
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(statusData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data.is_resolved).toBe(true)
    })

    it('should validate id as positive integer', async () => {
      const invalidData = {
        id: -1,
        flg: 1
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('正の整数')
    })

    it('should validate flg as 0 or 1', async () => {
      const invalidData = {
        id: 1,
        flg: 2 // Invalid flag value
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('0または1')
    })

    it('should validate required id field', async () => {
      const invalidData = {
        flg: 1
        // missing id
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('IDは必須')
    })

    it('should validate required flg field', async () => {
      const invalidData = {
        id: 1
        // missing flg
      }

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(invalidData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(400)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('フラグは必須')
    })

    it('should return 404 when issue is not found', async () => {
      const statusData = {
        id: 999,
        flg: 1
      }

      // Mock the update() chain returning no rows
      mockQueryBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found' }
              })
            })
          })
        })
      })

      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === 'authorization') return 'Bearer valid-token'
            return null
          })
        },
        json: jest.fn().mockResolvedValue(statusData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(404)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('見つかりません')
    })

    it('should return 401 for unauthenticated requests', async () => {
      const statusData = {
        id: 1,
        flg: 1
      }

      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        json: jest.fn().mockResolvedValue(statusData)
      }

      const response = await statusPUT(mockRequest)
      
      expect(response.statusCode).toBe(401)
      expect(response.data.success).toBe(false)
    })

    it('should return 405 for GET method', async () => {
      const response = await statusGET()
      
      expect(response.statusCode).toBe(405)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('PUTメソッドのみ')
    })

    it('should return 405 for POST method', async () => {
      const response = await statusPOST()
      
      expect(response.statusCode).toBe(405)
      expect(response.data.success).toBe(false)
      expect(response.data.message).toContain('PUTメソッドのみ')
    })
  })
})