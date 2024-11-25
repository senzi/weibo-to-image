// types.ts

export interface CardTemplate {
    id: string
    name: string
    description: string
    style: {
      container: {
        padding: string
        backgroundColor: string
        backgroundImage?: string
        backgroundSize?: string
        backgroundPosition?: string
        borderRadius?: string
        boxShadow?: string
      }
      card: {
        backgroundColor: string
        color: string
        fontFamily?: string
        fontSize?: string
        padding?: string
        borderRadius?: string
        boxShadow?: string
      }
    }
  }
  
  export interface WeiboData {
    nickname: string
    avatar: string
    publishTime: string
    source: string
    content: string
  }