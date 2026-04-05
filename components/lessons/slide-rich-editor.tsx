'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect, useRef } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Minus,
    Heading1,
    Heading2,
    Heading3,
    Palette,
} from 'lucide-react';

interface SlideRichEditorProps {
    html: string;
    onChange: (html: string) => void;
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

function ToolbarBtn({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent editor blur
                onClick();
            }}
            title={title}
            className={`inline-flex items-center justify-center w-7 h-7 rounded text-sm transition-colors
                ${active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
        >
            {children}
        </button>
    );
}

export default function SlideRichEditor({ html, onChange }: SlideRichEditorProps) {
    const prevHtmlRef = useRef<string>(html);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                // History included by default in StarterKit
            }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
        ],
        content: html,
        onUpdate({ editor }) {
            const newHtml = editor.getHTML();
            prevHtmlRef.current = newHtml;
            onChange(newHtml);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[240px] p-4',
            },
        },
    });

    // Sync editor content when selected slide changes
    useEffect(() => {
        if (!editor) return;
        if (html !== prevHtmlRef.current) {
            prevHtmlRef.current = html;
            editor.commands.setContent(html);
        }
    }, [html, editor]);

    if (!editor) return null;

    return (
        <div className="border rounded-md overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40 shrink-0">
                {/* Headings */}
                <ToolbarBtn
                    title="Heading 1"
                    active={editor.isActive('heading', { level: 1 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 size={14} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 size={14} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 size={14} />
                </ToolbarBtn>

                <ToolbarDivider />

                {/* Inline styles */}
                <ToolbarBtn
                    title="Bold"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={13} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Italic"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={13} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Underline"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon size={13} />
                </ToolbarBtn>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarBtn
                    title="Bullet list"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={14} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Numbered list"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={14} />
                </ToolbarBtn>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarBtn
                    title="Align left"
                    active={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft size={13} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Align center"
                    active={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter size={13} />
                </ToolbarBtn>
                <ToolbarBtn
                    title="Align right"
                    active={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight size={13} />
                </ToolbarBtn>

                <ToolbarDivider />

                {/* Horizontal rule */}
                <ToolbarBtn
                    title="Insert horizontal line"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus size={13} />
                </ToolbarBtn>

                <ToolbarDivider />

                {/* Text color */}
                <div className="relative inline-flex">
                    <button
                        type="button"
                        title="Text color"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            colorInputRef.current?.click();
                        }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Palette size={13} />
                    </button>
                    <input
                        ref={colorInputRef}
                        type="color"
                        className="absolute opacity-0 w-0 h-0 pointer-events-none"
                        defaultValue="#000000"
                        onChange={(e) => {
                            editor.chain().focus().setColor(e.target.value).run();
                        }}
                        aria-label="Pick text color"
                    />
                </div>
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} className="flex-1 overflow-auto" />
        </div>
    );
}
