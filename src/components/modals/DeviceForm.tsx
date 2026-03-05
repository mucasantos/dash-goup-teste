import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface DeviceFormProps {
  device: {
    id: number
    identificacao: string
    status: boolean
  }
  onSubmit: (updatedDevice: Partial<DeviceFormProps['device']>) => void
  onCancel: () => void
}

export function DeviceForm({ device, onSubmit, onCancel }: DeviceFormProps) {
  const [identificacao, setIdentificacao] = useState(device.identificacao)
  const [status, setstatus] = useState(device.status)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ identificacao, status })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identificacao">Identificação</Label>
        <Input
          id="identificacao"
          value={identificacao}
          onChange={(e) => setIdentificacao(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="status"
          checked={status}
          onCheckedChange={setstatus}
        />
        <Label htmlFor="status">Ativo</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
