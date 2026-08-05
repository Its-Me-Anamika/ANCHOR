import React, { useState, useEffect, useCallback } from 'react';
import { 
  StickyNote, Plus, Trash2, Palette, Sparkles, X, Check, 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  AlertTriangle, Heart, Star, Smile, Coffee, BookOpen, 
  Target, Compass, Gift, Zap, Flame, Rocket, Sun, Cloud, Moon,
  RotateCcw
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useStore } from '../store/useStore';
import { NoteColor, Note } from '../types';

const COLOR_CLASSES: Record<NoteColor, { bg: string; border: string; text: string; headerBg: string; editorBg: string }> = {
  yellow: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    text: 'text-amber-100',
    headerBg: 'bg-amber-500/20',
    editorBg: 'bg-amber-950/60 border-amber-500/50'
  },
  blue: {
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/40',
    text: 'text-sky-100',
    headerBg: 'bg-sky-500/20',
    editorBg: 'bg-sky-950/60 border-sky-500/50'
  },
  green: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-100',
    headerBg: 'bg-emerald-500/20',
    editorBg: 'bg-emerald-950/60 border-emerald-500/50'
  },
  pink: {
    bg: 'bg-pink-950/40',
    border: 'border-pink-500/40',
    text: 'text-pink-100',
    headerBg: 'bg-pink-500/20',
    editorBg: 'bg-pink-950/60 border-pink-500/50'
  },
  purple: {
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    text: 'text-purple-100',
    headerBg: 'bg-purple-500/20',
    editorBg: 'bg-purple-950/60 border-purple-500/50'
  }
};

const STICKERS: Record<string, { icon: React.ComponentType<any>; label: string; color: string; emoji: string }> = {
  star: { icon: Star, label: 'Star', color: 'text-amber-400', emoji: '⭐' },
  heart: { icon: Heart, label: 'Heart', color: 'text-red-400', emoji: '❤️' },
  smile: { icon: Smile, label: 'Smile', color: 'text-yellow-400', emoji: '😊' },
  coffee: { icon: Coffee, label: 'Coffee', color: 'text-amber-600', emoji: '☕' },
  book: { icon: BookOpen, label: 'Book', color: 'text-emerald-400', emoji: '📖' },
  target: { icon: Target, label: 'Target', color: 'text-rose-500', emoji: '🎯' },
  compass: { icon: Compass, label: 'Compass', color: 'text-sky-400', emoji: '🧭' },
  gift: { icon: Gift, label: 'Gift', color: 'text-pink-400', emoji: '🎁' },
  zap: { icon: Zap, label: 'Zap', color: 'text-yellow-300', emoji: '⚡' },
  flame: { icon: Flame, label: 'Flame', color: 'text-orange-500', emoji: '🔥' },
  rocket: { icon: Rocket, label: 'Rocket', color: 'text-purple-400', emoji: '🚀' },
  sun: { icon: Sun, label: 'Sun', color: 'text-sunshine-400', emoji: '☀️' },
  cloud: { icon: Cloud, label: 'Cloud', color: 'text-slate-300', emoji: '☁️' },
  moon: { icon: Moon, label: 'Moon', color: 'text-blue-200', emoji: '🌙' }
};

const TEXT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Coral', value: '#FCA5A5' },
  { name: 'Peach', value: '#FED7AA' },
  { name: 'Sunshine', value: '#FDE047' },
  { name: 'Emerald', value: '#86EFAC' },
  { name: 'Sky', value: '#93C5FD' },
  { name: 'Purple', value: '#C084FC' }
];

const POPULAR_EMOJIS = ['✨', '⭐', '❤️', '😊', '☕', '📖', '🎯', '⚡', '🔥', '🚀', '☀️', '🌈', '💡', '🌸', '🍀', '📌'];

const STICKER_KEYS = Object.keys(STICKERS);
const colors: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'purple'];

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, addToast } = useStore();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // Local edit states
  const [noteColor, setNoteColor] = useState<NoteColor>('yellow');
  const [noteSticker, setNoteSticker] = useState<string | undefined>(undefined);
  const [noteHtml, setNoteHtml] = useState<string>('');

  // Unsaved changes check state
  const [originalNote, setOriginalNote] = useState<{ content: string; color: NoteColor; sticker?: string } | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Draft auto-save state
  const [draftData, setDraftData] = useState<{ html: string; color: NoteColor; sticker?: string } | null>(null);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);

  // Instantiate TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TextStyle,
      Color
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none w-full min-h-[250px] max-h-[350px] overflow-y-auto bg-transparent text-white font-medium scrollable pr-1'
      }
    }
  });

  // Track html changes from TipTap
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      setNoteHtml(editor.getHTML());
    };
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  // Open note for editing
  useEffect(() => {
    if (editingNoteId) {
      const note = notes.find(n => n.id === editingNoteId);
      if (note) {
        setNoteColor(note.color);
        setNoteSticker(note.sticker);
        const initialHtml = note.content || '<p></p>';
        setNoteHtml(initialHtml);
        if (editor) {
          editor.commands.setContent(initialHtml);
        }
        setOriginalNote({
          content: note.content || '',
          color: note.color,
          sticker: note.sticker
        });

        // Check if there is an unsaved draft
        const draft = localStorage.getItem(`anchor_note_draft_${editingNoteId}`);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            if (
              parsed.html !== note.content || 
              parsed.color !== note.color || 
              parsed.sticker !== note.sticker
            ) {
              setDraftData(parsed);
              setShowRestoreNotice(true);
            }
          } catch {}
        }
      }
    } else {
      // Clear states on close
      setNoteColor('yellow');
      setNoteSticker(undefined);
      setNoteHtml('');
      setOriginalNote(null);
      setDraftData(null);
      setShowRestoreNotice(false);
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [editingNoteId, editor, notes]);

  // Auto-save draft on changes
  useEffect(() => {
    if (editingNoteId && editor) {
      localStorage.setItem(
        `anchor_note_draft_${editingNoteId}`,
        JSON.stringify({
          html: noteHtml,
          color: noteColor,
          sticker: noteSticker
        })
      );
    }
  }, [editingNoteId, noteHtml, noteColor, noteSticker, editor]);

  // Check if brand new empty note created (e.g. from Ctrl+N or New Note click)
  useEffect(() => {
    if (notes.length > 0) {
      const latestNote = notes[0];
      const timeSinceCreation = Date.now() - new Date(latestNote.createdAt).getTime();
      // If note is empty and created less than 2.5 seconds ago, auto-open editor modal
      if (latestNote.content === '' && timeSinceCreation < 2500 && !editingNoteId) {
        setEditingNoteId(latestNote.id);
      }
    }
  }, [notes, editingNoteId]);

  const charCount = editor ? editor.getText().length : 0;
  const isOverLimit = charCount > 2000;

  const handleCreateNote = (color: NoteColor) => {
    addNote(color);
  };

  const handleRestoreDraft = () => {
    if (draftData && editor) {
      setNoteColor(draftData.color);
      setNoteSticker(draftData.sticker);
      editor.commands.setContent(draftData.html);
      setNoteHtml(draftData.html);
      setShowRestoreNotice(false);
      addToast('Draft Restored 📝', 'Restored your unsaved changes!', 'success');
    }
  };

  const handleDismissDraft = () => {
    if (editingNoteId) {
      localStorage.removeItem(`anchor_note_draft_${editingNoteId}`);
      setShowRestoreNotice(false);
      setDraftData(null);
    }
  };

  const handleSave = useCallback(() => {
    if (isOverLimit || !editingNoteId) return;

    // Save to global store
    updateNote(editingNoteId, noteHtml, noteColor, noteSticker);
    
    // Clear draft storage
    localStorage.removeItem(`anchor_note_draft_${editingNoteId}`);

    setEditingNoteId(null);
    addToast('Note Saved ⚓', 'Your sanctuary sticky note was updated!', 'success');
  }, [editingNoteId, noteHtml, noteColor, noteSticker, isOverLimit, updateNote, addToast]);

  const handleDiscard = useCallback(() => {
    if (editingNoteId) {
      localStorage.removeItem(`anchor_note_draft_${editingNoteId}`);
      
      // If the note was completely empty and never saved before, delete it to keep clean
      const note = notes.find(n => n.id === editingNoteId);
      if (note && !note.content) {
        deleteNote(editingNoteId);
      }
    }
    setShowWarningModal(false);
    setEditingNoteId(null);
  }, [editingNoteId, notes, deleteNote]);

  const handleCancel = useCallback(() => {
    if (!editingNoteId) return;

    // Check if changes have been made relative to original note
    const hasChanges = originalNote && (
      noteHtml !== originalNote.content ||
      noteColor !== originalNote.color ||
      noteSticker !== originalNote.sticker
    );

    if (hasChanges) {
      setShowWarningModal(true);
    } else {
      // No changes, delete draft and close
      localStorage.removeItem(`anchor_note_draft_${editingNoteId}`);
      setEditingNoteId(null);
    }
  }, [editingNoteId, originalNote, noteHtml, noteColor, noteSticker]);

  // Handle modal keyboard listeners (Ctrl+S & Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingNoteId) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNoteId, handleSave, handleCancel]);

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Fixed Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sunshine-400/20 border border-sunshine-400/30 flex items-center justify-center text-sunshine-400 flex-shrink-0">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>Sticky Notes</span>
              <span className="text-xs bg-sunshine-400/20 text-sunshine-300 border border-sunshine-400/30 px-2 py-0.5 rounded-full font-bold">
                {notes.length} notes
              </span>
            </h1>
            <p className="text-xs text-white/40">Quick thoughts, inspiration, and personal reminders</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => handleCreateNote(color)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-125 cartoon-btn ${
                  color === 'yellow' ? 'bg-amber-400' :
                  color === 'blue' ? 'bg-sky-400' :
                  color === 'green' ? 'bg-emerald-400' :
                  color === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                }`}
                title={`New ${color} note`}
              />
            ))}
          </div>

          <button
            onClick={() => handleCreateNote('yellow')}
            className="px-4 py-2.5 bg-sunshine-400 hover:bg-sunshine-500 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all cartoon-btn shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Scrollable Sticky Notes Grid */}
      <div className="scrollable flex-1 min-h-0 pr-1">
        {notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white/30 bg-white/5 border border-white/10 rounded-2xl h-64">
            <Sparkles className="w-8 h-8 mb-3 text-sunshine-400/50 animate-pulse" />
            <h3 className="text-base font-bold text-white/50">Your sanctuary is quiet</h3>
            <p className="text-xs mt-1">Create a note to capture a thought!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {notes.map(note => {
              const style = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;
              const hasSticker = note.sticker && STICKERS[note.sticker];

              return (
                <div
                  key={note.id}
                  onClick={() => setEditingNoteId(note.id)}
                  className={`relative flex flex-col min-h-[220px] p-5 rounded-2xl border ${style.bg} ${style.border} backdrop-blur-md shadow-xl transition-all duration-300 cartoon-card group cursor-pointer`}
                >
                  {/* Decorative Sticker Badge (Physical paper border aesthetic) */}
                  {hasSticker && note.sticker && (
                    <div className="absolute -top-3.5 -right-3.5 p-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] rotate-12 transition-transform duration-200 group-hover:scale-115 group-hover:rotate-6 z-10">
                      {React.createElement(STICKERS[note.sticker].icon, {
                        className: `w-5 h-5 ${STICKERS[note.sticker].color} stroke-[2.5]`
                      })}
                    </div>
                  )}

                  {/* Card Header controls */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 flex-shrink-0">
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      {/* Quick Color Dots */}
                      <div className="flex items-center gap-1">
                        {colors.map(col => (
                          <button
                            key={col}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateNote(note.id, note.content, col);
                            }}
                            className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${
                              col === 'yellow' ? 'bg-amber-400' :
                              col === 'blue' ? 'bg-sky-400' :
                              col === 'green' ? 'bg-emerald-400' :
                              col === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                            } ${note.color === col ? 'ring-2 ring-white scale-110' : 'opacity-50'}`}
                          />
                        ))}
                      </div>

                      {/* Delete Sticky Card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="p-1 rounded-lg bg-black/20 hover:bg-red-500/30 text-white/60 hover:text-white transition-colors cartoon-btn"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Formatted Content Preview */}
                  <div className="relative flex-1 overflow-hidden max-h-[150px] mb-1">
                    <div
                      dangerouslySetInnerHTML={{ __html: note.content || '<p class="opacity-30 italic">Empty note. Click to write...</p>' }}
                      className={`w-full text-sm leading-relaxed ${style.text} note-rich-content pr-1 break-words`}
                    />
                    {/* Soft gradient fadeout */}
                    <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t pointer-events-none ${
                      note.color === 'yellow' ? 'from-amber-950/60' :
                      note.color === 'blue' ? 'from-sky-950/60' :
                      note.color === 'green' ? 'from-emerald-950/60' :
                      note.color === 'pink' ? 'from-pink-950/60' : 'from-purple-950/60'
                    } to-transparent`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Rich Text Editor Modal Dialog */}
      {editingNoteId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-pop">
          <div className="bg-[#181622] border-4 border-black rounded-3xl p-6 max-w-2xl w-full text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative my-auto cartoon-card">
            
            {/* Modal Title Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg bg-white text-black`}>
                  📝
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Sanctuary Notepad</h3>
                  <p className="text-xs text-white/40">Rich formatting, stickers, and offline drafting</p>
                </div>
              </div>
              <button 
                onClick={handleCancel}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all cartoon-btn border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Restore Draft banner alert */}
            {showRestoreNotice && draftData && (
              <div className="bg-sunshine-400/10 border-2 border-sunshine-400/40 p-3.5 rounded-2xl flex items-center justify-between text-xs text-sunshine-300">
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <span>Unsaved changes found in drafts!</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleRestoreDraft}
                    className="px-3 py-1 bg-sunshine-400 text-black font-extrabold rounded-lg hover:bg-sunshine-500 transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={handleDismissDraft}
                    className="px-2.5 py-1 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Formatting Toolbar */}
            {editor && (
              <div className="bg-black/35 p-2 rounded-2xl border border-white/10 flex flex-wrap gap-1.5 items-center justify-between">
                {/* Standard Actions */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('bold') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('italic') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('underline') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('strike') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Strike"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-6 bg-white/10 mx-1 shrink-0" />

                  {/* Bullet / Numbered lists */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('bulletList') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded-xl transition-all cartoon-btn ${editor.isActive('orderedList') ? 'bg-sunshine-400 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-6 bg-white/10 mx-1 shrink-0" />

                  {/* Headings */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cartoon-btn ${editor.isActive('heading', { level: 1 }) ? 'bg-sunshine-400 text-black' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cartoon-btn ${editor.isActive('heading', { level: 2 }) ? 'bg-sunshine-400 text-black' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    title="Heading 2"
                  >
                    H2
                  </button>
                </div>

                {/* Text Color palette */}
                <div className="flex items-center gap-1.5 p-1 bg-black/35 rounded-xl border border-white/5 shrink-0">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => editor.chain().focus().setColor(color.value).run()}
                      className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    title="Clear Color"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Emoji panel */}
            {editor && (
              <div className="flex gap-1.5 items-center overflow-x-auto bg-black/20 p-2 rounded-2xl border border-white/5 scrollable">
                <span className="text-[10px] text-white/40 font-bold uppercase shrink-0 px-1">Emojis:</span>
                {POPULAR_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => editor.chain().focus().insertContent(emoji).run()}
                    className="text-base p-1 hover:scale-125 transition-transform shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Main Interactive Notepad Container */}
            <div className={`relative p-5 rounded-3xl border-2 transition-all duration-300 ${COLOR_CLASSES[noteColor].editorBg}`}>
              
              {/* Display Sticker overlay in editor top right for real preview */}
              {noteSticker && STICKERS[noteSticker] && (
                <div className="absolute top-4 right-4 p-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] rotate-12 shrink-0 z-15">
                  {React.createElement(STICKERS[noteSticker].icon, {
                    className: `w-6 h-6 ${STICKERS[noteSticker].color} stroke-[2.5]`
                  })}
                </div>
              )}

              {/* Tiptap input */}
              <div className="relative">
                {editor && editor.getText().trim() === '' && (
                  <div className="absolute top-4 left-4 text-white/25 pointer-events-none select-none text-sm font-medium">
                    Type your thoughts here...
                  </div>
                )}
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Sticker selector row */}
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white/60">Decorate with a Sticker Badge</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollable">
                <button
                  type="button"
                  onClick={() => setNoteSticker(undefined)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cartoon-btn shrink-0 ${
                    noteSticker === undefined
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                  }`}
                >
                  No Sticker
                </button>
                {STICKER_KEYS.map(key => {
                  const st = STICKERS[key];
                  const IconComp = st.icon;
                  const isSelected = noteSticker === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNoteSticker(key)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cartoon-btn shrink-0 ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${st.color} stroke-[2.5]`} />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Color selection */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/60">Select Card Theme</span>
                <div className="flex items-center gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteColor(color)}
                      className={`w-7 h-7 rounded-full border transition-transform hover:scale-115 cartoon-btn ${
                        color === 'yellow' ? 'bg-amber-400' :
                        color === 'blue' ? 'bg-sky-400' :
                        color === 'green' ? 'bg-emerald-400' :
                        color === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                      } ${noteColor === color ? 'ring-2 ring-white scale-110 border-black' : 'border-white/20'}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Character Limit and Actions */}
              <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/40">
                  <span>Character Limit:</span>
                  <span className={`font-mono font-bold ${isOverLimit ? 'text-red-400 animate-pulse' : 'text-sunshine-300'}`}>
                    {charCount}/2000
                  </span>
                </div>
                
                <div className="flex gap-3 w-full justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cartoon-btn transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isOverLimit}
                    className="px-5 py-2 bg-sunshine-400 hover:bg-sunshine-500 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl cartoon-btn shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation warning modal for unsaved changes */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-pop">
          <div className="bg-[#1e1b2e] border-2 border-coral-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl cartoon-card">
            <AlertTriangle className="w-12 h-12 text-coral-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-black text-white mb-2">Unsaved changes?</h3>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              You have unsaved edits in this notepad. Would you like to save them before closing?
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleSave}
                disabled={isOverLimit}
                className="w-full py-2.5 bg-sunshine-400 hover:bg-sunshine-500 disabled:opacity-45 text-black font-extrabold text-xs rounded-xl cartoon-btn shadow-lg"
              >
                Save Changes
              </button>
              <button
                onClick={handleDiscard}
                className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 cartoon-btn"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cartoon-btn"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
