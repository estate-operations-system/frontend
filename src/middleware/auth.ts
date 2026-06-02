export default defineNuxtRouteMiddleware(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return navigateTo('/')
    }

    const res = await fetch('https://backend-pl4x.onrender.com/api/auth/status', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      return navigateTo('/')
    }

    const data = await res.json()

    if (!data.success || !data.authenticated) {
      return navigateTo('/')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/')
  }
})
