'use server';

import { requireAuth } from './authorization.action';
import * as unzipper from 'unzipper';
import { XMLParser } from 'fast-xml-parser';

export interface ImportedSlide {
  html: string;
}

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

/** Extract plain text recursively from an XML-parsed object */
function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return typeof node === 'string' ? node : '';
  if (Array.isArray(node)) return node.map(extractText).join(' ');

  const obj = node as Record<string, unknown>;
  // a:t is the leaf text element in PPTX
  if ('a:t' in obj) return extractText(obj['a:t']);

  return Object.values(obj).map(extractText).join('');
}

/** Build a minimal HTML representation of a slide's text content */
function slideXmlToHtml(slideXml: string): string {
  let parsed: unknown;
  try {
    parsed = xmlParser.parse(slideXml);
  } catch {
    return '<p></p>';
  }

  const spTree =
    (parsed as any)?.['p:sld']?.['p:cSld']?.['p:spTree'];
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
  const html = [`<h2>${first}</h2>`, ...rest.map((t) => `<p>${t}</p>`)].join(
    '\n',
  );
  return html;
}

export async function importPptx(
  formData: FormData,
): Promise<ImportedSlide[]> {
  await requireAuth();

  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('No file provided');
  if (!file.name.endsWith('.pptx')) throw new Error('File must be a .pptx');

  // 20 MB limit
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large (max 20 MB)');

  const buffer = Buffer.from(await file.arrayBuffer());

  const slides: ImportedSlide[] = [];

  const directory = await unzipper.Open.buffer(buffer);

  // Collect slide files, sorted by name (slide1.xml, slide2.xml, ...)
  const slideFiles = directory.files
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f.path))
    .sort((a, b) => {
      const numA = parseInt(a.path.match(/\d+/)?.[0] ?? '0', 10);
      const numB = parseInt(b.path.match(/\d+/)?.[0] ?? '0', 10);
      return numA - numB;
    });

  for (const slideFile of slideFiles) {
    const content = await slideFile.buffer();
    const xml = content.toString('utf-8');
    const html = slideXmlToHtml(xml);
    slides.push({ html });
  }

  return slides;
}
