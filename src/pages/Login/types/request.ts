import type { TFunction } from "i18next"
import { z } from "zod"

export const createLoginSchema = (t: TFunction) => z.object({
  email: z.string().email(t("validation.email")),
  password: z.string().min(6, t("validation.password")),
})

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>
