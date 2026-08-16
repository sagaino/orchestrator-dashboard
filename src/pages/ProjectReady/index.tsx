import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

export function ProjectReadyPage() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{t("app.ready")}</CardTitle>
        </CardHeader>
        <CardContent>{t("app.description")}</CardContent>
      </Card>
    </main>
  )
}

export default ProjectReadyPage
