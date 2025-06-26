'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import styles from './auth.module.css'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, { display_name: displayName })
      }
      router.push('/')
    } catch (error) {
      setError(error.message || '認証に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>
          {isLogin ? 'ログイン' : 'アカウント作成'}
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="displayName">表示名</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
          </button>
        </form>

        <div className={styles.switchMode}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={styles.switchButton}
          >
            {isLogin ? 'アカウントを作成' : 'ログインに戻る'}
          </button>
        </div>
      </div>
    </div>
  )
} 