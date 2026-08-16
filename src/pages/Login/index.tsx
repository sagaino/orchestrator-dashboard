import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError } from '@/components/ui/field'
import { useTranslation } from 'react-i18next'
import { createLoginSchema, type LoginFormData } from './types/request'
import { useLogin } from './hooks/useLogin'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, isLoggingIn } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <div className="h-screen flex items-center bg-login">
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col p-6 bg-primary-foreground rounded-[24px] w-110">
          <div className="gap-1.5 py-6">
            <h1 className="text-foreground text-2xl font-semibold">{t('auth.login')}</h1>
            <p className="text-muted-foreground text-sm">{t('auth.welcomeBack')}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <Field>
                <Input
                  placeholder={t('auth.emailPlaceholder')}
                  className="border-[#334155] bg-background h-10"
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError errors={[{ message: errors.email.message }]} />
                )}
              </Field>
              <Field>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  className="border-[#334155] bg-background h-10"
                  {...register('password')}
                />
                {errors.password && (
                  <FieldError errors={[{ message: errors.password.message }]} />
                )}
              </Field>
              <Button
                className="mt-2 h-10 w-full cursor-pointer rounded-[12px] text-sm font-medium text-white hover:brightness-95"
                type="submit"
                variant="default"
                disabled={isSubmitting || isLoggingIn}
              >
                {t('auth.login')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
