import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// プロファイルの存在確認と作成
async function ensureProfile(supabase, user) {
  // プロファイルが存在するかチェック
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code === 'PGRST116') {
    // プロファイルが存在しない場合は作成
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email.split('@')[0]
      }]);

    if (insertError) {
      console.error('Profile creation error:', insertError);
      throw new Error('プロファイルの作成に失敗しました');
    }
  } else if (profileError) {
    throw profileError;
  }
}

export async function POST(request) {
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

    // プロファイルの存在確認と作成
    await ensureProfile(supabase, user);

    const body = await request.json();

    // バリデーション
    if (!body.inputter_name || !body.priority || !body.title || !body.content || !body.tag || !body.limit) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '必須項目が不足しています'
      }, { status: 400 });
    }

    // タイトルの長さチェック
    if (body.title.length > 30) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: 'タイトルは30文字以内で入力してください'
      }, { status: 400 });
    }

    // 内容の長さチェック
    if (body.content.length > 225) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '内容は225文字以内で入力してください'
      }, { status: 400 });
    }

    // 日付のバリデーション
    const limitDate = new Date(body.limit);
    if (isNaN(limitDate.getTime())) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '有効な日付を入力してください'
      }, { status: 400 });
    }

    // 優先度のバリデーション
    const validPriorities = ['高', '中', '低'];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '無効な優先度です'
      }, { status: 400 });
    }

    // タグのバリデーション
    const validTags = ['開発', 'デザイン', 'ドキュメント', 'インフラ', 'その他'];
    if (!validTags.includes(body.tag)) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '無効なタグです'
      }, { status: 400 });
    }

    // Supabaseに課題を作成（RLSポリシーが自動的にuser_idを設定）
    const issueData = {
      title: body.title,
      content: body.content,
      priority: body.priority,
      tag: body.tag,
      limit_date: body.limit,
      inputter_name: body.inputter_name,
      is_resolved: false,
      user_id: user.id  // 明示的にuser_idを設定
    };

    const { data: newIssue, error: insertError } = await supabase
      .from('issues')
      .insert([issueData])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      id: newIssue.id,
      success: true,
      issue: {
        id: newIssue.id,
        create_date: newIssue.created_at.split('T')[0],
        username: newIssue.inputter_name,
        urgency: newIssue.priority,
        title: newIssue.title,
        content: newIssue.content,
        tag: newIssue.tag,
        limit: newIssue.limit_date,
        flg: newIssue.is_resolved
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: 'サーバーエラーが発生しました: ' + error.message
    }, { status: 500 });
  }
} 