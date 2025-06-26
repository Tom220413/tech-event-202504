// Form validation utilities

export function validateIssueForm(formData) {
  const errors = {}

  // Title validation
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'タイトルは必須です'
  } else if (formData.title.length > 100) {
    errors.title = 'タイトルは100文字以内で入力してください'
  }

  // Description validation
  if (!formData.description || formData.description.trim() === '') {
    errors.description = '説明は必須です'
  } else if (formData.description.length < 10) {
    errors.description = '説明は10文字以上入力してください'
  } else if (formData.description.length > 1000) {
    errors.description = '説明は1000文字以内で入力してください'
  }

  // Priority validation
  if (!validatePriority(formData.priority)) {
    errors.priority = '優先度が正しくありません'
  }

  return errors
}

export function validatePriority(priority) {
  const validPriorities = ['low', 'medium', 'high']
  return validPriorities.includes(priority)
}

export function validateTags(tagsString) {
  if (!tagsString || tagsString.trim() === '') {
    return []
  }

  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Limit to 10 tags
}

export function validateStatus(status) {
  const validStatuses = ['todo', 'in_progress', 'done']
  return validStatuses.includes(status)
}