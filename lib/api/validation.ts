import { validationError } from './error-handler'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequiredFields = (data: Record<string, unknown>, fields: string[]) => {
  const missing = fields.filter((field) => !data[field])
  if (missing.length > 0) {
    throw validationError(`Missing required fields: ${missing.join(', ')}`)
  }
}

export const validateUserType = (type: string) => {
  const validTypes = ['student', 'faculty', 'staff', 'admin']
  if (!validTypes.includes(type.toLowerCase())) {
    throw validationError(`Invalid user type. Must be one of: ${validTypes.join(', ')}`)
  }
}

export const validatePagination = (page: unknown, limit: unknown) => {
  let pageNum = 1
  let limitNum = 10

  if (page) {
    pageNum = Math.max(1, parseInt(String(page)) || 1)
  }

  if (limit) {
    limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 10))
  }

  return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum }
}
