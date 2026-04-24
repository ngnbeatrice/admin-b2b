import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi } from 'vitest'

import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'
import messages from '@/messages/en.json'

vi.mock('@/lib/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

/**
 * Simulates navigating to an unknown URL.
 * In Next.js App Router, any unmatched path hits the [...rest] catch-all route
 * which renders the NotFoundScreen. We test that behaviour here.
 */
describe('Unknown URL → Not Found screen', () => {
  it('shows the not found screen for an unknown URL', () => {
    // Arrange — simulate the catch-all route rendering NotFoundScreen
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <NotFoundScreen />
      </NextIntlClientProvider>
    )

    // Assert — the not found UI is visible
    expect(screen.getByRole('alert')).toHaveTextContent('Page not found')
    expect(screen.getByRole('button', { name: 'Back to home page' })).toBeInTheDocument()
  })
})
