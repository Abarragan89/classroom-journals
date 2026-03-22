'use client';
import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadQuestionAttachment, deleteAttachmentsFromS3 } from '@/lib/actions/s3-upload';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface Props {
    attachments: string[];
    onChange: (urls: string[]) => void;
    disabled?: boolean;
}

function isPdf(url: string) {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf');
}

function getFilename(url: string) {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'file');
}

export default function QuestionAttachmentUploader({ attachments, onChange, disabled }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setError('');
        setUploading(true);

        try {
            const uploaded: string[] = [];
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

                let fileToUpload: File = file;

                // Compress images before upload
                if (file.type !== 'application/pdf') {
                    fileToUpload = await imageCompression(file, {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        initialQuality: 0.85,
                    });
                }

                const formData = new FormData();
                formData.append('file', fileToUpload, file.name);
                const result = await uploadQuestionAttachment(formData);

                if (result.success && result.url) {
                    uploaded.push(result.url);
                } else {
                    setError(result.message ?? 'Upload failed.');
                }
            }
            if (uploaded.length > 0) {
                onChange([...attachments, ...uploaded]);
            }
        } catch (err) {
            console.error('Attachment upload error:', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            // Reset input so the same file can be re-selected
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function handleRemove(url: string) {
        onChange(attachments.filter((a) => a !== url));
        // Fire-and-forget S3 cleanup
        deleteAttachmentsFromS3([url]).catch(console.error);
    }
console.log('Current attachments:', attachments);
    return (
        <div className="mt-2 space-y-2">
            {/* Thumbnail strip */}
            {attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
                                    <img
                                        src={url}
                                        alt="attachment"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemove(url)}
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
                    disabled={disabled || uploading}
                    onClick={() => inputRef.current?.click()}
                    className="gap-1.5 text-xs"
                >
                    {uploading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Paperclip size={14} />
                    )}
                    {uploading ? 'Uploading...' : 'Attach file'}
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
}
