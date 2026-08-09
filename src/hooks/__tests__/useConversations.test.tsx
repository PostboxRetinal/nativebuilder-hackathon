import { describe, expect, it, vi, beforeEach } from 'vitest'
import { type ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  ConversationsProvider,
  useConversations,
} from '../../contexts/ConversationsContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
    from: vi.fn(),
  },
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const fromMock = supabase.from as ReturnType<typeof vi.fn>
const channelMock = supabase.channel as ReturnType<typeof vi.fn>
const useAuthMock = useAuth as ReturnType<typeof vi.fn>

function setupCreateChain(data: unknown) {
  const single = vi.fn().mockResolvedValue({ data, error: null })
  const select = vi.fn().mockReturnValue({ single })
  return { insert: vi.fn().mockReturnValue({ select }), select, single }
}

function setupFetchChain() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const eq = vi.fn().mockReturnValue({ order })
  const select = vi.fn().mockReturnValue({ eq })
  return select
}

describe('useConversations', () => {
  beforeEach(() => {
    fromMock.mockReset()
    channelMock.mockReset()
    useAuthMock.mockReset()
    useAuthMock.mockReturnValue({ user: { id: 'u1' } })
    // channel(...).on(...).subscribe(...) -> returns object with state
    const sub = vi.fn().mockReturnValue({ state: 'joined' })
    channelMock.mockReturnValue({ on: vi.fn().mockReturnValue({ subscribe: sub }), state: 'joined' })
  })

  it('prepends the new conversation to state immediately on create', async () => {
    const createRow = {
      id: 'c1',
      title: 'New conversation',
      created_at: '2026-08-08T00:00:00Z',
    }
    const create = setupCreateChain(createRow)
    const fetchSelect = setupFetchChain()

    // from("conversations") serves both the fetch (select) and create (insert) paths.
    fromMock.mockImplementation(() => ({ select: fetchSelect, insert: create.insert }))

    function wrapper(props: { children: ReactNode }) {
      return <ConversationsProvider>{props.children}</ConversationsProvider>
    }

    const { result } = renderHook(() => useConversations(), { wrapper })

    // Wait for the initial async fetch to settle (sets conversations to [])
    // so the subsequent optimistic prepend is not overwritten by it.
    await waitFor(() => expect(result.current.loading).toBe(false))

    let createdId: string | null = null
    await act(async () => {
      createdId = await result.current.createConversation()
    })

    expect(createdId).toBe('c1')
    expect(create.insert).toHaveBeenCalledWith({
      title: 'New conversation',
      user_id: 'u1',
    })
    // The optimistic entry is present right after create, without realtime.
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0]).toMatchObject({
      id: 'c1',
      title: 'New conversation',
    })
  })
})
