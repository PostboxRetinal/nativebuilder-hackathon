import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConversationView from '../ConversationView'
import { useMessages } from '../../hooks/useMessages'
import { useConversations } from '../../contexts/ConversationsContext'
import { useResearch } from '../../hooks/useResearch'

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
  useVoiceComposer: vi.fn(() => ({
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
  })),
}))

const useMessagesMock = useMessages as ReturnType<typeof vi.fn>
const useConversationsMock = useConversations as ReturnType<typeof vi.fn>
const useResearchMock = useResearch as ReturnType<typeof vi.fn>

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
  })

  it('renders the chat inside a centered max-w-3xl column', () => {
    renderView()
    const column = screen.getByTestId('chat-column')
    expect(column).toBeInTheDocument()
    expect(column.className).toContain('max-w-3xl')
    expect(column.className).toContain('mx-auto')
  })

  it('renders the header with title', () => {
    renderView()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders the main content area', () => {
    const { container } = renderView()
    const main = container.querySelector('main')
    expect(main).toBeTruthy()
  })
})
