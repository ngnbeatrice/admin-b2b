import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import messages from '@/messages/en.json'

import { LoginScreen } from './LoginScreen'

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({ signIn: (...args: unknown[]) => mockSignIn(...args) }))

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

// Capture window.location.replace calls
const mockLocationReplace = vi.fn()
Object.defineProperty(window, 'location', {
  value: { ...window.location, replace: mockLocationReplace },
  writable: true,
})

// Logo uses next/image — stub it out
vi.mock('@/components/Logo/Logo', () => ({ default: () => <span data-testid="logo" /> }))

// LocaleSwitcher uses next-intl navigation — stub it out
vi.mock('@/components/LocaleSwitcher/LocaleSwitcher', () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher" />,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderLoginScreen() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LoginScreen />
    </NextIntlClientProvider>
  )
}

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginScreen — rendering', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockLocationReplace.mockClear()
  })

  it('renders the login form', () => {
    renderLoginScreen()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders the title and description', () => {
    renderLoginScreen()
    expect(screen.getByText('Login to your account')).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access the dashboard')).toBeInTheDocument()
  })

  it('does not show an error message initially', () => {
    renderLoginScreen()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('LoginScreen — service unavailable (infrastructure error)', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockLocationReplace.mockClear()
    mockSignIn.mockResolvedValue({ error: 'Configuration', ok: false })
  })

  it('fires a toast when NextAuth returns a Configuration error', async () => {
    const { toast } = await import('sonner')
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'password')
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Could not load user data. Try again later.')
    })
  })

  it('does not show the inline credentials error on a Configuration error', async () => {
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'password')
    await waitFor(() => expect(mockSignIn).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not navigate on a Configuration error', async () => {
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'password')
    await waitFor(() => expect(mockSignIn).toHaveBeenCalled())
    expect(mockLocationReplace).not.toHaveBeenCalled()
  })
})

describe('LoginScreen — bad credentials', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockLocationReplace.mockClear()
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false })
  })

  it('shows an error message when credentials are invalid', async () => {
    renderLoginScreen()
    await fillAndSubmit('wrong@example.com', 'badpassword')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
    })
  })

  it('does not navigate on failed login', async () => {
    renderLoginScreen()
    await fillAndSubmit('wrong@example.com', 'badpassword')
    await waitFor(() => screen.getByRole('alert'))
    expect(mockLocationReplace).not.toHaveBeenCalled()
  })

  it('re-enables the submit button after a failed attempt', async () => {
    renderLoginScreen()
    await fillAndSubmit('wrong@example.com', 'badpassword')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).not.toBeDisabled()
    })
  })
})

describe('LoginScreen — successful login', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockLocationReplace.mockClear()
    mockSignIn.mockResolvedValue({ error: null, ok: true })
  })

  it('calls signIn with credentials provider', async () => {
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'correctpassword')
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@example.com',
        password: 'correctpassword',
        redirect: false,
      })
    })
  })

  it('navigates to home after successful login', async () => {
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'correctpassword')
    await waitFor(() => {
      expect(mockLocationReplace).toHaveBeenCalledWith('/')
    })
  })

  it('does not show an error message on success', async () => {
    renderLoginScreen()
    await fillAndSubmit('admin@example.com', 'correctpassword')
    await waitFor(() => expect(mockLocationReplace).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('LoginScreen — loading state', () => {
  it('disables the submit button while submitting', async () => {
    // Never resolves during this test — keeps the pending state
    mockSignIn.mockReturnValue(new Promise(() => {}))
    renderLoginScreen()

    await userEvent.type(screen.getByLabelText('Email'), 'admin@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')

    const button = screen.getByRole('button', { name: 'Login' })
    await userEvent.click(button)

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled()
  })
})
