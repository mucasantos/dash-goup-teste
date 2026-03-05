import { useState, useCallback, useEffect } from "react";

export interface Driver {
  id: number;
  name: string;
  email: string;
  password: string;
  status: string;
  lastUpdate: string;
  citizenCard: string;
  citizenCardExpiry: string;
  criminalRecord: string;
  criminalRecordExpiry: string;
  imtLicense: string;
  imtLicenseExpiry: string;
  drivingLicense: string;
  drivingLicenseExpiry: string;
  photo?: File;
  address?: string;
  phone?: string;
  shift: "Dia" | "Noite" | "24 horas";
}

export interface Device {
  id: number;
  name: string;
  status: string;
  lastUpdate: string;
}

export interface Vehicle {
  id: number;
  name: string;
  status: string;
  lastUpdate: string;
  licensePlate: string;
  brand: string;
  model: string;
  initialKm: number;
  capacity: "5" | "7" | "9";
}

export interface DiaryEntry {
  id: number;
  date: string;
  driver: string;
  vehicle: string;
  km: number;
}

export interface Refueling {
  id: number;
  date: string;
  vehicle: string;
  liters: number;
  value: number;
}

export interface Revenue {
  id: number;
  month: string;
  year: number;
  value: number;
}

interface AppData {
  drivers: Driver[];
  devices: Device[];
  vehicles: Vehicle[];
  diaryEntries: DiaryEntry[];
  refuelings: Refueling[];
  revenues: Revenue[];
}

export function useAppData() {
  const [data, setData] = useState<AppData>({
    drivers: [],
    devices: [],
    vehicles: [],
    diaryEntries: [],
    refuelings: [],
    revenues: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const filteredData: AppData = {
        drivers: [
          {
            id: 1,
            name: "João Silva",
            email: "joao@example.com",
            password: "********",
            status: "Ativo",
            lastUpdate: "2023-06-15",
            citizenCard: "123456789",
            citizenCardExpiry: "2025-12-31",
            criminalRecord: "CR123456",
            criminalRecordExpiry: "2024-06-30",
            imtLicense: "IMT987654",
            imtLicenseExpiry: "2026-03-15",
            drivingLicense: "DL654321",
            drivingLicenseExpiry: "2027-09-30",
            shift: "Dia",
            address: "Rua A, 123",
            phone: "123456789",
          },
          {
            id: 2,
            name: "Maria Santos",
            email: "maria@example.com",
            password: "********",
            status: "Ativo",
            lastUpdate: "2023-06-14",
            citizenCard: "987654321",
            citizenCardExpiry: "2026-01-31",
            criminalRecord: "CR654321",
            criminalRecordExpiry: "2024-07-31",
            imtLicense: "IMT123456",
            imtLicenseExpiry: "2025-04-30",
            drivingLicense: "DL987654",
            drivingLicenseExpiry: "2028-10-31",
            shift: "Noite",
            address: "Rua B, 456",
            phone: "987654321",
          },
        ],
        devices: [
          {
            id: 1,
            name: "Rastreador GPS 1",
            status: "Ativo",
            lastUpdate: "2023-06-15",
          },
          {
            id: 2,
            name: "Rastreador GPS 2",
            status: "Inativo",
            lastUpdate: "2023-06-13",
          },
        ],
        vehicles: [
          {
            id: 1,
            name: "Toyota Corolla",
            status: "Ativo",
            lastUpdate: "2023-06-15",
            licensePlate: "ABC1234",
            brand: "Toyota",
            model: "Corolla",
            initialKm: 0,
            capacity: "5",
          },
          {
            id: 2,
            name: "Honda Civic",
            status: "Em Manutenção",
            lastUpdate: "2023-06-14",
            licensePlate: "DEF5678",
            brand: "Honda",
            model: "Civic",
            initialKm: 1000,
            capacity: "5",
          },
        ],
        diaryEntries: [
          {
            id: 1,
            date: "2023-06-15",
            driver: "João Silva",
            vehicle: "Toyota Corolla",
            km: 150,
          },
          {
            id: 2,
            date: "2023-06-14",
            driver: "Maria Santos",
            vehicle: "Honda Civic",
            km: 120,
          },
        ],
        refuelings: [
          {
            id: 1,
            date: "2023-06-15",
            vehicle: "Toyota Corolla",
            liters: 40,
            value: 200,
          },
          {
            id: 2,
            date: "2023-06-14",
            vehicle: "Honda Civic",
            liters: 35,
            value: 175,
          },
        ],
        revenues: [
          { id: 1, month: "Junho", year: 2023, value: 15000 },
          { id: 2, month: "Maio", year: 2023, value: 14000 },
        ],
      };

      const filteredDataByDate: AppData = {
        ...filteredData,
        diaryEntries: filteredData.diaryEntries.filter(
          entry => new Date(entry.date) >= startDate && new Date(entry.date) <= endDate
        ),
        refuelings: filteredData.refuelings.filter(
          refuel => new Date(refuel.date) >= startDate && new Date(refuel.date) <= endDate
        ),
        revenues: filteredData.revenues.filter(
          revenue => {
            const revenueDate = new Date(revenue.year, revenue.month === "Junho" ? 5 : 4, 1);
            return revenueDate >= startDate && revenueDate <= endDate;
          }
        ),
      };

      setData(filteredDataByDate);
    } catch (err) {
      console.error(err)
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchData(startOfMonth, endOfMonth);
  }, [fetchData]);

  return {
    ...data,
    isLoading,
    error,
    fetchData,
  };
}

