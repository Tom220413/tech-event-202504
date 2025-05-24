import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // リクエストの内容を検証
    if (!body.content || !Array.isArray(body.content)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // ここでリクエストの内容に応じた処理を実装
    // 例として、受け取ったIDに基づいて何らかのデータを返す
    const responseData = body.content.map(item => ({
      id: item.id,
      // 実際のユースケースに応じて必要なデータを追加
      title: `Item ${item.id}`,
      description: `Description for item ${item.id}`,
      timestamp: new Date().toISOString()
    }));

    // 成功レスポンスを返す
    return NextResponse.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    // エラーハンドリング
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 