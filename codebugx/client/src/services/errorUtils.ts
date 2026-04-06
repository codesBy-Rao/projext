import axios from 'axios'

export const extractApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string } | undefined
    if (responseData?.message) {
      return responseData.message
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const readFetchErrorMessage = async (response: Response, fallback: string) => {
  try {
    const payload = await response.json()
    if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
      return payload.message
    }
  } catch {
    try {
      const text = await response.text()
      if (text) {
        return text
      }
    } catch {
      return fallback
    }
  }

  return fallback
}
