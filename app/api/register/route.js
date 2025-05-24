import { NextResponse } from 'next/server';
import { issues } from '../../../lib/data.js';

export async function POST(request) {
  try {
    const body = await request.json();

    // バリデーション
    if (!body.Inputter_name || !body.priority || !body.title || !body.content || !body.tag || !body.limit) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: '必須項目が不足しています'
      }, { status: 400 });
    }

    // タイトルの長さチェック
    if (body.title.length > 30) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: 'タイトルは30文字以内で入力してください'
      }, { status: 400 });
    }

    // 内容の長さチェック
    if (body.content.length > 225) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: '内容は225文字以内で入力してください'
      }, { status: 400 });
    }

    // 日付のバリデーション
    const limitDate = new Date(body.limit);
    if (isNaN(limitDate.getTime())) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: '有効な日付を入力してください'
      }, { status: 400 });
    }

    // 優先度のバリデーション
    const validPriorities = ['高', '中', '低'];
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: '無効な優先度です'
      }, { status: 400 });
    }

    // タグのバリデーション
    const validTags = ['開発', 'デザイン', 'ドキュメント', 'インフラ', 'その他'];
    if (!validTags.includes(body.tag)) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        success: false,
        status: 400,
        message: '無効なタグです'
      }, { status: 400 });
    }

    // 新しいIssueの作成
    const newIssue = {
      id: crypto.randomUUID(),
      registration_date: new Date(),
      Inputter_name: body.Inputter_name,
      priority: body.priority,
      title: body.title,
      content: body.content,
      tag: body.tag,
      limit: limitDate
    };

    // メモリ内の配列に追加
    issues.push(newIssue);

    return NextResponse.json({
      id: newIssue.id,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      id: crypto.randomUUID(),
      success: false,
      status: 500,
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 