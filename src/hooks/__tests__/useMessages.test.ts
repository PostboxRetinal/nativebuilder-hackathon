import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMessages } from '../useMessages'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}))

const fromMock = supabase.from as ReturnType<typeof vi.fn>

// Realtime channel facade so the mount effect does not crash.
beforeEach(() => {
  const channelMock = {
    on: vi.fn(() => channelMock),
    subscribe: vi.fn(() => ({ state: 'joined' })),
  }
  ;(supabase.channel as ReturnType<typeof vi.fn>).mockReturnValue(channelMock)
})

// Simulates a naive append-only store keyed by order_index. .maybeSingle
// returns the current max order_index, and the insert records the row.
function makeDb() {
  const rows: { id: number; order_index: number; role: string }[] = []
  return {
    rows,
    builder: () => {
      // Chained query object for: select().eq().order().limit().maybeSingle()
      // and insert().select().single()
      const chain: Record<string, ReturnType<typeof vi.fn>> = {}
      const q = {
        select: vi.fn(() => q),
        eq: vi.fn(() => q),
        order: vi.fn(() => q),
        limit: vi.fn(() => q),
        maybeSingle: vi.fn(async () => {
          const max = rows.reduce((m, r) => (r.order_index > m ? r.order_index : m), 0)
          return { data: max > 0 ? { order_index: max } : null, error: null }
        }),
        insert: vi.fn((row: { order_index: number; role: string }) => {
          const inserted = { id: rows.length + 1, ...row, content: '' }
          rows.push(inserted)
          // .insert().select().single()
          const inner = {
            select: vi.fn(() => inner),
            single: vi.fn(async () => ({ data: inserted, error: null })),
          }
          return inner
        }),
      }
      void chain
      return q
    },
  }
}

describe('useMessages order_index serialization', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('assigns strictly increasing order_index under concurrent adds', async () => {
    const db = makeDb()
    // Both the read (maybeSingle) and the insert (insert) hit supabase.from('messages')
    fromMock.mockImplementation(() => db.builder())

    const { result: hook } = renderHook(() => useMessages('conv-1'))

    // Fire two concurrent adds without awaiting between them.
    let first: Promise<void>
    let second: Promise<void>
    act(() => {
      first = hook.current.addMessage('user', 'hello')
      second = hook.current.addMessage('assistant', 'hi there')
    })

    await act(async () => {
      await Promise.all([first, second])
    })

    expect(db.rows.map((r) => r.order_index)).toEqual([1, 2])
  })

  it('does not insert when last-message read fails', async () => {
    const db = makeDb()
    fromMock.mockImplementation(() => {
      const q = db.builder()
      // Force maybeSingle to return an error
      ;(q as any).maybeSingle = vi.fn(async () => ({ data: null, error: { message: 'read fail' } }))
      return q
    })

    const { result: hook } = renderHook(() => useMessages('conv-1'))

    await act(async () => {
      await hook.current.addMessage('user', 'hello')
    })

    expect(db.rows).toHaveLength(0)
  })

  it('does not append to state when insert fails', async () => {
    const db = makeDb()
    fromMock.mockImplementation(() => {
      const q = db.builder()
      // Force insert to return an error
      ;(q as any).insert = vi.fn(() => {
        const inner = {
          select: vi.fn(() => inner),
          single: vi.fn(async () => ({ data: null, error: { message: 'insert fail' } })),
        }
        return inner
      })
      return q
    })

    const { result: hook } = renderHook(() => useMessages('conv-1'))

    await act(async () => {
      await hook.current.addMessage('user', 'hello')
    })

    expect(db.rows).toHaveLength(0)
    expect(hook.current.messages).toHaveLength(0)
  })
})
