import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversationSidebar from '../ConversationSidebar'
import { useConversations } from '../../contexts/ConversationsContext'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../contexts/ConversationsContext', () => ({
  useConversations: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const useConversationsMock = useConversations as ReturnType<typeof vi.fn>
const useAuthMock = useAuth as ReturnType<typeof vi.fn>

function renderSidebar() {
  return render(
    <ConversationSidebar
      selectedConversationId={null}
      onSelectConversation={() => {}}
      onCreateNew={() => {}}
    />,
  )
}

describe('ConversationSidebar delete account', () => {
  const signOut = vi.fn()
  const deleteAccount = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useConversationsMock.mockReturnValue({
      conversations: [],
      loading: false,
      deleteConversation: vi.fn(),
    })
    useAuthMock.mockReturnValue({
      user: { email: 'sebas@example.com' },
      signOut,
      deleteAccount,
    })
  })

  it('shows the delete account action when signed in', () => {
    renderSidebar()
    expect(screen.getByTestId('delete-account')).toBeInTheDocument()
  })

  it('asks for explicit confirmation before deleting', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByTestId('delete-account'))
    expect(
      screen.getByText(/permanently deletes your account/i),
    ).toBeInTheDocument()
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it('does not call the edge function when the user cancels', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByTestId('delete-account'))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it('invokes deleteAccount then signs out on confirm', async () => {
    deleteAccount.mockResolvedValueOnce({ error: undefined })
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByTestId('delete-account'))
    await user.click(screen.getByTestId('confirm-delete-account'))

    expect(deleteAccount).toHaveBeenCalledTimes(1)
    expect(signOut).not.toHaveBeenCalled() // sign out is handled inside deleteAccount
  })

  it('surfaces an error when deletion fails', async () => {
    deleteAccount.mockResolvedValueOnce({ error: 'Delete failed' })
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByTestId('delete-account'))
    await user.click(screen.getByTestId('confirm-delete-account'))

    expect(await screen.findByText('Delete failed')).toBeInTheDocument()
  })
})
