// Relative URL: the Vite dev server proxies /api to the backend (see vite.config.js)
const BASE_URL = '/api'

// Helper for all requests: sends/receives JSON and turns error responses into thrown Errors
const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    // The API sends { message } for its own errors and ProblemDetails ({ title }) for
    // model-binding errors; a proxy or crash may send no JSON at all
    let message = `HTTP ${response.status}`
    try {
      const body = JSON.parse(await response.text())
      message = body.message || body.title || message
    } catch {
      // Body isn't JSON: keep the status-based message
    }
    throw new Error(message)
  }

  // DELETE returns 204 No Content, which has no body to parse
  if (response.status === 204) return null

  return response.json()
}

// Expenses
export const getExpenses = (categoryId = null) => {
  const url = categoryId
    ? `${BASE_URL}/expenses?categoryId=${categoryId}`
    : `${BASE_URL}/expenses`
  return fetchJSON(url)
}

export const getExpense = (id) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`)
}

export const createExpense = (data) => {
  return fetchJSON(`${BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateExpense = (id, data) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const deleteExpense = (id) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  })
}

// Categories
export const getCategories = () => {
  return fetchJSON(`${BASE_URL}/categories`)
}

// Summaries
export const getMonthlySummary = (categoryId = null) => {
  const url = categoryId
    ? `${BASE_URL}/expenses/summary/monthly?categoryId=${categoryId}`
    : `${BASE_URL}/expenses/summary/monthly`
  return fetchJSON(url)
}

export const getCategorySummary = (categoryId = null) => {
  const url = categoryId
    ? `${BASE_URL}/expenses/summary/category?categoryId=${categoryId}`
    : `${BASE_URL}/expenses/summary/category`
  return fetchJSON(url)
}
