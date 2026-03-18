import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  Layout,
  Input,
  Button,
  Card,
  Space,
  Tag,
  Modal,
  Empty,
  Row,
  Col,
} from 'antd'
import 'antd/dist/reset.css'
import './notes.css'

const { Header, Content, Footer } = Layout
const { TextArea } = Input

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

  const handleDelete = (id: string) => {
    const newNotes = notes.filter((n) => n.id !== id)
    setNotes(newNotes)
    saveNotes(newNotes)
  }

  const togglePin = (id: string) => {
    const newNotes = notes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    )
    setNotes(newNotes)
    saveNotes(newNotes)
  }

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
    <Layout className="layout">
      {/* HEADER */}
      <Header className="header">
        <div className="logo">📝 Notes App</div>
      </Header>

      {/* CONTENT */}
      <Content className="content">
        <div className="container">
          {/* FORM */}
          <Card className="formCard">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextArea
                placeholder="Content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoSize={{ minRows: 2 }}
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
          <div className="toolbar">
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
          </div>

          {/* LIST */}
          {filtered.length === 0 ? (
            <Empty />
          ) : (
            <Row gutter={[16, 16]}>
              {filtered.map((n) => (
                <Col xs={24} md={12} lg={8} key={n.id}>
                  <Card
                    title={
                      <>
                        {n.title}
                        {n.pinned && (
                          <Tag color="gold" style={{ marginLeft: 8 }}>
                            📌
                          </Tag>
                        )}
                      </>
                    }
                    extra={
                      <Space>
                        <Button size="small" onClick={() => togglePin(n.id)}>
                          {n.pinned ? 'Unpin' : 'Pin'}
                        </Button>

                        <Button
                          size="small"
                          danger
                          onClick={() =>
                            Modal.confirm({
                              title: 'Delete?',
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
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>

      {/* FOOTER */}
      <Footer className="footer">
        Notes App ©2026 Created with Ant Design
      </Footer>
    </Layout>
  )
}