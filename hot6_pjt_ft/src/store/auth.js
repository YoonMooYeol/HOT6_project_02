export const refreshAccessToken = async () => {
    // 보통 리프레시 토큰은 localStorage 또는 쿠키에 저장되어 있습니다.
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 저장되어 있지 않습니다.');
    }
  
    const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
  
    if (!response.ok) {
      throw new Error('액세스 토큰 갱신 실패');
    }
  
    const data = await response.json();
    // data.access에 새 액세스 토큰이 담겨 있습니다.
    localStorage.setItem('access_token', data.access);
    return data.access;
  };