export const isTokenExpired = (token) => {
  try {
    const encodedPayload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
};