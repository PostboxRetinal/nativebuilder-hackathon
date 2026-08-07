import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResearch } from '../useResearch'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>

describe('useResearch', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('returns the research result on success', async () => {
    const result = {
      answer: 'The pipeline is robust.',
      sources: [{ title: 'Docs', url: 'https://example.com/docs' }],
      iterations: 3,
    }
    invokeMock.mockResolvedValueOnce({ data: result, error: null })

    const { result: hook } = renderHook(() => useResearch())

    let data: typeof result | null = null
    await act(async () => {
      data = await hook.current.runResearch('how does it work')
    })

    expect(data).toEqual(result)
    expect(invokeMock).toHaveBeenCalledWith('research', {
      body: { query: 'how does it work', context: undefined },
    })
    expect(hook.current.researching).toBe(false)
    expect(hook.current.error).toBeNull()
  })

  it('sets an error and returns null when the edge function errors', async () => {
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'boom' },
    })

    const { result: hook } = renderHook(() => useResearch())

    let data: unknown = 'unset'
    await act(async () => {
      data = await hook.current.runResearch('query')
    })

    expect(data).toBeNull()
    expect(hook.current.error).toBe('Research failed: boom')
    expect(hook.current.researching).toBe(false)
  })

  it('sets an error and returns null when invoke throws', async () => {
    invokeMock.mockRejectedValueOnce(new Error('network down'))

    const { result: hook } = renderHook(() => useResearch())

    let data: unknown = 'unset'
    await act(async () => {
      data = await hook.current.runResearch('query')
    })

    expect(data).toBeNull()
    expect(hook.current.error).toBe('network down')
    expect(hook.current.researching).toBe(false)
  })

  it('toggles researching true while a call is in flight', async () => {
    let resolveInvoke: (value: unknown) => void
    invokeMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveInvoke = resolve
      }),
    )

    const { result: hook } = renderHook(() => useResearch())

    let promise: Promise<unknown>
    act(() => {
      promise = hook.current.runResearch('query')
    })

    expect(hook.current.researching).toBe(true)

    await act(async () => {
      resolveInvoke({ data: null, error: null })
      await promise
    })

    expect(hook.current.researching).toBe(false)
  })
})
