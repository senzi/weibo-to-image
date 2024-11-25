<template>
  <div class="container">
    <div class="app-header">
      <h1>微博转长图 (Weibo to Weibo.png)</h1>
      <p class="subtitle">将微博内容转换为精美的分享图片</p>
    </div>

    <main>
      <div class="layout">
        <!-- 左侧表单 -->
        <section class="input-section">
          <form @submit.prevent="generateCard">
            <div class="form-group">
              <label>微博昵称</label>
              <input type="text" v-model="formData.nickname" required>
            </div>

            <div class="form-group">
              <label>头像URL</label>
              <input type="text" v-model="formData.avatar">
            </div>

            <div class="form-group">
              <label>发布时间</label>
              <input type="datetime-local" v-model="formData.publishTime" required>
            </div>

            <div class="form-group">
              <label>来源</label>
              <input type="text" v-model="formData.source" placeholder="来自 iPhone">
            </div>

            <div class="form-group">
              <label>内容</label>
              <textarea v-model="formData.content" required rows="5"></textarea>
            </div>

            <div class="form-group">
              <label>模板选择</label>
              <select v-model="selectedTemplate">
                <option v-for="template in templates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button @click="downloadImage" :disabled="isLoading" class="download-button">
                {{ isLoading ? '生成中...' : '下载图片' }}
                <span class="icon" v-if="!isLoading">📥</span>
                <span class="loading-spinner" v-else></span>
              </button>
            </div>

          </form>
        </section>

        <!-- 右侧预览 -->
        <section class="preview-canvas">
          <div class="floating-background" :style="containerStyle">
            <div class="weibo-card-wrapper" ref="previewRef">
              <div class="weibo-card" :class="{ empty: !formData.nickname }" :style="cardStyle">
                <template v-if="formData.nickname">
                  <div class="card-header">
                    <div class="avatar">
                      <img :src="formData.avatar || defaultAvatar" alt="avatar" @error="handleImageError">
                    </div>
                    <div class="user-info">
                      <div class="nickname">{{ formData.nickname }}</div>
                      <div class="meta">
                        {{ formatDateTime(formData.publishTime) }}
                        <span v-if="formData.source">· {{ formData.source }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-content" v-html="parseContent(formData.content)"></div>
                </template>
                <div v-else class="empty-placeholder">
                  <div class="placeholder-text">在左侧填写表单预览微博卡片</div>
                </div>
              </div>
              <div class="powered-by">
                <span>Powered by W2W</span>
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
import { saveAs } from 'file-saver'
import { useStorage } from '@vueuse/core'
import type { WeiboData, CardTemplate } from './types'
import * as htmlToImage from 'html-to-image'



const previewRef = ref<HTMLElement | null>(null)
const cardGenerated = ref(false)
const selectedTemplate = useStorage<string>('selected-template', 'default')
const defaultAvatar = '/default-avatar.png'
const isLoading = ref(false)

const templates: CardTemplate[] = [
  {
    id: 'default',
    name: '默认模板',
    description: '简洁清晰的白色卡片设计',
    style: {
      container: {
        padding: '40px',
        backgroundColor: '#f5f5f5',
        backgroundImage: undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      },
      card: {
        backgroundColor: '#ffffff',
        color: '#333333',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
      }
    }
  },
  {
    id: 'lxgw-elegant',
    name: 'LXGW 雅墨',
    description: '优雅简约的东方文韵设计',
    style: {
      container: {
        padding: '40px',
        backgroundColor: '#2c2c2c',
        backgroundImage: `linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%),
          repeating-linear-gradient(45deg, 
            rgba(255,255,255,0.08) 0px, 
            rgba(255,255,255,0.08) 3px,
            transparent 3px, 
            transparent 25px
          ),
          repeating-linear-gradient(135deg,
            rgba(255,255,255,0.06) 0px,
            rgba(255,255,255,0.06) 3px,
            transparent 3px,
            transparent 25px
          ),
          radial-gradient(circle at 50% 50%,
            rgba(255,255,255,0.04) 0%,
            transparent 60%
          )`,
        backgroundSize: 'cover, 150px 150px, 130px 130px, cover',
        backgroundPosition: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
      },
      card: {
        backgroundColor: '#ffffff',
        color: '#2c2c2c',
        fontFamily: '"LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '18px',
        padding: '28px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }
    }
  },
  {
    id: 'dark',
    name: '深色模板',
    description: '高对比度的深色主题设计',
    style: {
      container: {
        padding: '40px',
        backgroundColor: '#1a1a1a',
        backgroundImage: undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      },
      card: {
        backgroundColor: '#2d2d2d',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)'
      }
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

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const parseContent = (content: string): string => {
  const escapedContent = escapeHtml(content);
  return escapedContent.replace(
    /#([^#]+)#/g,
    '<span class="weibo-tag">#$1#</span>'
  );
}

const containerStyle = computed(() => {
  const template = templates.find(t => t.id === selectedTemplate.value)
  return {
    '--container-padding': template?.style.container.padding || '40px',
    '--container-background': template?.style.container.backgroundColor || '#f5f5f5',
    '--container-bg-image': template?.style.container.backgroundImage ?
      `url(${template.style.container.backgroundImage})` : 'none',
    '--container-bg-size': template?.style.container.backgroundSize || 'cover',
    '--container-bg-position': template?.style.container.backgroundPosition || 'center',
    '--container-border-radius': template?.style.container.borderRadius || '12px',
    '--container-box-shadow': template?.style.container.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.08)',
  }
})

const cardStyle = computed(() => {
  const template = templates.find(t => t.id === selectedTemplate.value)
  return {
    '--card-bg-color': template?.style.card.backgroundColor || '#ffffff',
    '--card-text-color': template?.style.card.color || '#333333',
    '--card-font-family': template?.style.card.fontFamily || 'system-ui',
    '--card-font-size': template?.style.card.fontSize || '16px',
    '--card-padding': template?.style.card.padding || '20px',
    '--card-border-radius': template?.style.card.borderRadius || '8px',
    '--card-box-shadow': template?.style.card.boxShadow || '0 2px 12px rgba(0, 0, 0, 0.08)'
  }
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

const generateCard = async (): Promise<void> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟加载过程
    cardGenerated.value = true
  } finally {
    isLoading.value = false
  }
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
  const previewCanvas = document.querySelector('.floating-background')
  if (!previewCanvas) return

  try {
    isLoading.value = true

    // 使用 htmlToImage 捕获整个 preview-canvas 区域
    const dataUrl = await htmlToImage.toPng(previewCanvas as HTMLElement, {
      quality: 1.0,
      pixelRatio: 2,
      style: {
        // 确保捕获时保持原始样式
        transform: 'none',
        position: 'relative',
        top: '0',
      }
    })

    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `weibo-card-${timestamp}.png`

    // 使用 FileSaver 下载
    saveAs(dataUrl, filename)

  } catch (error) {
    console.error('Failed to generate image:', error)
  } finally {
    isLoading.value = false
  }
}
</script>


<style>
@import 'normalize.css';
@import url('https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkai/dist/lxgwwenkai-light/result.css');
@import url('https://chinese-fonts-cdn.deno.dev/packages/yozai/dist/Yozai-Light/result.css');


:root {
  --primary-color: #ff8200;
  --text-color: #333;
  --border-color: #e1e1e1;
  --card-width: 600px;
  --container-background: #f5f5f5;
  --card-bg-color: #ffffff;
  --card-text-color: #333333;
  --card-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --card-font-size: 16px;
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

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-header h1 {
  color: var(--primary-color);
  margin-bottom: 8px;
}

.layout {
  display: grid;
  grid-template-columns: 2fr 3fr;
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
  font-weight: bold; /* 加粗字体 */
  color: var(--primary-color); /* 使用变量定义的主色 */
  text-align: left; /* 左对齐 */
  padding-left: 13px; /* 增加内边距，微调向右 */
  /* 或者用 margin-left 调整：
  margin-left: 8px;
  */
}

input,
textarea,
select {
  width: 90%;
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
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.download-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-canvas {
  position: sticky;
  top: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 0;
}

.floating-background {
  width: var(--card-width);
  min-height: fit-content;
  background-color: var(--container-background);
  background-image: var(--container-bg-image);
  background-size: var(--container-bg-size);
  background-position: var(--container-bg-position);
  border-radius: var(--container-border-radius);
  box-shadow: var(--container-box-shadow);
  padding: var(--container-padding);
  display: flex;
  justify-content: center;
  align-items: center;
}

.weibo-card-wrapper {
  width: 100%;
}

.weibo-card {
  background-color: var(--card-bg-color);
  color: var(--card-text-color);
  font-family: var(--card-font-family);
  font-size: var(--card-font-size);
  padding: var(--card-padding);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-box-shadow);
  width: 100%;
  height: fit-content;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.weibo-card.empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 2px dashed #ddd;
  box-shadow: none;
}

.weibo-card:not(.empty):hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.user-info .nickname {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.2;
  text-align: left;
}

.user-info .meta {
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

.card-content {
  width: 95%;
  margin: 0 auto;
  font-size: var(--card-font-size);
  line-height: 1.6;
  white-space: pre-wrap;
  text-align: left;
}

.card-content .weibo-tag {
  background-color: #fef0e7;
  /* 浅橙色背景 */
  color: #f86b1d;
  /* 深橙色文字 */
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.card-content .weibo-tag:hover {
  background-color: #fde2d3;
  /* 悬停时背景色稍微加深 */
  color: #e85d0f;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
}

.secondary-button {
  background-color: #f0f0f0;
  color: var(--text-color);
}

button:hover {
  opacity: 0.9;
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .preview-canvas {
    position: static;
    padding: 20px 0;
  }

  .floating-background {
    width: var(--card-width);
    max-width: 100%;
    margin: 0 auto;
  }

  .weibo-card-wrapper {
    width: 100%;
    max-width: var(--card-width);
  }
}

.powered-by {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  margin-bottom: -10px;
}

.powered-by span {
  max-width: 30em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: #606060;
  padding: 8px 16px;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: rgb(255, 255, 255);
  font-size: 13px;
}



.download-button:disabled {
  background: #91caff;
  cursor: not-allowed;
}

.download-button .icon {
  font-size: 16px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>