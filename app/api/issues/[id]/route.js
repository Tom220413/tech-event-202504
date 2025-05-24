import { issues } from '../../../lib/data.js';

export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    // 数値IDの場合は数値に変換
    const numericId = !isNaN(id) ? parseInt(id) : id;
    
    const issue = issues.find(i => i.id === numericId);
    
    if (!issue) {
      return Response.json({ error: '課題が見つかりません' }, { status: 404 });
    }

    return Response.json(issue);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 