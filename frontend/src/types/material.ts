export interface Material {
  id: string
  user_id: string
  title: string
  markdown_content: string
  tags: string[]
  word_count: number
  last_studied_at: string | null
  is_indexed: boolean
  created_at: string
  updated_at: string
}

export interface MaterialCreate {
  title: string
  markdown_content?: string
  tags?: string[]
}

export interface MaterialUpdate {
  title?: string
  markdown_content?: string
  tags?: string[]
}
