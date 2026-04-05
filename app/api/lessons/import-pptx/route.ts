import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import * as unzipper from 'unzipper';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

function extractText(node: unknown): string {
    if (!node || typeof node !== 'object')
        return typeof node === 'string' ? node : '';
    if (Array.isArray(node)) return node.map(extractText).join(' ');

    const obj = node as Record<string, unknown>;
    if ('a:t' in obj) return extractText(obj['a:t']);
    return Object.values(obj).map(extractText).join('');
}

function slideXmlToHtml(slideXml: string): string {
    let parsed: unknown;
    try {
        parsed = xmlParser.parse(slideXml);
    } catch {
        return '<p></p>';
    }

    const spTree = (parsed as any)?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) return '<p></p>';

    const shapes: unknown[] = Array.isArray(spTree['p:sp'])
        ? spTree['p:sp']
        : spTree['p:sp']
            ? [spTree['p:sp']]
            : [];

    const textBlocks: string[] = [];

    for (const shape of shapes) {
        const txBody = (shape as any)?.['p:txBody'];
        if (!txBody) continue;

        const paragraphs: unknown[] = Array.isArray(txBody['a:p'])
            ? txBody['a:p']
            : txBody['a:p']
                ? [txBody['a:p']]
                : [];

        for (const para of paragraphs) {
            const text = extractText((para as any)?.['a:r']).trim();
            if (text) textBlocks.push(text);
        }
    }

    if (textBlocks.length === 0) return '<p></p>';

    const [first, ...rest] = textBlocks;
    return [`<h2>${first}</h2>`, ...rest.map((t) => `<p>${t}</p>`)].join('\n');
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        if (!file.name.endsWith('.pptx')) {
            return NextResponse.json(
                { error: 'File must be a .pptx' },
                { status: 400 },
            );
        }
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large (max 20 MB)' },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const directory = await unzipper.Open.buffer(buffer);

        const slideFiles = directory.files
            .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f.path))
            .sort((a, b) => {
                const numA = parseInt(a.path.match(/\d+/)?.[0] ?? '0', 10);
                const numB = parseInt(b.path.match(/\d+/)?.[0] ?? '0', 10);
                return numA - numB;
            });

        const slides: { html: string }[] = [];
        for (const slideFile of slideFiles) {
            const content = await slideFile.buffer();
            const xml = content.toString('utf-8');
            slides.push({ html: slideXmlToHtml(xml) });
        }

        return NextResponse.json({ slides });
    } catch {
        return NextResponse.json(
            { error: 'Failed to parse PPTX' },
            { status: 500 },
        );
    }
}
