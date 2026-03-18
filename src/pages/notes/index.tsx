import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Input, Button, Card, Space, Tag, Modal, Empty } from 'antd'
import 'antd/dist/reset.css'
import './notes.css'

const { TextArea } = Input

type Note = {
  id: string
  title: string
  content?: string
  pinned: boolean
}

type Filter = 'all' | 'pinned' | 'normal'

const KEY = 'notes_v1'

// load từ localStorage
function loadNotes(): Note[] {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

// save
function saveNotes(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes))
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(loadNotes())

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // ➕ Add
  const handleAdd = () => {
    if (title.trim().length < 2) return

    const newNote: Note = {
      id: uuid(),
      title: title.trim(),
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

  // 🔍 Filter + Search
  const filtered = notes
    .filter((n) =>
      `${n.title} ${n.content ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((n) => {
      if (filter === 'pinned') return n.pinned
      if (filter === 'normal') return !n.pinned
      return true
    })
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))

  return (
    <div className="notesPage">
      <h1 className="notesTitle">📝 Notes</h1>

      {/* FORM */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Title (min 2 chars)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPressEnter={handleAdd}
          />

          <TextArea
            placeholder="Content (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoSize
          />

          <Button
            type="primary"
            onClick={handleAdd}
            disabled={title.trim().length < 2}
          >
            Add Note
          </Button>
        </Space>
      </Card>

      {/* TOOLBAR */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />

        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>

          <Button
            type={filter === 'pinned' ? 'primary' : 'default'}
            onClick={() => setFilter('pinned')}
          >
            Pinned
          </Button>

          <Button
            type={filter === 'normal' ? 'primary' : 'default'}
            onClick={() => setFilter('normal')}
          >
            Normal
          </Button>
        </Space>
      </Space>

      {/* EMPTY */}
      {filtered.length === 0 ? (
        <Empty description="No notes found" />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {filtered.map((n) => (
            <Card
              key={n.id}
              title={
                <>
                  {n.title}{' '}
                  {n.pinned && <Tag color="gold">Pinned</Tag>}
                </>
              }
              extra={
                <Space>
                  <Button onClick={() => togglePin(n.id)}>
                    {n.pinned ? 'Unpin' : 'Pin'}
                  </Button>

                  <Button
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: 'Delete note?',
                        content: 'This action cannot be undone',
                        onOk: () => handleDelete(n.id),
                      })
                    }
                  >
                    Delete
                  </Button>
                </Space>
              }
            >
              {n.content}
            </Card>
          ))}
        </Space>
      )}
    </div>
  )
  
}