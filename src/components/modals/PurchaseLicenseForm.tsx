"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PurchaseLicenseFormProps {
  onSubmit: (quantity: number) => void
  onCancel: () => void
}

export function PurchaseLicenseForm({ onSubmit, onCancel }: PurchaseLicenseFormProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(quantity)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">{t("licenses.quantityLabel")}</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">
          {t("licenses.confirmPurchase")}
        </Button>
      </div>
    </form>
  )
}
