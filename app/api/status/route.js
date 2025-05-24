import { issues } from '../../lib/data.js';

export async function PUT(request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // バリデーション: 必須フィールドの確認
    if (body.id === undefined || body.id === null) {
      return Response.json(
        {
          id: body.id || null,
          success: false,
          status: 400,
          message: "IDは必須です"
        },
        { status: 400 }
      );
    }
    
    if (body.flg === undefined || body.flg === null) {
      return Response.json(
        {
          id: body.id,
          success: false,
          status: 400,
          message: "フラグは必須です"
        },
        { status: 400 }
      );
    }
    
    // idが数値かチェック
    const id = Number(body.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return Response.json(
        {
          id: body.id,
          success: false,
          status: 400,
          message: "IDは正の整数である必要があります"
        },
        { status: 400 }
      );
    }
    
    // flgが0または1かチェック
    const flg = Number(body.flg);
    if (flg !== 0 && flg !== 1) {
      return Response.json(
        {
          id: id,
          success: false,
          status: 400,
          message: "フラグは0または1である必要があります"
        },
        { status: 400 }
      );
    }
    
    // issuesデータから該当IDの課題を検索・更新
    const issueIndex = issues.findIndex(issue => issue.id === id);
    
    if (issueIndex === -1) {
      return Response.json(
        {
          id: id,
          success: false,
          status: 400,
          message: "指定されたIDの課題が見つかりません"
        },
        { status: 400 }
      );
    }
    
    // フラグを更新（0 -> false, 1 -> true）
    const booleanFlg = flg === 1;
    issues[issueIndex].flg = booleanFlg;
    
    // 更新成功
    console.log(`課題ID ${id} のステータスを ${flg} (${flg === 1 ? '解決済み' : '未解決'}) に更新しました`);
    console.log('更新された課題:', issues[issueIndex]);
    
    return Response.json(
      {
        id: id,
        success: true
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating issue status:', error);
    
    // JSONパースエラーの場合
    if (error instanceof SyntaxError) {
      return Response.json(
        {
          id: null,
          success: false,
          status: 400,
          message: "無効なJSON形式です"
        },
        { status: 400 }
      );
    }
    
    // その他のサーバーエラー
    return Response.json(
      {
        id: null,
        success: false,
        status: 500,
        message: "サーバー内部エラーが発生しました"
      },
      { status: 500 }
    );
  }
}

// GETメソッドは対応していないことを明示
export async function GET() {
  return Response.json(
    {
      success: false,
      status: 405,
      message: "このエンドポイントはPUTメソッドのみ対応しています"
    },
    { status: 405 }
  );
}

// POSTメソッドは対応していないことを明示
export async function POST() {
  return Response.json(
    {
      success: false,
      status: 405,
      message: "このエンドポイントはPUTメソッドのみ対応しています"
    },
    { status: 405 }
  );
} 