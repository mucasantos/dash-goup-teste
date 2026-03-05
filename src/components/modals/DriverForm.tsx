'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  useGetMotoristaByIdQuery,
  useAddMotoristaMutation,
  useUpdateMotoristaMutation,
  useGetAvailableLicensesQuery,
  useGetViaturasQuery,
  useAttributeLicenseMutation,
  useGetClientsQuery
} from '@/lib/redux/services/empresaApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/utils/errorHandler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Driver } from '@/types/driver';
import { RequiredFieldIndicator } from '@/components/RequiredFieldIndicator';
import MaskedInput from '@/components/MaskedInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Checkbox } from '@/components/ui/checkbox';

const LICENSE_PURCHASE_URL = '/dashboard/licenses';

interface DriverFormProps {
  id?: number | null;
  onSave: () => void;
}

type DriverFormData = Driver & {
  categoria_profissional: string;
  data_inicio_prestacao: string;
  viaturas: number[];
};

export function DriverForm({ id, onSave }: DriverFormProps) {
  const { t } = useTranslation();
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const userCompanyId = useSelector((state: any) => state.auth.user?.id_empresa);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== 'superadmin'
  });

  const clients = clientsResponse?.clientes?.filter((client) => client.status) || [];

  const { data: driverData, isLoading: isLoadingDriver } = useGetMotoristaByIdQuery(id ?? 0, {
    skip: !id,
    refetchOnMountOrArgChange: true
  });
  const [addMotorista, { isLoading: isAdding }] = useAddMotoristaMutation();
  const [updateMotorista, { isLoading: isUpdating }] = useUpdateMotoristaMutation();
  const { data: availableLicensesData, isLoading: isLoadingLicenses } =
    useGetAvailableLicensesQuery(
      selectedCompanyId ? { id_empresa: parseInt(selectedCompanyId) } : { id_empresa: 0 },
      {
        skip: !selectedCompanyId && userRole === 'superadmin'
      }
    );
  const [attributeLicense] = useAttributeLicenseMutation();

  const { data: viaturas, isLoading: isLoadingViaturas } = useGetViaturasQuery(
    { id_empresa: selectedCompanyId ? parseInt(selectedCompanyId) : undefined },
    {
      skip: !selectedCompanyId && userRole === 'superadmin'
    }
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch, setValue } = useForm<DriverFormData>({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      birthDate: '',
      address: '',
      email: '',
      nationality: '',
      cartaoCidadao: '',
      validadeCartaoCidadao: '',
      registroCriminal: '',
      validadeRegistroCriminal: '',
      licencaIMT: '',
      validadeLicencaIMT: '',
      cartaConducao: '',
      validadeCartaConducao: '',
      bankName: '',
      ibanNumber: '',
      mbwayNumber: '',
      workShift: 'Dia',
      status: 'Ativo',
      appUser: '',
      appPassword: '',
      arquivoCartaoCidadao: null,
      arquivoRegistroCriminal: null,
      arquivoLicencaIMT: null,
      arquivoCartaConducao: null,
      orderId: '',
      idLicenca: '',
      viaturas: [],
      id_empresa: userRole === 'superadmin'
        ? (selectedCompanyId ? parseInt(selectedCompanyId) : undefined)
        : undefined,
      categoria_profissional: '',
      data_inicio_prestacao: ''
    }
  });

  const watchWorkShift = watch('workShift');
  console.log('watchWorkShift:', watchWorkShift);

  useEffect(() => {
    if (id) {
      console.log('Buscando motorista com ID:', id);
    }
  }, [id]);

  useEffect(() => {
    if (driverData && driverData.motorista) {
      const driver = driverData.motorista;
      console.log('Dados do motorista recebidos:', driver);

      // Guarda o workShift antes do reset
      const workShiftValue = driver.workShift || 'Dia';

      const formData = {
        ...driver,
        fullName: driver.user?.name || '',
        email: driver.user?.email || '',
        birthDate: driver.birthDate ? new Date(driver.birthDate).toISOString().split('T')[0] : '',
        validadeCartaoCidadao: driver.validadeCartaoCidadao
          ? new Date(driver.validadeCartaoCidadao).toISOString().split('T')[0]
          : '',
        validadeRegistroCriminal: driver.validadeRegistroCriminal
          ? new Date(driver.validadeRegistroCriminal).toISOString().split('T')[0]
          : '',
        validadeLicencaIMT: driver.validadeLicencaIMT
          ? new Date(driver.validadeLicencaIMT).toISOString().split('T')[0]
          : '',
        validadeCartaConducao: driver.validadeCartaConducao
          ? new Date(driver.validadeCartaConducao).toISOString().split('T')[0]
          : '',
        arquivoCartaoCidadao: driver.arquivoCartaoCidadao,
        arquivoRegistroCriminal: driver.arquivoRegistroCriminal,
        arquivoLicencaIMT: driver.arquivoLicencaIMT,
        arquivoCartaConducao: driver.arquivoCartaConducao,
        orderId: driver.idLicenca || '',
        viaturas: driver.viaturas ? driver.viaturas.map(v => v.id) : [],
        appUser: driver.appUser || '',
        appPassword: driver.appPassword || '',
        id_empresa: driver.id_empresa || 0,
        categoria_profissional: driver.categoria_profissional || '',
        data_inicio_prestacao: driver.data_inicio_prestacao
          ? new Date(driver.data_inicio_prestacao).toISOString().split('T')[0]
          : '',
        workShift: workShiftValue,
        status: driver.status || 'Ativo'
      };

      reset(formData);

      // Define o workShift depois do reset também para garantir
      setTimeout(() => {
        setValue('workShift', workShiftValue);
      }, 0);

      setPhotoPreview(driver.user?.photo || null);
      if (driver.id_empresa) {
        setSelectedCompanyId(driver.id_empresa.toString());
      }
    }
  }, [driverData, reset, setValue]);

  const onSubmit = async (data: DriverFormData) => {
    // Remove idViatura se existir e garante que viaturas seja um array
    if ('idViatura' in data) {
      delete data.idViatura;
    }
    if (!data.viaturas) {
      data.viaturas = [];
    }

    // Separar arquivos dos dados normais
    const files: { [key: string]: File } = {};
    const jsonData: any = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (
          key === 'foto' ||
          key === 'arquivoCartaoCidadao' ||
          key === 'arquivoRegistroCriminal' ||
          key === 'arquivoLicencaIMT' ||
          key === 'arquivoCartaConducao'
        ) {
          if (key === 'foto' && value instanceof FileList && value.length > 0) {
            files[key] = value[0];
          } else if (value instanceof File) {
            files[key] = value;
          } else if (typeof value === 'string' && value.startsWith('http')) {
            // URL existente, não incluir nos arquivos
          } else if (value instanceof FileList && value.length > 0) {
            files[key] = value[0];
          }
        } else {
          // Dados normais - apenas incluir se não for string vazia
          if (key === 'workShift') {
            jsonData[key] = value.toLowerCase();
          } else if (key === 'status') {
            jsonData[key] = value.toLowerCase();
          } else if (key === 'viaturas') {
            jsonData[key] = Array.isArray(value) ? value : [];
          } else {
            // Campos obrigatórios sempre incluir, mesmo se vazios
            const requiredFields = [
              'fullName', 'phoneNumber', 'birthDate', 'address', 'email',
              'nationality', 'appUser', 'appPassword', 'orderId', 'idLicenca',
              'categoria_profissional', 'data_inicio_prestacao'
            ];

            if (requiredFields.includes(key) || (value !== '' && value !== null && value !== undefined)) {
              jsonData[key] = value;
            }
          }
        }
      }
    });

    // Definir id_empresa corretamente
    if (userRole === 'superadmin' && selectedCompanyId) {
      jsonData.id_empresa = parseInt(selectedCompanyId);
    } else {
      // Para usuários não-superadmin, remover id_empresa 
      // O backend define automaticamente baseado no token
      delete jsonData.id_empresa;
    }

    // Se há arquivos, usar FormData, senão usar JSON
    let requestBody: FormData | string;
    let contentType: string | undefined;

    if (Object.keys(files).length > 0) {
      // Tem arquivos - usar FormData
      const formData = new FormData();

      // Adicionar dados JSON como string
      formData.append('data', JSON.stringify(jsonData));

      // Adicionar arquivos
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      requestBody = formData;
      contentType = undefined; // Deixar o browser definir o boundary
    } else {
      // Sem arquivos - usar JSON puro
      requestBody = JSON.stringify(jsonData);
      contentType = 'application/json';
    }

    console.log('🚀 Payload sendo enviado:', JSON.stringify(jsonData, null, 2));

    try {
      let motoristaResult;
      if (id) {
        motoristaResult = await updateMotorista({
          id,
          data: requestBody,
          contentType
        }).unwrap();
        toast.success(t('drivers.updateSuccess'));
      } else {
        motoristaResult = await addMotorista({
          data: requestBody,
          contentType
        }).unwrap();
        toast.success(t('drivers.addSuccess'));
      }

      onSave();
    } catch (error) {
      handleApiError(error);
    }
  };

  const watchPhoto = watch('foto');

  useEffect(() => {
    if (watchPhoto) {
      const file = watchPhoto[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchPhoto]);

  if (isLoadingDriver) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      {userRole === 'superadmin' && (
        <div className='space-y-2' key='company-selection'>
          <Label htmlFor='id_empresa'>
            {t('drivers.company')}
            <RequiredFieldIndicator />
          </Label>
          <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder={t('drivers.selectCompany')} />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={`client-${client.id}`} value={String(client.id)}>
                  {client.nome_razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='space-y-2' key='profile-photo'>
        <Label htmlFor='foto'>{t('drivers.profilePhoto')}</Label>
        <div className='flex items-center space-x-4'>
          <Avatar className='w-24 h-24'>
            <AvatarImage src={photoPreview || ''} alt={t('drivers.profilePhotoAlt')} />
            <AvatarFallback>{driverData?.motorista?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Controller
            key='foto'
            name='foto'
            control={control}
            render={({ field: { onChange, ref } }) => (
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    onChange(files);
                  } else {
                    onChange(null);
                  }
                }}
                ref={ref}
              />
            )}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='name-email-section'>
        <div className='space-y-2'>
          <Label htmlFor='fullName'>
            {t('drivers.fullName')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='fullName'
            name='fullName'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>
            {t('drivers.email')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='email'
            name='email'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} type='email' />}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='phone-birth-section'>
        <div className='space-y-2'>
          <Label htmlFor='phoneNumber'>
            {t('drivers.phoneNumber')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='phoneNumber'
            name='phoneNumber'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} type='tel' />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='birthDate'>
            {t('drivers.birthDate')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='birthDate'
            name='birthDate'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div key='app-credentials-section'>
        <div className='space-y-2'>
          <Label htmlFor='appUser'>
            {t('drivers.appUser')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='appUser'
            name='appUser'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='appPassword'>
            {t('drivers.appPassword')}
            {!id && <RequiredFieldIndicator />}
          </Label>
          <Controller
            key='appPassword'
            name='appPassword'
            control={control}
            rules={{ required: !id && t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} type='password' />}
          />
        </div>
      </div>

      <div className='space-y-2' key='address-section'>
        <Label htmlFor='address'>
          {t('drivers.address')}
          <RequiredFieldIndicator />
        </Label>
        <Controller
          key='address'
          name='address'
          control={control}
          rules={{ required: t('drivers.fieldRequired') }}
          render={({ field }) => <Input {...field} />}
        />
      </div>

      <div className='space-y-2' key='nationality-section'>
        <Label htmlFor='nationality'>
          {t('drivers.nationality')}
          <RequiredFieldIndicator />
        </Label>
        <Controller
          key='nationality'
          name='nationality'
          control={control}
          rules={{ required: t('drivers.fieldRequired') }}
          render={({ field }) => <Input {...field} />}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='citizen-card-section'>
        <div className='space-y-2'>
          <Label htmlFor='cartaoCidadao'>{t('drivers.citizenCard')}</Label>
          <Controller
            key='cartaoCidadao'
            name='cartaoCidadao'
            control={control}
            render={({ field }) => (
              <Input {...field} maxLength={30} placeholder='Digite o número do documento' />
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='validadeCartaoCidadao'>{t('drivers.citizenCardValidity')}</Label>
          <Controller
            key='validadeCartaoCidadao'
            name='validadeCartaoCidadao'
            control={control}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='criminal-record-section'>
        <div className='space-y-2'>
          <Label htmlFor='registroCriminal'>{t('drivers.criminalRecord')}</Label>
          <Controller
            key='registroCriminal'
            name='registroCriminal'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='validadeRegistroCriminal'>{t('drivers.criminalRecordValidity')}</Label>
          <Controller
            key='validadeRegistroCriminal'
            name='validadeRegistroCriminal'
            control={control}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='imt-license-section'>
        <div className='space-y-2'>
          <Label htmlFor='licencaIMT'>{t('drivers.imtLicense')}</Label>
          <Controller
            key='licencaIMT'
            name='licencaIMT'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='validadeLicencaIMT'>{t('drivers.imtLicenseValidity')}</Label>
          <Controller
            key='validadeLicencaIMT'
            name='validadeLicencaIMT'
            control={control}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='driving-license-section'>
        <div className='space-y-2'>
          <Label htmlFor='cartaConducao'>{t('drivers.drivingLicense')}</Label>
          <Controller
            key='cartaConducao'
            name='cartaConducao'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='validadeCartaConducao'>{t('drivers.drivingLicenseValidity')}</Label>
          <Controller
            key='validadeCartaConducao'
            name='validadeCartaConducao'
            control={control}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div className='space-y-2' key='bank-name-section'>
        <Label htmlFor='bankName'>{t('drivers.bankName')}</Label>
        <Controller
          key='bankName'
          name='bankName'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </div>

      <div className='space-y-2' key='iban-section'>
        <Label htmlFor='ibanNumber'>{t('drivers.ibanNumber')}</Label>
        <Controller
          key='ibanNumber'
          name='ibanNumber'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </div>

      <div className='space-y-2' key='mbway-section'>
        <Label htmlFor='mbwayNumber'>{t('drivers.mbwayNumber')}</Label>
        <Controller
          key='mbwayNumber'
          name='mbwayNumber'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='category-startdate-section'>
        <div className='space-y-2'>
          <Label htmlFor='categoria_profissional'>
            {t('drivers.categoryTitle')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='categoria_profissional'
            name='categoria_profissional'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => (
              <Input {...field} placeholder={t('drivers.categoryPlaceholder')} />
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='data_inicio_prestacao'>
            {t('drivers.startServiceDate')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='data_inicio_prestacao'
            name='data_inicio_prestacao'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => <Input {...field} type='date' max='9999-12-31' />}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key='workshift-status-section'>
        <div className='space-y-2'>
          <Label htmlFor='workShift'>
            {t('drivers.workShift')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='workShift'
            name='workShift'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || 'Dia'}
                defaultValue="Dia"
              >
                <SelectTrigger>
                  <SelectValue>
                    {field.value === 'Dia' && t('drivers.day')}
                    {field.value === 'Noite' && t('drivers.night')}
                    {field.value === '24 horas' && t('drivers.fullDay')}
                    {!field.value && t('drivers.day')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Dia'>{t('drivers.day')}</SelectItem>
                  <SelectItem value='Noite'>{t('drivers.night')}</SelectItem>
                  <SelectItem value='24 horas'>{t('drivers.fullDay')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='status'>
            {t('drivers.status')}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            key='status'
            name='status'
            control={control}
            rules={{ required: t('drivers.fieldRequired') }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={t('drivers.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Ativo'>{t('drivers.active')}</SelectItem>
                  <SelectItem value='Inativo'>{t('drivers.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {!id && (
        <div className='space-y-2' key='license-section'>
          <Label htmlFor='orderId'>
            {t('drivers.license')}
            <RequiredFieldIndicator />
          </Label>
          {isLoadingLicenses ? (
            <Skeleton className='h-10 w-full' />
          ) : !selectedCompanyId && userRole === 'superadmin' ? (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>{t('drivers.attention')}</AlertTitle>
              <AlertDescription>{t('drivers.selectCompanyFirst')}</AlertDescription>
            </Alert>
          ) : availableLicensesData?.licencas && availableLicensesData.licencas.length === 0 ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>{t('drivers.attention')}</AlertTitle>
              <AlertDescription>
                {t('drivers.noLicensesAvailable')}{' '}
                <a href={LICENSE_PURCHASE_URL} className='font-medium underline underline-offset-4'>
                  {t('drivers.buyLicense')}
                </a>
                .
              </AlertDescription>
            </Alert>
          ) : (
            <Controller
              key='orderId'
              name='orderId'
              control={control}
              rules={{ required: t('drivers.fieldRequired') }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const selectedLicense = availableLicensesData?.licencas?.find(
                      (license) => String(license.licence_id) === value
                    );
                    if (selectedLicense) {
                      setValue('idLicenca', selectedLicense.licence_id);
                    }
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('drivers.selectLicense')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLicensesData?.licencas?.map((license) => (
                      <SelectItem
                        key={`license-${license.licence_id}`}
                        value={String(license.licence_id)}
                      >
                        {license.licence_id} - {license.post_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </div>
      )}

      <div className='space-y-2' key='vehicle-section'>
        <Label htmlFor='viaturas'>
          {t('drivers.vehicles')}
        </Label>
        {isLoadingViaturas ? (
          <Skeleton className='h-10 w-full' />
        ) : !selectedCompanyId && userRole === 'superadmin' ? (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>{t('drivers.attention')}</AlertTitle>
            <AlertDescription>{t('drivers.selectCompanyFirst')}</AlertDescription>
          </Alert>
        ) : viaturas && viaturas.viaturas.length === 0 ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>{t('drivers.attention')}</AlertTitle>
            <AlertDescription>{t('drivers.noVehiclesAvailable')}</AlertDescription>
          </Alert>
        ) : (
          <Controller
            key='viaturas'
            name='viaturas'
            control={control}
            render={({ field }) => (
              <div className='space-y-3 max-h-48 overflow-y-auto border rounded-md p-3'>
                {viaturas?.viaturas.map((viatura) => (
                  <div key={`vehicle-${viatura.id}`} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`vehicle-${viatura.id}`}
                      checked={field.value?.includes(viatura.id) || false}
                      onCheckedChange={(checked) => {
                        const currentViaturas = field.value || [];
                        if (checked) {
                          field.onChange([...currentViaturas, viatura.id]);
                        } else {
                          field.onChange(currentViaturas.filter(id => id !== viatura.id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`vehicle-${viatura.id}`}
                      className='text-sm font-normal cursor-pointer'
                    >
                      {viatura.placa} - {viatura.modelo}
                    </Label>
                  </div>
                ))}
                {(!viaturas?.viaturas || viaturas.viaturas.length === 0) && (
                  <p className='text-sm text-muted-foreground'>
                    {t('drivers.noVehiclesAvailable')}
                  </p>
                )}
              </div>
            )}
          />
        )}
      </div>

      <div className='flex justify-end space-x-2' key='submit-button'>
        <Button type='submit' disabled={isAdding || isUpdating}>
          {isAdding || isUpdating ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
