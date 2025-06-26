import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GETリクエストのハンドラー
export async function GET(request) {
  try {
    // 認証ヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: '認証が必要です'
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
        error: '無効な認証トークンです'
      }, { status: 401 });
    }

    // ユーザーの課題一覧を取得
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(issues);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}