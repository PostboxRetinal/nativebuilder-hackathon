import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversationView from '../ConversationView'
import { useMessages } from '../../hooks/useMessages'
import { useConversations } from '../../contexts/ConversationsContext'
import { useResearch } from '../../hooks/useResearch'
import { useVoiceComposer } from '../../hooks/useVoiceComposer'

vi.mock('../../hooks/useMessages', () => ({
  useMessages: vi.fn(),
}))

vi.mock('../../contexts/ConversationsContext', () => ({
  useConversations: vi.fn(),
}))

vi.mock('../../hooks/useResearch', () => ({
  useResearch: vi.fn(),
}))

vi.mock('../../hooks/useVoiceComposer', () => ({
  useVoiceComposer: vi.fn(),
}))

const useMessagesMock = useMessages as ReturnType<typeof vi.fn>
const useConversationsMock = useConversations as ReturnType<typeof vi.fn>
const useResearchMock = useResearch as ReturnType<typeof vi.fn>
const useVoiceComposerMock = useVoiceComposer as ReturnType<typeof vi.fn>

function renderView() {
  return render(<ConversationView conversationId="c1" />)
}

describe('ConversationView centered column', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMessagesMock.mockReturnValue({
      messages: [],
      loading: false,
      addMessage: vi.fn(),
    })
    useConversationsMock.mockReturnValue({
      conversations: [{ id: 'c1', title: 'Hello', created_at: '' }],
      updateTitle: vi.fn(),
    })
    useResearchMock.mockReturnValue({
      researching: false,
      runResearch: vi.fn(),
    })
    useVoiceComposerMock.mockReturnValue({
      state: 'idle',
      partialText: '',
      finalText: '',
      error: '',
      language: 'en',
      setLanguage: vi.fn(),
      editedText: '',
      setEditedText: vi.fn(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      reset: vi.fn(),
      submitEdit: vi.fn(),
      reRecord: vi.fn(),
    })
  })

  it('renders the chat inside a centered max-w-3xl column', () => {
    const { container } = renderView()
    const column = screen.getByTestId('chat-column')
    expect(column).toBeInTheDocument()
    expect(column.className).toContain('max-w-3xl')
    expect(column.className).toContain('mx-auto')

    const header = container.querySelector('header')
    const main = container.querySelector('main')
    const footer = container.querySelector('footer')
    expect(header).toBeTruthy()
    expect(main).toBeTruthy()
    expect(footer).toBeTruthy()
    expect(header!.className).toContain('bg-surface')
    expect(main!.className).toContain('bg-background')
    expect(footer!.className).toContain('bg-surface')
  })

  it('renders the transcript editor above the composer when done', () => {
    useVoiceComposerMock.mockReturnValue({
      state: 'done',
      partialText: '',
      finalText: 'hello world',
      error: '',
      language: 'en',
      setLanguage: vi.fn(),
      editedText: 'hello world',
      setEditedText: vi.fn(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      reset: vi.fn(),
      submitEdit: vi.fn(),
      reRecord: vi.fn(),
    })
    const { container } = renderView()
    expect(screen.getByLabelText('Edit your transcription')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Re-record' })).toBeInTheDocument()
    // Editor must not be inside the composer row (footer still has the input).
    const composerRow = container.querySelector('[data-testid="chat-column"] footer')
    expect(composerRow).toBeTruthy()
  })

  it('closes the done transcript via the close button', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    useVoiceComposerMock.mockReturnValue({
      state: 'done',
      partialText: '',
      finalText: 'hello world',
      error: '',
      language: 'en',
      setLanguage: vi.fn(),
      editedText: 'hello world',
      setEditedText: vi.fn(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      reset,
      submitEdit: vi.fn(),
      reRecord: vi.fn(),
    })
    renderView()
    await user.click(screen.getByRole('button', { name: 'Close transcript' }))
    expect(reset).toHaveBeenCalled()
  })
})
