// 메시지 목록을 갱신하는 주기를 밀리초 단위로 설정
// 500ms = 0.5초마다 메시지 목록을 새로고침
const POLLING_INTERVAL = 500

// API 엔드포인트 상수 정의
const API_URL = 'http://127.0.0.1:8000/v1/rag/query/'


// useMessages: 메시지 관리를 위한 커스텀 훅(hook) 함수
// sender: 메시지 발신자 구분을 위한 매개변수 ('male' 또는 'female')
export const useMessages = (sender) => {
  
    // // getMessages: localStorage에서 메시지 목록을 가져오는 함수
    // const getMessages = () => {
    //   // localStorage에서 'chat-messages' 키로 저장된 데이터를 가져옴
    //   const stored = localStorage.getItem('chat-messages')
    //   // 저장된 데이터가 있으면 JSON 파싱하여 반환, 없으면 빈 배열 반환
    //   return stored ? JSON.parse(stored) : []
    // }
  
    // saveMessage: 새 메시지를 저장하는 함수
    // text: 저장할 메시지 내용ㄴ
    const saveMessage = async (text) => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: text
          })
        })
  
        if (!response.ok) {
          throw new Error('API 요청 실패')
        }
  
        const apiResponse = await response.json()
        
        //오리지널 메세지
        // 번역된 메시지를 쉼표로 분리
        const translatedOptions = apiResponse.translated_message.split('/').map(msg => msg.trim())
        
        return {
          messageOptions: translatedOptions,
          originalText: apiResponse.original_message,
          userId: apiResponse.user_id
        }
      } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error)
        throw error
      }
    }
  
    const clearMessages = () => {
      const messages = getMessages()
      const clearedMessages = messages.filter(msg => msg.sender !== sender)
      // 'messages' -> 'chat-messages'로 수정
      localStorage.setItem('chat-messages', JSON.stringify(clearedMessages))
    }
  
    // 사용할 함수들을 객체로 반환
    return {
    //   getMessages,  // 메시지 목록 조회 함수
      saveMessage,  // 새 메시지 저장 함수
      clearMessages  // 메시지 삭제 함수
    }
  }
  
  