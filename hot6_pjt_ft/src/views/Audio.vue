<template>
    <div class="app">
      <h1>Voice Cloning & TTS Demo (Vue 3)</h1>
  
      <!-- Section 1: 내 목소리 복제하기 -->
      <div class="section-container">
        <h2>1. 내 목소리 복제하기</h2>
        <form @submit.prevent="handleClone">
          <div>
            <label>샘플 파일 1:</label>
            <input type="file" accept="audio/*" @change="e => onFileChange(e, 'sample1')" required />
            <button type="button"
              @click="isRecording && recordingField === 'sample1' ? stopRecording() : startRecording('sample1')">
              {{ isRecording && recordingField === 'sample1' ? "녹음 중지" : "녹음 시작" }}
            </button>
          </div>
          <div>
            <label>샘플 파일 2:</label>
            <input type="file" accept="audio/*" @change="e => onFileChange(e, 'sample2')" required />
            <button type="button"
              @click="isRecording && recordingField === 'sample2' ? stopRecording() : startRecording('sample2')">
              {{ isRecording && recordingField === 'sample2' ? "녹음 중지" : "녹음 시작" }}
            </button>
          </div>
          <div>
            <label>샘플 파일 3:</label>
            <input type="file" accept="audio/*" @change="e => onFileChange(e, 'sample3')" required />
            <button type="button"
              @click="isRecording && recordingField === 'sample3' ? stopRecording() : startRecording('sample3')">
              {{ isRecording && recordingField === 'sample3' ? "녹음 중지" : "녹음 시작" }}
            </button>
          </div>
          <button type="submit">복제 요청</button>
        </form>
        <div v-if="cloneResponse">
          <p>{{ cloneResponse }}</p>
          <p v-if="voiceId"><strong>Voice ID:</strong> {{ voiceId }}</p>
        </div>
      </div>
  
      <!-- Section 2: 클론 보이스로 TTS 실행하기 -->
      <div class="section-container">
        <h2>2. 클론 보이스로 TTS 실행하기</h2>
        <form @submit.prevent="handleTTS">
          <div>
            <label>변환할 텍스트:</label>
            <input type="text" v-model="text" placeholder="변환할 텍스트를 입력하세요." required />
          </div>
          <button type="submit" :disabled="!voiceId">TTS 변환</button>
        </form>
        <div v-if="ttsResponse">
          <p>{{ ttsResponse }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'

  const sample1 = ref(null)
  const sample2 = ref(null)
  const sample3 = ref(null)
  const voiceId = ref(null)
  const text = ref('')
  const cloneResponse = ref('')
  const ttsResponse = ref('')
  
  // 녹음 관련 상태 및 변수
  const isRecording = ref(false)
  const recordingField = ref('')
  let mediaRecorder = null
  let recordedChunks = []
  
  const onFileChange = (e, field) => {
    const file = e.target.files[0]
    if (field === 'sample1') {
      sample1.value = file
    } else if (field === 'sample2') {
      sample2.value = file
    } else if (field === 'sample3') {
      sample3.value = file
    }
  }
  
  const startRecording = async (field) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("이 브라우저는 오디오 녹음을 지원하지 않습니다.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      recordedChunks = []
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data)
        }
      })
      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' })
        const file = new File([blob], "recording.webm", { type: 'audio/webm' })
        if (field === 'sample1') sample1.value = file
        else if (field === 'sample2') sample2.value = file
        else if (field === 'sample3') sample3.value = file
      })
      mediaRecorder.start()
      recordingField.value = field
      isRecording.value = true
    } catch (error) {
      alert("녹음 시작 실패: " + error)
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      isRecording.value = false
      recordingField.value = ''
    }
  }
  
  const handleClone = async () => {
    const formData = new FormData()
    formData.append('sample_file_1', sample1.value)
    formData.append('sample_file_2', sample2.value)
    formData.append('sample_file_3', sample3.value)
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/audio/clone-voice/', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.detail && errorData.detail.status === 'can_not_use_instant_voice_cloning') {
          throw new Error("현재 구독 플랜으로는 즉시 보이스 클로닝을 사용할 수 없습니다. 업그레이드가 필요합니다.")
        }
        throw new Error(errorData.error || '음성 복제 중 오류가 발생했습니다.')
      }
      const resData = await response.json()
      cloneResponse.value = resData.message
      voiceId.value = resData.voice_id
    } catch (error) {
      cloneResponse.value = error.message || '음성 복제 중 오류가 발생했습니다.'
    }
  }
  
  const handleTTS = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/audio/tts-cloned-voice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voice_id: voiceId.value,
          text: text.value
        })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'TTS 변환 중 오류가 발생했습니다.')
      }
      const resData = await response.json()
      ttsResponse.value = resData.message
    } catch (error) {
      ttsResponse.value = error.message || 'TTS 변환 중 오류가 발생했습니다.'
    }
  }
  </script>
  
  <style scoped>
  .app {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-container {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  form > div {
    margin-bottom: 1rem;
  }

  button[type="button"] {
    margin-left: 8px;
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
  }
  </style>