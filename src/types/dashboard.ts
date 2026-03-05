export interface License {
  id: number;
  codigo: string;
  post_title: string;
  order_id: number;
  licence_id: string;
  date_created?: string;
  date_completed?: string;
  status?: string;
  name?: string | null;
  motorista_id?: number | null;
  motorista_name?: string | null;

  quantidade: number;
  ativo: boolean;
  id_empresa: number;
  createdAt: string;
  updatedAt: string;
  motorista: {
    id: number;
    name: string;
    id_user: number;
    user: {
      id: number;
      name: string;
    };
  };
}

export interface Driver {
  id: number;
  name: string;
  status: string;
}

export interface Vehicle {
  id: number;
  name: string;
  status: string;
  initialKm: number;
}

export interface DiaryEntry {
  id: number;
  driver: string;
  vehicle: string;
  km: number;
}

export interface Refueling {
  id: number;
  vehicle: string;
  liters: number;
  value: number;
}

export interface Revenue {
  id: number;
  month: string;
  value: number;
}

export interface AppRevenue {
  id: number;
  month: string;
  uber: number;
  bolt: number;
}

export interface EfficiencyData {
  name: string;
  efficiency: number;
  km: number;
}

export interface HoursData {
  name: string;
  hours: number;
}

export interface RevenueByDriver {
  name: string;
  revenue: number;
}
