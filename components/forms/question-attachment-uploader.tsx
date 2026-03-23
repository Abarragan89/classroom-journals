'use client';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadQuestionAttachment, deleteAttachmentsFromS3 } from '@/lib/actions/s3-upload';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileText, Loader2 } from 'lucide-react';

export interface UploaderHandle {
    uploadPending(): Promise<string[]>;
    hasPending(): boolean;
}

interface PendingFile {
    id: string;
    file: File;
    previewUrl: string;
}

interface Props {
    attachments: string[];
    onChange: (urls: string[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
    disabled?: boolean;
}

function isPdf(url: string) {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf');
}

function getFilename(url: string) {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'file');
}

const QuestionAttachmentUploader = forwardRef<UploaderHandle, Props>(function QuestionAttachmentUploader(
    { attachments, onChange, onUploadingChange, disabled },
    ref
) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useImperativeHandle(ref, () => ({
        async uploadPending(): Promise<string[]> {
            if (pendingFiles.length === 0) return attachments;
            onUploadingChange?.(true);
            try {
                const uploaded: string[] = [];
                for (const pending of pendingFiles) {
                    const formData = new FormData();
                    formData.append('file', pending.file, pending.file.name);
                    const result = await uploadQuestionAttachment(formData);
                    if (result.success && result.url) {
                        uploaded.push(result.url);
                    } else {
                        throw new Error(result.message ?? 'Upload failed.');
                    }
                }
                // Revoke blob URLs now that we have real S3 URLs
                pendingFiles.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
                setPendingFiles([]);
                const finalUrls = [...attachments, ...uploaded];
                onChange(finalUrls);
                return finalUrls;
            } finally {
                onUploadingChange?.(false);
            }
        },
        hasPending(): boolean {
            return pendingFiles.length > 0;
        },
    }), [pendingFiles, attachments, onChange, onUploadingChange]);

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setError('');
        setProcessing(true);
        try {
            const newPending: PendingFile[] = [];
            for (const file of files) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
                if (!validTypes.includes(file.type)) {
                    setError('Invalid file type. Use JPEG, PNG, WebP, or PDF.');
                    continue;
                }
                if (file.size > 10 * 1024 * 1024) {
                    setError('File must be under 10MB.');
                    continue;
                }

                let fileToStore: File = file;

                // Compress images locally before previewing
                if (file.type !== 'application/pdf') {
                    fileToStore = await imageCompression(file, {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        initialQuality: 0.85,
                    });
                }

                newPending.push({
                    id: `${Date.now()}-${Math.random()}`,
                    file: fileToStore,
                    previewUrl: file.type !== 'application/pdf' ? URL.createObjectURL(fileToStore) : '',
                });
            }
            if (newPending.length > 0) {
                setPendingFiles(prev => [...prev, ...newPending]);
            }
        } catch (err) {
            console.error('File processing error:', err);
            setError('Failed to process file. Please try again.');
        } finally {
            setProcessing(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    function handleRemovePending(id: string) {
        setPendingFiles(prev => {
            const target = prev.find(p => p.id === id);
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter(p => p.id !== id);
        });
    }

    async function handleRemoveUploaded(url: string) {
        onChange(attachments.filter((a) => a !== url));
        deleteAttachmentsFromS3([url]).catch(console.error);
    }

    const hasItems = (attachments?.length ?? 0) > 0 || pendingFiles.length > 0;

    return (
        <div className="mt-2 space-y-2">
            {/* Thumbnail strip */}
            {hasItems && (
                <div className="flex flex-wrap gap-2">
                    {/* Already-uploaded (S3) files */}
                    {attachments.map((url) => (
                        <div key={url} className="relative group">
                            {isPdf(url) ? (
                                <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2 text-xs text-muted-foreground max-w-[180px]">
                                    <FileText size={16} className="shrink-0 text-primary" />
                                    <span className="truncate">{getFilename(url)}</span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-md overflow-hidden border bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemoveUploaded(url)}
                                disabled={disabled}
                                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Remove attachment"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    {/* Pending (local preview, not yet uploaded to S3) files */}
                    {pendingFiles.map((p) => (
                        <div key={p.id} className="relative group">
                            {p.file.type === 'application/pdf' ? (
                                <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2 text-xs text-muted-foreground max-w-[180px] ring-2 ring-amber-400/60">
                                    <FileText size={16} className="shrink-0 text-primary" />
                                    <span className="truncate">{p.file.name}</span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-md overflow-hidden border bg-muted ring-2 ring-amber-400/60">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.previewUrl} alt="pending attachment" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemovePending(p.id)}
                                disabled={disabled}
                                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Remove attachment"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || processing}
                    onClick={() => inputRef.current?.click()}
                    className="gap-1.5 text-xs"
                >
                    {processing ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Paperclip size={14} />
                    )}
                    {processing ? 'Processing...' : 'Attach file'}
                </Button>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, PDF — max 10MB</span>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
});

export default QuestionAttachmentUploader;
