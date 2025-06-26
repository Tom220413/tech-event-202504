import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request) {
  try {
    // 認証ヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
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
        success: false,
        error: '無効な認証トークンです'
      }, { status: 401 });
    }

    // URLパラメータからIDを取得
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'IDが指定されていません' 
      }, { status: 400 });
    }

    const updateData = await request.json();
    
    // 課題を更新
    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', parseInt(id))
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.message.includes('No rows found')) {
        return NextResponse.json({ 
          success: false,
          error: '課題が見つかりません' 
        }, { status: 404 });
      }
      throw updateError;
    }

    // レスポンス形式を統一
    const formattedIssue = {
      id: updatedIssue.id,
      registration_date: updatedIssue.created_at.split('T')[0],
      Inputter_name: updatedIssue.inputter_name,
      priority: updatedIssue.priority,
      title: updatedIssue.title,
      content: updatedIssue.content,
      tag: updatedIssue.tag,
      limit: updatedIssue.limit_date,
      isResolve: updatedIssue.is_resolved
    };

    return NextResponse.json({
      success: true,
      data: formattedIssue
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'サーバーエラーが発生しました' 
    }, { status: 500 });
  }
} 