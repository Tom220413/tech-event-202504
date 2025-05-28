import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request) {
  try {
    // 認証ヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: '認証が必要です'
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // 認証されたユーザーのコンテキストでSupabaseクライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: '無効な認証トークンです'
      }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();
    
    // バリデーション: 必須フィールドの確認
    if (body.id === undefined || body.id === null) {
      return NextResponse.json({
        id: body.id || null,
        success: false,
        status: 400,
        message: "IDは必須です"
      }, { status: 400 });
    }
    
    if (body.flg === undefined || body.flg === null) {
      return NextResponse.json({
        id: body.id,
        success: false,
        status: 400,
        message: "フラグは必須です"
      }, { status: 400 });
    }
    
    // idが数値かチェック
    const id = Number(body.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json({
        id: body.id,
        success: false,
        status: 400,
        message: "IDは正の整数である必要があります"
      }, { status: 400 });
    }
    
    // flgが0または1かチェック
    const flg = Number(body.flg);
    if (flg !== 0 && flg !== 1) {
      return NextResponse.json({
        id: id,
        success: false,
        status: 400,
        message: "フラグは0または1である必要があります"
      }, { status: 400 });
    }
    
    // フラグを更新（0 -> false, 1 -> true）
    const booleanFlg = flg === 1;
    
    try {
      const { data: updatedIssue, error: updateError } = await supabase
        .from('issues')
        .update({ is_resolved: booleanFlg })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) {
        if (updateError.message.includes('No rows found')) {
          return NextResponse.json({
            id: id,
            success: false,
            status: 404,
            message: "指定されたIDの課題が見つかりません"
          }, { status: 404 });
        }
        throw updateError;
      }
      
      // 成功レスポンス
      return NextResponse.json({
        id: id,
        success: true,
        status: 200,
        message: `課題ID ${id} のステータスを${booleanFlg ? '解決済み' : '未解決'}に更新しました`,
        data: {
          id: updatedIssue.id,
          is_resolved: updatedIssue.is_resolved,
          updated_at: updatedIssue.updated_at
        }
      }, { status: 200 });
      
    } catch (dbError) {
      if (dbError.message.includes('No rows found')) {
        return NextResponse.json({
          id: id,
          success: false,
          status: 404,
          message: "指定されたIDの課題が見つかりません"
        }, { status: 404 });
      }
      
      throw dbError;
    }

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: 'サーバーエラーが発生しました: ' + error.message
    }, { status: 500 });
  }
}

// GETメソッドは対応していないことを明示
export async function GET() {
  return NextResponse.json({
    success: false,
    status: 405,
    message: "このエンドポイントはPUTメソッドのみ対応しています"
  }, { status: 405 });
}

// POSTメソッドは対応していないことを明示
export async function POST() {
  return NextResponse.json({
    success: false,
    status: 405,
    message: "このエンドポイントはPUTメソッドのみ対応しています"
  }, { status: 405 });
} 