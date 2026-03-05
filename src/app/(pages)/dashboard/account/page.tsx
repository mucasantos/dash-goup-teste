"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, CreditCard, Building, Flag, Check, ChevronsUpDown, MessageCircle } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { RootState } from "@/lib/redux/store"
import { useGetEmpresaDadosQuery, useUpdateEmpresaMutation } from "@/lib/redux/services/empresaApi"
import { setCredentials } from "@/lib/redux/authSlice"
import { handleApiError } from "@/utils/errorHandler"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import { countryCodes } from "@/data/countries"
import { cn } from "@/utils/cn"

interface AccountFormInputs {
  nome_razao_social: string
  email: string
  nif_nipc: string
  contacto: string
  whatsapp: string
  endereco: string
  cidade: string
  pais: string
  password: string
}

export default function AccountPage() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { control, handleSubmit, reset, formState } = useForm<AccountFormInputs>()
  const [updateEmpresa, { isLoading: isUpdating }] = useUpdateEmpresaMutation()
  const [open, setOpen] = useState(false)

  const { data: empresaDados, isLoading: isLoadingEmpresa } = useGetEmpresaDadosQuery()

  console.log("Dados carregados:", { empresaDados, isLoadingEmpresa })

  useEffect(() => {
    console.log("useEffect triggered:", { empresaDados, isLoadingEmpresa, user })
    
    if (empresaDados && empresaDados.empresa) {
      console.log("Preenchendo formulário com dados da empresa:", empresaDados.empresa)
      
      reset({
        nome_razao_social: empresaDados.empresa.nome_razao_social || "",
        email: empresaDados.empresa.email || "",
        nif_nipc: empresaDados.empresa.nif_nipc || "",
        contacto: empresaDados.empresa.contacto || "",
        whatsapp: empresaDados.empresa.whatsapp || "",
        endereco: empresaDados.empresa.endereco || "",
        cidade: empresaDados.empresa.cidade || "",
        pais: empresaDados.empresa.pais || "",
        password: "",
      }, { keepDefaultValues: false })
      
      setIsLoading(false)
    } else if (user && !isLoadingEmpresa) {
      console.log("Preenchendo formulário com dados do usuário:", user)
      
      reset({
        nome_razao_social: user.name || "",
        email: user.email || "",
        nif_nipc: user.empresa?.nif_nipc || "",
        contacto: user.empresa?.contacto || "",
        whatsapp: user.empresa?.whatsapp || "",
        endereco: user.empresa?.endereco || "",
        cidade: user.empresa?.cidade || "",
        pais: user.empresa?.pais || "",
        password: "",
      }, { keepDefaultValues: false })
      
      setIsLoading(false)
    }
  }, [empresaDados, user, reset, isLoadingEmpresa])

  console.log("Valores atuais do formulário:", formState.defaultValues)

  const onSubmit = async (data: AccountFormInputs) => {
    try {
      const response = await updateEmpresa(data).unwrap()
      const { empresa, usuario } = response

      const updatedUser = {
        id: usuario.id,
        name: usuario.name,
        photo: usuario.photo,
        email: usuario.email,
        role: usuario.role,
        id_empresa: usuario.id_empresa,
        first_time: usuario.first_time,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
        empresa: {
          nif_nipc: empresa.nif_nipc,
          endereco: empresa.endereco,
          cidade: empresa.cidade,
          pais: empresa.pais,
          contacto: empresa.contacto,
          whatsapp: empresa.whatsapp,
          status: empresa.status,
          createdAt: empresa.createdAt,
          updatedAt: empresa.updatedAt,
        },
      }

      dispatch(
        setCredentials({
          user: updatedUser,
          token: Cookies.get("token") || "",
          token_goup: Cookies.get("token_goup") || "",
          goup_nicename: Cookies.get("goup_nicename") || "",
          goup_display_name: Cookies.get("goup_display_name") || "",
        }),
      )

      toast.success(t("account.updateSuccess"))
      setIsEditing(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {isLoading || isLoadingEmpresa ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photo || undefined} alt={empresaDados?.empresa?.nome_razao_social || user?.name} />
                  <AvatarFallback>{empresaDados?.empresa?.nome_razao_social?.charAt(0) || user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                {isLoading || isLoadingEmpresa ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-bold">
                      {empresaDados?.empresa?.nome_razao_social || user?.name}
                    </CardTitle>
                    <CardDescription>
                      {empresaDados?.empresa?.email || user?.email}
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
            {!(isLoading || isLoadingEmpresa) && !isEditing && (
              <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                {t("account.editInfo")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 mb-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome_razao_social" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{t("account.nameOrCompany")}</span>
                    </Label>
                    <Controller
                      name="nome_razao_social"
                      control={control}
                      rules={{ required: t("account.nameRequired") }}
                      render={({ field }) => <Input {...field} disabled={!isEditing} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{t("account.email")}</span>
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ required: t("account.emailRequired") }}
                      render={({ field }) => <Input {...field} type="email" disabled={!isEditing} />}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nif_nipc" className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{t("account.nifNipc")}</span>
                    </Label>
                    <Controller
                      name="nif_nipc"
                      control={control}
                      render={({ field }) => <Input {...field} disabled={!isEditing} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contacto" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{t("account.phone")}</span>
                    </Label>
                    <Controller
                      name="contacto"
                      control={control}
                      render={({ field }) => <Input {...field} disabled={!isEditing} />}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{t("account.whatsapp")}</span>
                  </Label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    render={({ field }) => <Input {...field} disabled={!isEditing} />}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t("account.address")}</span>
                  </Label>
                  <Controller
                    name="endereco"
                    control={control}
                    render={({ field }) => <Input {...field} disabled={!isEditing} />}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{t("account.city")}</span>
                    </Label>
                    <Controller
                      name="cidade"
                      control={control}
                      render={({ field }) => <Input {...field} disabled={!isEditing} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais" className="flex items-center space-x-2">
                      <Flag className="h-4 w-4" />
                      <span>{t("account.country")}</span>
                    </Label>
                    <Controller
                      name="pais"
                      control={control}
                      render={({ field }) => (
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                              disabled={!isEditing}
                            >
                              {field.value ? t(`countries.${field.value}`) : t("sidebar.selectCountry")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder={t("sidebar.searchCountry")} />
                              <CommandList>
                                <CommandEmpty>{t("account.noCountryFound")}</CommandEmpty>
                                <CommandGroup>
                                  {countryCodes.map((code) => (
                                    <CommandItem
                                      key={code}
                                      onSelect={() => {
                                        field.onChange(code)
                                        setOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          code === field.value ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {t(`countries.${code}`)}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{t("account.passwordHint")}</span>
                    </Label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => <Input {...field} type="password" />}
                    />
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    {t("account.cancel")}
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? t("account.saving") : t("account.saveChanges")}
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
