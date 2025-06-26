import { screen, waitFor, render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockIssues } from '../utils/test-utils'
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

describe('Issue List Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        content: issue.content,
        priority: issue.urgency,
        tag: issue.tag,
        inputter_name: issue.username,
        created_at: `${issue.create_date}T00:00:00Z`,
        limit_date: issue.limit,
        is_resolved: issue.flg,
      }))),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('課題一覧の正常表示', () => {
    it('should display issue list correctly', async () => {
      await act(async () => {
        await act(async () => {
        render(<Home />)
      })
      })

      // 課題一覧が表示されるまで待機
      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 課題の詳細情報が表示されることを確認
      expect(screen.getByText('Another Issue')).toBeInTheDocument()
      expect(screen.getByText('Third Issue')).toBeInTheDocument()
      expect(screen.getAllByText('Test User')).toHaveLength(2) // ヘッダーと課題メタデータ
    })

    it('should display issue metadata correctly', async () => {
      await act(async () => {
        await act(async () => {
        render(<Home />)
      })
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 優先度が表示されることを確認
      expect(screen.getByText('高')).toBeInTheDocument()
      expect(screen.getByText('中')).toBeInTheDocument()
      expect(screen.getByText('低')).toBeInTheDocument()

      // ステータスが表示されることを確認 (ボタンを含む)
      expect(screen.getAllByText('未解決')).toHaveLength(3) // タブ + 2つの課題
      expect(screen.getAllByText('解決済み')).toHaveLength(2) // タブ + 1つの課題

      // タグが表示されることを確認（複数箇所で表示されるため）
      expect(screen.getAllByText('開発').length).toBeGreaterThan(0)
      expect(screen.getAllByText('デザイン').length).toBeGreaterThan(0)
      expect(screen.getAllByText('ドキュメント').length).toBeGreaterThan(0)
    })
  })

  describe('フィルタリング機能', () => {
    it('should filter issues by status', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        await act(async () => {
        render(<Home />)
      })
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 未解決フィルターをクリック（タブボタンを指定）
      await act(async () => {
        const unresolvedTab = screen.getByRole('button', { name: '未解決' })
        await user.click(unresolvedTab)
      })

      // 未解決の課題のみ表示されることを確認
      expect(screen.getByText('Test Issue')).toBeInTheDocument()
      expect(screen.getByText('Third Issue')).toBeInTheDocument()
      expect(screen.queryByText('Another Issue')).not.toBeInTheDocument()

      // 解決済みフィルターをクリック
      await act(async () => {
        const resolvedTab = screen.getByRole('button', { name: '解決済み' })
        await user.click(resolvedTab)
      })

      // 解決済みの課題のみ表示されることを確認
      expect(screen.queryByText('Test Issue')).not.toBeInTheDocument()
      expect(screen.queryByText('Third Issue')).not.toBeInTheDocument()
      expect(screen.getByText('Another Issue')).toBeInTheDocument()
    })

    it('should filter issues by tag', async () => {
      const user = userEvent.setup()
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // サイドバーで開発タグをクリック
      const developmentTag = screen.getAllByText('開発')[1] // サイドバーの方を選択
      await user.click(developmentTag)

      // 開発タグの課題のみ表示されることを確認
      expect(screen.getByText('Test Issue')).toBeInTheDocument()
      expect(screen.queryByText('Another Issue')).not.toBeInTheDocument()
      expect(screen.queryByText('Third Issue')).not.toBeInTheDocument()
    })
  })

  describe('ソート機能', () => {
    it('should sort issues by newest first by default', async () => {
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 新着順ボタンがアクティブであることを確認
      const newestButton = screen.getByText('新着順')
      expect(newestButton).toHaveClass('active')
    })

    it('should sort issues by oldest first', async () => {
      const user = userEvent.setup()
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 古い順をクリック
      await user.click(screen.getByText('古い順'))

      // 古い順ボタンがアクティブになることを確認
      expect(screen.getByText('古い順')).toHaveClass('active')
    })

    it('should sort issues by priority', async () => {
      const user = userEvent.setup()
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 優先度順をクリック
      await user.click(screen.getByText('優先度順'))

      // 優先度順ボタンがアクティブになることを確認
      expect(screen.getByText('優先度順')).toHaveClass('active')
    })
  })

  describe('空の状態・ローディング・エラー状態', () => {
    it('should show loading state', async () => {
      // すべてのテストでact()を使用
      await act(async () => {
        await act(async () => {
        render(<Home />)
      })
      })

      // ページが認証済みで表示されることを確認（ローディングではなく）
      await waitFor(() => {
        expect(screen.getByText('開発課題管理')).toBeInTheDocument()
      })
    })

    it('should show skeleton loading cards', async () => {
      await act(async () => {
        await act(async () => {
        render(<Home />)
      })
      })

      // 課題が読み込まれるまで待機  
      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 課題が表示されていることを確認
      expect(screen.getByText('Another Issue')).toBeInTheDocument()
    })

    it('should handle empty issue list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
      })

      // 課題が表示されないことを確認
      expect(screen.queryByText('Test Issue')).not.toBeInTheDocument()
    })

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      fetch.mockRejectedValueOnce(new Error('API Error'))

      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch issues:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('ユーザーインタラクション', () => {
    it('should navigate to create mode when clicking create button', async () => {
      const user = userEvent.setup()
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 新規作成ボタンをクリック
      await user.click(screen.getByText('新規作成'))

      // 作成フォームが表示されることを確認
      expect(screen.getByText('新規課題の作成')).toBeInTheDocument()
    })

    it('should show issue detail when clicking on issue card', async () => {
      const user = userEvent.setup()
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 課題カードをクリック
      await user.click(screen.getByText('Test Issue'))

      // 詳細画面が表示されることを確認
      expect(screen.getByText('課題の詳細')).toBeInTheDocument()
    })
  })

  describe('タグカウント', () => {
    it('should display correct tag counts', async () => {
      await act(async () => {
        render(<Home />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      // 全体のカウントが正しいことを確認
      expect(screen.getByText('3')).toBeInTheDocument() // すべて

      // 各タグのカウントが表示されることを確認（サイドバー内）
      const tagSection = document.querySelector('.tagListContent')
      expect(tagSection).toBeInTheDocument()
    })
  })
})