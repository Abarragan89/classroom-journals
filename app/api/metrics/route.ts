import { NextResponse } from 'next/server';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export async function GET() {
    const metrics = await registry.metrics();
    return new NextResponse(metrics, {
        headers: {
            'Content-Type': registry.contentType,
        },
    });
}