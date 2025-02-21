import { refreshAccessToken } from './auth';

export const apiRequest = async (url, options = {}) => {
  // 저장된 액세스 토큰을 요청 헤더에 추가합니다.
  let accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  let response = await fetch(url, options);

  // 액세스 토큰 만료(401) 시 토큰 갱신 후 재요청
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } catch (error) {
      console.error('액세스 토큰 갱신 실패:', error);
      throw error;
    }
  }
  return response;
};