import { create } from 'zustand'

export type Note = {
  id: string
  title: string
  content?: string
  pinned: boolean
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'notes_v1'

function safeParseNotes(raw: string | null): Note[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean) as Note[]
  } catch {
    return []
  }
}

function loadInitialNotes(): Note[] {
  if (typeof window === 'undefined') return []
  return safeParseNotes(window.localStorage.getItem(STORAGE_KEY))
}

function persistNotes(notes: Note[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export type NotesState = {
  notes: Note[]
  addNote: (payload: { id: string; title: string; content?: string }) => void
  updateNote: (id: string, payload: { title: string; content?: string }) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  replaceAll: (notes: Note[]) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: loadInitialNotes(),

  replaceAll: (notes) => {
    persistNotes(notes)
    set({ notes })
  },

  addNote: ({ id, title, content }) => {
    const trimmed = title.trim()
    if (trimmed.length < 2) return

    const now = Date.now()
    const note: Note = {
      id,
      title: trimmed,
      content: content?.trim() ? content.trim() : undefined,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }

    const next = [note, ...get().notes]
    persistNotes(next)
    set({ notes: next })
  },

  updateNote: (id, { title, content }) => {
    const trimmed = title.trim()
    if (trimmed.length < 2) return

    const now = Date.now()
    const next = get().notes.map((n) =>
      n.id === id
        ? {
            ...n,
            title: trimmed,
            content: content?.trim() ? content.trim() : undefined,
            updatedAt: now,
          }
        : n,
    )
    persistNotes(next)
    set({ notes: next })
  },

  deleteNote: (id) => {
    const next = get().notes.filter((n) => n.id !== id)
    persistNotes(next)
    set({ notes: next })
  },

  togglePin: (id) => {
    const now = Date.now()
    const next = get().notes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned, updatedAt: now } : n,
    )
    persistNotes(next)
    set({ notes: next })
  },
}))

