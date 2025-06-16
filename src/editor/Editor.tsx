import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useEffect } from 'react';
import './Editor.css';

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function Editor({
  content,
  onUpdate,
  placeholder = 'Start writing your essay...',
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 bg-white',
        'data-placeholder': placeholder,
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  const setGrammarHighlight = useCallback(
    (start: number, end: number, type: string) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .setTextSelection({ from: start, to: end })
        .setHighlight({ color: getHighlightColor(type) })
        .run();
    },
    [editor]
  );

  const clearHighlights = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
  }, [editor]);

  // Expose methods for grammar checking integration
  useEffect(() => {
    if (editor) {
      (editor as any).setGrammarHighlight = setGrammarHighlight;
      (editor as any).clearHighlights = clearHighlights;
    }
  }, [editor, setGrammarHighlight, clearHighlights]);

  if (!editor) {
    return (
      <div className="min-h-[500px] bg-white border border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MenuBar editor={editor} />
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('bold')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('italic')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('strike')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Strike
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('paragraph')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Paragraph
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('bulletList')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded text-sm font-medium ${
          editor.isActive('orderedList')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Numbered List
      </button>
    </div>
  );
}

function getHighlightColor(type: string): string {
  switch (type) {
    case 'grammar':
      return '#fee2e2'; // red-100
    case 'spelling':
      return '#fef3c7'; // yellow-100
    case 'style':
      return '#dbeafe'; // blue-100
    default:
      return '#f3f4f6'; // gray-100
  }
}
