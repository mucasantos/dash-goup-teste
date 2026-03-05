export interface Driver {
  motorista: {
    id?: number;
    id_user?: number;
    motorista: {
      id: number;
      id_user: number;
      name: string;
      user: {
        id: number;
        name: string;
      };
    };
    id_empresa?: number;
    fullName: string;
    phoneNumber: string;
    birthDate: string;
    address: string;
    email: string;
    nationality: string;
    foto: any;
    cartaoCidadao: string;
    idLicenca: string;
    idViatura: string;
    validadeCartaoCidadao: string;
    arquivoCartaoCidadao: string | File | null;
    arquivoRegistroCriminal: string | File | null;
    arquivoLicencaIMT: string | File | null;
    arquivoCartaConducao: string | File | null;
    registroCriminal: string;
    validadeRegistroCriminal: string;
    licencaIMT: string;
    validadeLicencaIMT: string;
    cartaConducao: string;
    validadeCartaConducao: string;
    bankName: string;
    ibanNumber: string;
    mbwayNumber: string;
    workShift: "Dia" | "Noite" | "24 horas";
    status: "Ativo" | "Inativo";
    appPassword?: string;
    appUser: string;
    user: {
      createdAt: string;
      updatedAt: string;
      first_time: boolean;
      id: number;
      photo: string;
      name: string;
      email: string;
      role: string;
      id_empresa: number;
      password: string;
    };
    categoria_profissional: string;
    data_inicio_prestacao: string;
  };
  hasAppLicence?: boolean;
  id?: number;
  id_user?: number;
  id_empresa?: number;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  address: string;
  email: string;
  nationality: string;
  ultimaViatura: any
  foto: any;
  cartaoCidadao: string;
  idLicenca: string;
  idViatura: string;
  validadeCartaoCidadao: string;
  arquivoCartaoCidadao: string | File | null;
  arquivoRegistroCriminal: string | File | null;
  arquivoLicencaIMT: string | File | null;
  arquivoCartaConducao: string | File | null;
  registroCriminal: string;
  validadeRegistroCriminal: string;
  licencaIMT: string;
  validadeLicencaIMT: string;
  cartaConducao: string;
  validadeCartaConducao: string;
  bankName: string;
  ibanNumber: string;
  mbwayNumber: string;
  workShift: "Dia" | "Noite" | "24 horas";
  status: "Ativo" | "Inativo";
  appPassword?: string;
  appUser: string;
  user: {
    createdAt: string;
    updatedAt: string;
    first_time: boolean;
    id: number;
    photo: string;
    name: string;
    email: string;
    role: string;
    id_empresa: number;
    password: string;
  };
}

export interface User {
  id: number;
  id_empresa: number;
  name: string;
  email: string;
  role: string;
  first_time: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverWithUser extends User {
  motorista: Driver;
  foto: string;
}

export interface DriversResponse {
  usuarios: DriverWithUser[];
  currentPage: number;
  totalPages: number;
}

export interface SingleDriverResponse {
  message: string;
  user: User;
  motorista: Driver;
}
