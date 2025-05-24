import { issues } from '../../lib/data.js';

export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'IDが指定されていません' }, { status: 400 });
    }

    const issueIndex = issues.findIndex(i => i.id === id);
    
    if (issueIndex === -1) {
      return Response.json({ error: '課題が見つかりません' }, { status: 404 });
    }

    // 更新された課題で置き換え
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updateData
    };

    return Response.json({
      success: true,
      data: issues[issueIndex]
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      success: false,
      error: 'サーバーエラーが発生しました' 
    }, { status: 500 });
  }
} 