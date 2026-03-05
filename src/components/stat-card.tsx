'use client'

import { AlertTriangle, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { useTranslation } from "react-i18next"

interface StatCardProps {
  title: string
  value: string
  description?: string
  descriptionClassName?: string
  icon: LucideIcon
  loading?: boolean
  damageIndicator?: boolean
  goldIndicator?: boolean
}

export function StatCard({
  title,
  value,
  description,
  descriptionClassName = "",
  icon: Icon,
  loading = false,
  damageIndicator = false,
  goldIndicator = false,
}: StatCardProps) {
  const { t } = useTranslation()


  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</CardTitle>
        <div className="flex items-center">
          {damageIndicator && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-6 w-20 mb-2" />
            {description && <Skeleton className="h-4 w-32" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className={`text-xs text-muted-foreground ${descriptionClassName}`}>{description}</p>}
            {damageIndicator && <p className="text-xs text-red-500 mt-1">{t("dashboard.damageReported")}</p>}
            {goldIndicator && <p className="text-xs font-semibold text-yellow-500 mt-1">{t("licenses.gold")}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

