import { useMutation } from "@tanstack/react-query"
import type { LoginFormData } from "../types/request"
import { setData } from "@/hooks/useLocalStorage"
import { LOCALSTORAGE_KEY } from "@/lib/constant/localstorage"
import { toast } from "@/components/ui/toast"
import { AuthAdapterNotConfiguredError, AuthServices } from "@/services/auth"
import { useTranslation } from "react-i18next"

export const useLogin = () => {
  const { t } = useTranslation()
  const mutation = useMutation({
    mutationFn: async (payload: LoginFormData) => {
      const user = await AuthServices.login(payload)
      if (!user.token) throw new Error(t("auth.tokenMissing"))

      setData(LOCALSTORAGE_KEY.TOKEN, user.token)
      setData(LOCALSTORAGE_KEY.USER, user)

      return user
    },
    onSuccess: (result) => {
      const userName = result.user?.name || result.user?.username || t("auth.defaultUser")
      toast.add({
        type: "success",
        description: t("auth.success", { name: userName }),
      })
    },
    onError: (error) => {
      const message = error instanceof AuthAdapterNotConfiguredError
        ? t("auth.adapterMissing")
        : error instanceof Error
          ? error.message
          : t("auth.failed")
      toast.add({
        type: "error",
        description: message,
      })
    },
  })

  return {
    login: mutation.mutate,
    isLoggingIn: mutation.isPending,
  }
}
