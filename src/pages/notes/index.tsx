import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './notes.css'

type Note = {
  id: string
  title: string
  content?: string
  pinned: boolean
}

type Filter = 'all' | 'pinned' | 'normal'

const KEY = 'notes_v1'

function loadNotes(): Note[] {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes))
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(loadNotes())

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // ➕ Add note
  const handleAdd = () => {
    if (title.trim().length < 2) return

    const newNote: Note = {
      id: uuid(),
      title,
      content,
      pinned: false,
    }

    const newNotes = [newNote, ...notes]
    setNotes(newNotes)
    saveNotes(newNotes)

    setTitle('')
    setContent('')
  }

  // ❌ Delete
  const handleDelete = (id: string) => {
    if (!confirm('Delete note?')) return

    const newNotes = notes.filter((n) => n.id !== id)
    setNotes(newNotes)
    saveNotes(newNotes)
  }

  // 📌 Pin
  const togglePin = (id: string) => {
    const newNotes = notes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    )
    setNotes(newNotes)
    saveNotes(newNotes)
  }

  // 🔍 Filter + search
  const filtered = notes
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((n) => {
      if (filter === 'pinned') return n.pinned
      if (filter === 'normal') return !n.pinned
      return true
    })

  return (
    <div style={{ padding: 20 }}>
      <h1>Notes</h1>

      {/* FORM */}
      <input
        placeholder="Title (min 2 chars)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />

      <br />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br />

      <button onClick={handleAdd}>Add</button>

      <hr />

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTER */}
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('pinned')}>Pinned</button>
        <button onClick={() => setFilter('normal')}>Normal</button>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && <p>No notes found</p>}

      {/* LIST */}
      {filtered.map((n) => (
        <div
          key={n.id}
          style={{
            border: '1px solid #ccc',
            marginTop: 10,
            padding: 10,
          }}
        >
          <h3>
            {n.title} {n.pinned && '📌'}
          </h3>
          <p>{n.content}</p>

          <button onClick={() => togglePin(n.id)}>
            {n.pinned ? 'Unpin' : 'Pin'}
          </button>

          <button onClick={() => handleDelete(n.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}