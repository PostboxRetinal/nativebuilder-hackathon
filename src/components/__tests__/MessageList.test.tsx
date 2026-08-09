import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageList from '../MessageList'
import type { Message } from '../../types/models'

function makeMessage(overrides: Partial<Message>): Message {
  return {
    id: '1',
    role: 'user',
    content: '',
    sources: [],
    order_index: 0,
    created_at: '2026-08-07T00:00:00.000Z',
    ...overrides,
  }
}

describe('MessageList', () => {
  it('renders loading state', () => {
    render(<MessageList messages={[]} loading />)
    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('renders empty state when there are no messages', () => {
    render(<MessageList messages={[]} loading={false} />)
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('renders user and assistant message content', () => {
    const messages: Message[] = [
      makeMessage({ id: '1', role: 'user', content: 'Hello', order_index: 0 }),
      makeMessage({
        id: '2',
        role: 'assistant',
        content: 'Here are the results.',
        order_index: 1,
      }),
    ]
    render(<MessageList messages={messages} loading={false} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Here are the results.')).toBeInTheDocument()
  })

  it('renders a source citation card for each assistant source', () => {
    const messages: Message[] = [
      makeMessage({
        id: '1',
        role: 'assistant',
        content: 'answer',
        sources: [
          { title: 'Alpha', url: 'https://alpha.example' },
          { title: 'Beta', url: 'https://beta.example/docs' },
        ],
      }),
    ]
    render(<MessageList messages={messages} loading={false} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows the researching bubble when researching', () => {
    render(<MessageList messages={[]} loading={false} researching />)
    expect(screen.getByText(/Researching/)).toBeInTheDocument()
  })

  it('does not render sources on a user message', () => {
    const messages: Message[] = [
      makeMessage({ id: '1', role: 'user', content: 'Hello' }),
    ]
    render(<MessageList messages={messages} loading={false} />)
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('drops malformed sources without url', () => {
    const messages: Message[] = [
      makeMessage({
        id: '1',
        role: 'assistant',
        content: 'answer',
        sources: [
          { title: 'NoUrl' },
          { title: 'Good', url: 'https://good.example' },
        ] as Message['sources'],
      }),
    ]
    render(<MessageList messages={messages} loading={false} />)
    expect(screen.queryByText('NoUrl')).not.toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('renders assistant content as markdown', () => {
    const messages: Message[] = [
      makeMessage({ id: '1', role: 'assistant', content: '**bold** and `code`' }),
    ]
    const { container } = render(
      <MessageList messages={messages} loading={false} />,
    )
    expect(container.querySelector('strong')).toHaveTextContent('bold')
    expect(container.querySelector('code')).toHaveTextContent('code')
    // Raw markdown markers must not leak as literal text.
    expect(screen.queryByText('**bold**')).not.toBeInTheDocument()
  })

  it('renders header and link from markdown', () => {
    const messages: Message[] = [
      makeMessage({
        id: '1',
        role: 'assistant',
        content: '# Title\n\n[docs](https://docs.example)',
      }),
    ]
    const { container } = render(
      <MessageList messages={messages} loading={false} />,
    )
    expect(container.querySelector('h1')).toHaveTextContent('Title')
    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', 'https://docs.example')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders user content as plain text, not markdown', () => {
    const messages: Message[] = [
      makeMessage({ id: '1', role: 'user', content: '**bold**' }),
    ]
    render(<MessageList messages={messages} loading={false} />)
    expect(screen.getByText('**bold**')).toBeInTheDocument()
    expect(screen.queryByText('bold')).not.toBeInTheDocument()
  })
})
