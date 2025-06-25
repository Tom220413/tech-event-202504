import { screen, waitFor, render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../../app/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock useAuth hook
jest.mock('../../lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        display_name: 'Test User'
      }
    },
    loading: false,
    isAuthenticated: true,
    signOut: jest.fn(),
  }),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('Issue Create Form Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Mock successful fetch for issues list
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const navigateToCreateForm = async () => {
    const user = userEvent.setup()
    
    await act(async () => {
      render(<Home />)
    })

    await waitFor(() => {
      expect(screen.getByText('開発課題管理')).toBeInTheDocument()
    })

    // 新規作成ボタンをクリックして作成フォームに移動
    await act(async () => {
      await user.click(screen.getByText('新規作成'))
    })

    await waitFor(() => {
      expect(screen.getByText('新規課題の作成')).toBeInTheDocument()
    })

    return user
  }

  describe('フォーム入力の動作確認', () => {
    it('should display create form with all fields', async () => {
      await navigateToCreateForm()

      // フォームの各フィールドが表示されることを確認
      expect(screen.getByText('新規課題の作成')).toBeInTheDocument()
      expect(screen.getByLabelText('優先度')).toBeInTheDocument()
      expect(screen.getByLabelText('タイトル')).toBeInTheDocument()
      expect(screen.getByLabelText('内容')).toBeInTheDocument()
      expect(screen.getByLabelText('タグ')).toBeInTheDocument()
      expect(screen.getByLabelText('期限')).toBeInTheDocument()
      expect(screen.getByText('作成する')).toBeInTheDocument()
      expect(screen.getByText('一覧に戻る')).toBeInTheDocument()
    })

    it('should allow input in all form fields', async () => {
      const user = await navigateToCreateForm()

      // 優先度を選択
      const prioritySelect = screen.getByLabelText('優先度')
      await act(async () => {
        await user.selectOptions(prioritySelect, '高')
      })
      expect(prioritySelect.value).toBe('高')

      // タイトルを入力
      const titleInput = screen.getByLabelText('タイトル')
      await act(async () => {
        await user.type(titleInput, 'テスト課題')
      })
      expect(titleInput.value).toBe('テスト課題')

      // 内容を入力
      const contentTextarea = screen.getByLabelText('内容')
      await act(async () => {
        await user.type(contentTextarea, 'テスト課題の詳細内容')
      })
      expect(contentTextarea.value).toBe('テスト課題の詳細内容')

      // タグを選択
      const tagSelect = screen.getByLabelText('タグ')
      await act(async () => {
        await user.selectOptions(tagSelect, 'デザイン')
      })
      expect(tagSelect.value).toBe('デザイン')

      // 期限を入力
      const limitInput = screen.getByLabelText('期限')
      await act(async () => {
        await user.type(limitInput, '2024-12-31')
      })
      expect(limitInput.value).toBe('2024-12-31')
    })

    it('should navigate back to list when clicking back button', async () => {
      const user = await navigateToCreateForm()

      // 一覧に戻るボタンをクリック
      await act(async () => {
        await user.click(screen.getByText('一覧に戻る'))
      })

      // 一覧画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('開発課題管理')).toBeInTheDocument()
        expect(screen.queryByText('新規課題の作成')).not.toBeInTheDocument()
      })
    })
  })

  describe('バリデーションエラー表示', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = await navigateToCreateForm()

      // 空の状態で送信ボタンをクリック
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // バリデーションエラーが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
        expect(screen.getByText('内容は必須です')).toBeInTheDocument()
        expect(screen.getByText('期限は必須です')).toBeInTheDocument()
      })
    })

    it('should clear validation errors when typing in fields', async () => {
      const user = await navigateToCreateForm()

      // 空の状態で送信してエラーを表示
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      await waitFor(() => {
        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
      })

      // タイトルに入力してエラーが消えることを確認
      const titleInput = screen.getByLabelText('タイトル')
      await act(async () => {
        await user.type(titleInput, 'テスト')
      })

      await waitFor(() => {
        expect(screen.queryByText('タイトルは必須です')).not.toBeInTheDocument()
      })
    })

    it('should show error class on input fields with validation errors', async () => {
      const user = await navigateToCreateForm()

      // 空の状態で送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      await waitFor(() => {
        const titleInput = screen.getByLabelText('タイトル')
        const contentTextarea = screen.getByLabelText('内容')
        const limitInput = screen.getByLabelText('期限')

        // エラークラスが適用されることを確認
        expect(titleInput).toHaveClass('error')
        expect(contentTextarea).toHaveClass('error')
        expect(limitInput).toHaveClass('error')
      })
    })
  })

  describe('送信処理の確認', () => {
    it('should submit form with valid data', async () => {
      const user = await navigateToCreateForm()

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'new-issue-id',
          issue: {
            title: 'テスト課題',
            content: 'テスト内容',
            priority: '高',
            tag: '開発',
            limit: '2024-12-31'
          }
        }),
      })

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信ボタンをクリック
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // APIが正しく呼ばれることを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputter_name: 'Test User',
            priority: '中', // デフォルト値
            title: 'テスト課題',
            content: 'テスト内容',
            tag: '開発', // デフォルト値
            limit: '2024-12-31'
          }),
        })
      })
    })

    it('should show loading state during submission', async () => {
      const user = await navigateToCreateForm()

      // Mock delayed API response
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'new-issue-id' })
          }), 100)
        )
      )

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信ボタンをクリック
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // ローディング状態を確認
      expect(screen.getByText('作成中...')).toBeInTheDocument()
      expect(screen.getByText('作成中...')).toBeDisabled()

      // 完了まで待機
      await waitFor(() => {
        expect(screen.queryByText('作成中...')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('成功・失敗時の処理', () => {
    it('should navigate back to list after successful submission', async () => {
      const user = await navigateToCreateForm()

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'new-issue-id',
          issue: {
            title: 'テスト課題',
            content: 'テスト内容'
          }
        }),
      })

      // Mock subsequent fetch for refreshing issues list
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // 一覧画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('開発課題管理')).toBeInTheDocument()
        expect(screen.queryByText('新規課題の作成')).not.toBeInTheDocument()
      })
    })

    it('should display error message on API failure', async () => {
      const user = await navigateToCreateForm()

      // Mock API error
      fetch.mockRejectedValueOnce(new Error('API Error'))

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })

      // フォームが表示されたままであることを確認
      expect(screen.getByText('新規課題の作成')).toBeInTheDocument()
    })

    it('should handle server error response', async () => {
      const user = await navigateToCreateForm()

      // Mock server error response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          message: 'サーバーエラーが発生しました'
        }),
      })

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // サーバーエラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument()
      })
    })

    it('should reset form after successful submission', async () => {
      const user = await navigateToCreateForm()

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'new-issue-id',
          issue: {}
        }),
      })

      // Mock subsequent fetch for list
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // 一覧に戻った後、再度作成フォームに移動
      await waitFor(() => {
        expect(screen.getByText('開発課題管理')).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('新規作成'))
      })

      await waitFor(() => {
        expect(screen.getByText('新規課題の作成')).toBeInTheDocument()
      })

      // フォームがリセットされていることを確認
      expect(screen.getByLabelText('タイトル').value).toBe('')
      expect(screen.getByLabelText('内容').value).toBe('')
      expect(screen.getByLabelText('期限').value).toBe('')
      expect(screen.getByLabelText('優先度').value).toBe('中') // デフォルト値
      expect(screen.getByLabelText('タグ').value).toBe('開発') // デフォルト値
    })
  })

  describe('フォームの状態管理', () => {
    it('should disable form during submission', async () => {
      const user = await navigateToCreateForm()

      // Mock delayed API response
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'new-issue-id' })
          }), 100)
        )
      )

      // フォームに入力
      await act(async () => {
        await user.type(screen.getByLabelText('タイトル'), 'テスト課題')
        await user.type(screen.getByLabelText('内容'), 'テスト内容')
        await user.type(screen.getByLabelText('期限'), '2024-12-31')
      })

      // 送信
      await act(async () => {
        await user.click(screen.getByText('作成する'))
      })

      // 送信ボタンが無効化されて"作成中..."になることを確認
      expect(screen.getByText('作成中...')).toBeDisabled()

      // 完了まで待機
      await waitFor(() => {
        expect(screen.queryByText('作成中...')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })
})