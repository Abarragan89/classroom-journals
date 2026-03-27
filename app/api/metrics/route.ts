import { NextResponse } from 'next/server';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export async function GET(request: Request) {
  const token = request.headers.get('authorization');
  
  if (token !== `Bearer ${process.env.METRICS_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const metrics = await registry.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': registry.contentType,
    },
  });
}