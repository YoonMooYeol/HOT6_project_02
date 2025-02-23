// audio.js
// 이 모듈은 텍스트를 음성으로 변환하는 API를 호출하고, 재생 기능을 제공합니다.

export async function textToSpeech(text, user_gender) {
  try {
    // 전달받은 성별 값을 대문자로 변환하고, "M"이면 "M", 그 외엔 "F"로 설정
    const normalizedSex = user_gender && user_gender.toUpperCase() === "M" ? "M" : "F";
    
    // API에 텍스트를 JSON 형식으로 전달
    const response = await fetch('http://127.0.0.1:8000/api/v1/audio/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, sex: normalizedSex })
    });

    if (!response.ok) {
      // 에러 발생 시 응답 내용을 문자열로 읽어 에러 메시지에 포함
      const errorMessage = await response.text();
      throw new Error("TTS API Error: " + errorMessage);
    }

    // 응답을 Blob으로 읽음. (서버가 오디오 데이터를 binary 형식으로 반환)
    const blob = await response.blob();
    // Blob을 기반으로 URL 생성
    const audioUrl = URL.createObjectURL(blob);
    // HTMLAudioElement를 이용하여 오디오 재생
    const audio = new Audio(audioUrl);
    audio.play();
    return audio; // 필요하면 재생된 audio 객체를 반환
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    throw error;
  }
}
