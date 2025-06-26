import { issues } from '../../../lib/data.js';

export async function GET(request, { params }) {
  try {
    // Next.js 15では params を await する必要があります（必須）
    const { id } = await params;
    
    // デバッグ用ログ
    console.log('リクエストされたID:', id, 'タイプ:', typeof id);
    console.log('現在のissues:', issues.map(i => ({ id: i.id, title: i.title, type: typeof i.id })));
    
    // 数値IDの場合は数値に変換
    const numericId = !isNaN(id) ? parseInt(id) : id;
    
    const issue = issues.find(i => i.id === numericId);
    
    if (!issue) {
      console.log('課題が見つかりませんでした');
      return Response.json({ error: '課題が見つかりません' }, { status: 404 });
    }

    return Response.json(issue);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 