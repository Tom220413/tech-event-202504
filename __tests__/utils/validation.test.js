import { validateIssueForm, validatePriority, validateTags } from '../../utils/validation'

describe('Validation Functions', () => {
  describe('validateIssueForm', () => {
    it('should return no errors for valid form data', () => {
      const formData = {
        title: 'Valid Title',
        description: 'Valid description with enough content',
        priority: 'high',
        tags: 'tag1,tag2',
      }

      const errors = validateIssueForm(formData)
      expect(errors).toEqual({})
    })

    it('should return error for empty title', () => {
      const formData = {
        title: '',
        description: 'Valid description',
        priority: 'high',
      }

      const errors = validateIssueForm(formData)
      expect(errors.title).toBe('タイトルは必須です')
    })

    it('should return error for title too long', () => {
      const formData = {
        title: 'a'.repeat(101),
        description: 'Valid description',
        priority: 'high',
      }

      const errors = validateIssueForm(formData)
      expect(errors.title).toBe('タイトルは100文字以内で入力してください')
    })

    it('should return error for empty description', () => {
      const formData = {
        title: 'Valid Title',
        description: '',
        priority: 'high',
      }

      const errors = validateIssueForm(formData)
      expect(errors.description).toBe('説明は必須です')
    })

    it('should return error for description too short', () => {
      const formData = {
        title: 'Valid Title',
        description: 'short',
        priority: 'high',
      }

      const errors = validateIssueForm(formData)
      expect(errors.description).toBe('説明は10文字以上入力してください')
    })

    it('should return error for invalid priority', () => {
      const formData = {
        title: 'Valid Title',
        description: 'Valid description with enough content',
        priority: 'invalid',
      }

      const errors = validateIssueForm(formData)
      expect(errors.priority).toBe('優先度が正しくありません')
    })
  })

  describe('validatePriority', () => {
    it('should return true for valid priorities', () => {
      expect(validatePriority('low')).toBe(true)
      expect(validatePriority('medium')).toBe(true)
      expect(validatePriority('high')).toBe(true)
    })

    it('should return false for invalid priorities', () => {
      expect(validatePriority('invalid')).toBe(false)
      expect(validatePriority('')).toBe(false)
      expect(validatePriority(null)).toBe(false)
    })
  })

  describe('validateTags', () => {
    it('should return valid tags array', () => {
      const result = validateTags('tag1,tag2,tag3')
      expect(result).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should handle empty tags', () => {
      const result = validateTags('')
      expect(result).toEqual([])
    })

    it('should trim whitespace from tags', () => {
      const result = validateTags(' tag1 , tag2 , tag3 ')
      expect(result).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should filter out empty tags', () => {
      const result = validateTags('tag1,,tag2,')
      expect(result).toEqual(['tag1', 'tag2'])
    })
  })
})