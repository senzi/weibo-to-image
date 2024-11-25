<template>
  <div class="container">
    <header>
      <h1>微博转微博</h1>
      <p>生成微博卡片图片工具</p>
    </header>

    <main>
      <div class="layout">
        <!-- 左侧表单 -->
        <section class="input-section">
          <form @submit.prevent="generateCard">
            <div class="form-group">
              <label>微博昵称</label>
              <input 
                type="text" 
                v-model="formData.nickname" 
                required
              >
            </div>
            
            <div class="form-group">
              <label>头像URL</label>
              <input 
                type="text" 
                v-model="formData.avatar"
              >
            </div>

            <div class="form-group">
              <label>发布时间</label>
              <input 
                type="datetime-local" 
                v-model="formData.publishTime" 
                required
              >
            </div>

            <div class="form-group">
              <label>来源</label>
              <input 
                type="text" 
                v-model="formData.source" 
                placeholder="来自 iPhone"
              >
            </div>

            <div class="form-group">
              <label>内容</label>
              <textarea 
                v-model="formData.content" 
                required 
                rows="5"
              ></textarea>
            </div>

            <div class="form-group">
              <label>模板选择</label>
              <select v-model="selectedTemplate">
                <option 
                  v-for="template in templates" 
                  :key="template.id" 
                  :value="template.id"
                >
                  {{ template.name }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit">生成卡片</button>
              <button 
                type="button" 
                @click="downloadImage" 
                :disabled="!cardGenerated"
              >
                下载图片
              </button>
              <button 
                type="button" 
                @click="clearForm"
                class="clear-btn"
              >
                清空表单
              </button>
            </div>
          </form>
        </section>

        <!-- 右侧预览 -->
        <section class="preview-section">
          <div class="preview-container">
            <div class="card-preview" ref="previewRef">
              <div 
                class="weibo-card" 
                :class="{ empty: !formData.nickname }"
                :style="currentTemplateStyle"
              >
                <template v-if="formData.nickname">
                  <div class="card-header">
                    <div class="avatar">
                      <img 
                        :src="formData.avatar || defaultAvatar" 
                        alt="avatar"
                        @error="handleImageError"
                      >
                    </div>
                    <div class="user-info">
                      <div class="nickname">{{ formData.nickname }}</div>
                      <div class="meta">
                        {{ formatDateTime(formData.publishTime) }}
                        <span v-if="formData.source">· {{ formData.source }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-content">
                    {{ formData.content }}
                  </div>
                </template>
                <div v-else class="empty-placeholder">
                  <div class="placeholder-text">在左侧填写表单预览微博卡片</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { useStorage } from '@vueuse/core'
import type { WeiboData, CardTemplate } from './types'

const previewRef = ref<HTMLElement | null>(null)
const cardGenerated = ref(false)
const selectedTemplate = ref<string>(useStorage('selected-template', 'default'))
const defaultAvatar = '/default-avatar.png'

const templates: CardTemplate[] = [
  {
    id: 'default',
    name: '默认模板',
    description: '微博默认风格',
    style: {
      backgroundColor: '#ffffff',
      color: '#333333',
    }
  },
  {
    id: 'dark',
    name: '暗色模板',
    description: '深色主题',
    style: {
      backgroundColor: '#242424',
      color: '#ffffff',
    }
  }
]

// 使用 useStorage 持久化表单数据
const formData = useStorage<WeiboData>('weibo-form-data', {
  nickname: '',
  avatar: '',
  publishTime: '',
  source: '',
  content: ''
})

const currentTemplateStyle = computed(() => {
  const template = templates.find(t => t.id === selectedTemplate.value)
  return template?.style || {}
})

const formatDateTime = (datetime: string): string => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const generateCard = (): void => {
  cardGenerated.value = true
}

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

const clearForm = (): void => {
  formData.value = {
    nickname: '',
    avatar: '',
    publishTime: '',
    source: '',
    content: ''
  }
  cardGenerated.value = false
}

const downloadImage = async (): Promise<void> => {
  if (!previewRef.value) return
  
  try {
    // 优化 html2canvas 配置
    const canvas = await html2canvas(previewRef.value, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      backgroundColor: null, // 保持背景透明
      logging: false,
      width: 600, // 固定宽度
      height: previewRef.value.offsetHeight,
      onclone: (clonedDoc) => {
        // 确保克隆的元素样式完全加载
        const clonedElement = clonedDoc.querySelector('.card-preview')
        if (clonedElement) {
          clonedElement.style.transform = 'none'
          clonedElement.style.width = '600px'
        }
      }
    })

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `weibo-card-${Date.now()}.png`)
      }
    }, 'image/png', 1.0) // 使用最高质量
  } catch (error) {
    console.error('Failed to generate image:', error)
  }
}
</script>

<style>
@import 'normalize.css';

:root {
  --primary-color: #ff8200;
  --text-color: #333;
  --border-color: #e1e1e1;
  --card-width: 600px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  color: var(--primary-color);
  margin-bottom: 0;
}

.layout {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(var(--card-width), 1fr);
  gap: 40px;
  align-items: start;
}

.input-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

button[type="submit"] {
  background: var(--primary-color);
  color: white;
  border: none;
}

button[type="submit"]:hover {
  background: #e67600;
}

.clear-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-section {
  position: sticky;
  top: 20px;
}

.preview-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-preview {
  width: var(--card-width);
  margin: 0 auto;
}

.weibo-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
}

.weibo-card.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 2px dashed #ddd;
}

.empty-placeholder {
  text-align: center;
  color: #999;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info .nickname {
  font-weight: 600;
  font-size: 16px;
}

.user-info .meta {
  font-size: 14px;
  color: #666;
}

.card-content {
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    position: static;
    overflow-x: auto;
  }
  
  .preview-container {
    min-width: min-content;
  }
}
</style>