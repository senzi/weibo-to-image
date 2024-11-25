# 微博转长图 (Weibo to Weibo.png)

一个简洁优雅的微博内容转图片工具,可以将微博内容转换为精美的分享图片。

## 功能特点

- 支持自定义微博用户信息(昵称、头像、发布时间等)
- 支持话题标签自动高亮显示 
- 提供多种精美模板样式
  - 默认模板:简洁清晰的白色卡片设计
  - LXGW 雅墨:优雅简约的东方文韵设计 
  - 深色模板:高对比度的暗色主题
- 实时预览生成效果
- 一键导出高清PNG图片
- 自适应布局,支持移动端访问
- 本地数据持久化存储

## 技术栈

- Vue 3 + TypeScript
- Vue Use
- HTML to Image
- FileSaver.js
- Normalize.css
- LXGW WenKai 字体

## 使用方法

1. 在左侧表单填写微博内容信息
2. 选择喜欢的模板样式
3. 实时预览右侧效果
4. 点击"下载图片"按钮导出

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## License

MIT