'use client'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher'
import Logo from '@/components/Logo/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { APP_NAME } from '@/constants/app'
import { Routes } from '@/constants/routes'

export function LoginScreen() {
  const t = useTranslations('Login')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsPending(false)

    if (result?.error === 'Configuration') {
      toast.error(t('serviceUnavailable'))
      return
    }

    if (result?.error) {
      setError(t('invalidCredentials'))
      return
    }

    // Hard navigate so the server session is picked up by AuthGuard
    window.location.replace(Routes.home)
  }

  return (
    <div
      id="screen-login"
      className="bg-background relative flex min-h-screen w-full items-center justify-center p-6 md:p-10"
    >
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size={48} />
          <span className="text-foreground text-xl font-bold">{APP_NAME}</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">{t('emailLabel')}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t('passwordLabel')}</FieldLabel>
                  <Input id="password" name="password" type="password" required />
                </Field>
                {error && (
                  <p role="alert" className="text-error text-sm">
                    {error}
                  </p>
                )}
                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
