import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only throw error during runtime, not build time
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    throw new Error('Missing Supabase environment variables')
  }
  // Use placeholder values during build
  console.warn('Supabase environment variables not found during build')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// データベース操作用のヘルパー関数
export const db = {
  // 課題関連
  async getIssues(userId) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getIssueById(id, userId) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async createIssue(issueData, userId) {
    const { data, error } = await supabase
      .from('issues')
      .insert([{
        ...issueData,
        user_id: userId
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateIssue(id, updateData, userId) {
    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteIssue(id, userId) {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) throw error
    return true
  },

  // プロファイル関連
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 認証関連のヘルパー関数
export const auth = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 