import { NextResponse } from 'next/server';
import { issues } from '../register/route';

// メモリ内のデータストアを/api/registerと共有
let registeredIssues = [];

export async function POST(request) {
  try {
    const body = await request.json();

    // リクエストのバリデーション
    if (!body.content || !Array.isArray(body.content) || body.content.length === 0) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: '無効なリクエスト形式です'
      }, { status: 400 });
    }

    // IDの存在チェック
    const requestedId = body.content[0].id;
    if (!requestedId) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: 'IDが指定されていません'
      }, { status: 400 });
    }

    // 指定されたIDの課題を検索
    const issue = issues.find(issue => issue.id === requestedId);

    if (!issue) {
      return NextResponse.json({
        success: false,
        status: 404,
        message: '指定されたIDの課題が見つかりません'
      }, { status: 404 });
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      status: 200,
      data: {
        id: issue.id,
        registration_date: issue.registration_date,
        Inputter_name: issue.Inputter_name,
        priority: issue.priority,
        title: issue.title,
        content: issue.content,
        tag: issue.tag,
        limit: issue.limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Detail fetch error:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 