'use client';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PdfSlide({ url }: { url: string }) {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    return (
        <div className="w-full flex flex-col items-center gap-3 bg-muted/40 rounded-md p-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 self-end">
                <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                    disabled={scale <= 0.5}
                    className="text-sm px-2 py-1 rounded border disabled:opacity-40"
                >
                    −
                </button>
                <span className="text-sm text-muted-foreground w-12 text-center" aria-label={`Zoom level: ${Math.round(scale * 100)}%`}>{Math.round(scale * 100)}%</span>
                <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)))}
                    disabled={scale >= 3}
                    className="text-sm px-2 py-1 rounded border disabled:opacity-40"
                >
                    +
                </button>
            </div>

            <div className="overflow-auto">
                <Document
                    file={`/api/pdf-proxy?url=${encodeURIComponent(url)}`}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                    <Page pageNumber={pageNumber} scale={scale} />
                </Document>
            </div>

            {numPages > 1 && (
                <div className="flex items-center gap-3 mt-2">
                    <button
                        type="button"
                        aria-label="Previous page"
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="text-sm px-2 py-1 rounded border disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-muted-foreground" aria-label={`Page ${pageNumber} of ${numPages}`}>{pageNumber} / {numPages}</span>
                    <button
                        type="button"
                        aria-label="Next page"
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        className="text-sm px-2 py-1 rounded border disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
