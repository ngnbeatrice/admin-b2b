import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'
import messages from '@/messages/en.json'

const mockReplace = vi.fn()

vi.mock('@/lib/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

function renderNotFoundScreen() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NotFoundScreen />
    </NextIntlClientProvider>
  )
}

describe('NotFoundScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('renders the not found message', () => {
    renderNotFoundScreen()
    expect(screen.getByRole('alert')).toHaveTextContent('Page not found')
  })

  it('renders the back to home button', () => {
    renderNotFoundScreen()
    expect(screen.getByRole('button', { name: 'Back to home page' })).toBeInTheDocument()
  })

  it('navigates to home when the button is clicked', async () => {
    renderNotFoundScreen()
    await userEvent.click(screen.getByRole('button', { name: 'Back to home page' }))
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
