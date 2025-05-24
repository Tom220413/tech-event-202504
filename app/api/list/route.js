import { issues } from '../register/route';

// 優先度の定義
const PRIORITY = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

// タグの定義
const TAGS = {
  DEVELOPMENT: '開発',
  DESIGN: 'デザイン',
  DOCUMENTATION: 'ドキュメント',
  INFRASTRUCTURE: 'インフラ',
  OTHER: 'その他'
};

// GETリクエストのハンドラー
export async function GET(request) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');

    // フィルタリングされたissuesを取得
    let filteredIssues = [...issues];

    // タグでフィルタリング
    if (tag) {
      filteredIssues = filteredIssues.filter(issue => issue.tag === tag);
    }

    // データが存在しない場合は400を返す
    if (filteredIssues.length === 0) {
      return Response.json({
        content: []
      }, { status: 400 });
    }

    // 成功レスポンスを返す
    return Response.json({
      content: filteredIssues.map(issue => ({
        id: issue.id,
        create_date: issue.registration_date,
        username: issue.Inputter_name,
        tag: issue.tag,
        isResolve: false,
        content: issue.content,
        title: issue.title,
        urgency: issue.priority,
        limit: issue.limit
      }))
    }, { status: 200 });

  } catch (error) {
    // エラーレスポンスを返す
    return Response.json({
      content: [{
        success: false,
        status: 500,
        message: error.message || 'Internal Server Error'
      }]
    }, { status: 500 });
  }
}