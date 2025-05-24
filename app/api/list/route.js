import { issues } from '../../lib/data.js';

// GETリクエストのハンドラー
export async function GET() {
  return Response.json(issues);
}