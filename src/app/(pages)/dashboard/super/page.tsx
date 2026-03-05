"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/pageLayout";
import { StatCard } from "@/components/stat-card";
import { useGetSuperAdminOverviewQuery } from "@/lib/redux/services/empresaApi";
import {
  Building2,
  Users,
  Car,
  Smartphone,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface SuperAdminOverviewData {
  report: Company[];
  rankingFaturamento: {
    id_user: number;
    horasOnline: number;
    faturamento: number;
    rank: number;
  }[];
  viaturasHoras: Record<string, number>;
  mediaHorasOnline: number;
}

interface Journey {
  dt_horario_final: string | null;
  status: string;
}

interface Company {
  id: number;
  motoristas: any[];
  viaturas: any[];
  dispositivos: any[];
  usuarios: {
    id: number;
    name: string;
    role: string;
  }[];
  controleUbers: {
    dt_horario_final: string | null;
  }[];
}

export default function SuperAdminDashboardPage() {
  const { t } = useTranslation();
  const {
    data: overviewData,
    isLoading,
    error,
  } = useGetSuperAdminOverviewQuery() as {
    data: SuperAdminOverviewData | undefined;
    isLoading: boolean;
    error: any;
  };

  if (error) return <div>{t("common.error")}</div>;
  if (!overviewData && !isLoading) return <div>{t("common.noData")}</div>;

  const totalCompanies = overviewData?.report ? overviewData.report.length : 0;
  const totalDrivers = overviewData?.report
    ? overviewData.report.reduce(
        (sum: number, company: Company) => sum + company.motoristas.length,
        0
      )
    : 0;
  const totalVehicles = overviewData?.report
    ? overviewData.report.reduce(
        (sum: number, company: Company) => sum + company.viaturas.length,
        0
      )
    : 0;
  const totalDevices = overviewData?.report
    ? overviewData.report.reduce(
        (sum: number, company: Company) => sum + company.dispositivos.length,
        0
      )
    : 0;
  const totalJourneys = overviewData?.report
    ? overviewData.report.reduce(
        (sum: number, company: Company) => sum + company.controleUbers.length,
        0
      )
    : 0;

  const companySizes = overviewData?.report
    ? overviewData.report.map((company: Company) => {
        const empresaUser = company.usuarios.find((user) => user.role === "empresa");
        return {
          name: empresaUser?.name || `Empresa ${company.id}`,
          drivers: company.motoristas.length,
          vehicles: company.viaturas.length,
        };
      })
    : [];

  const journeyStatus = overviewData?.report
    ? overviewData.report
        .flatMap((company: Company) =>
          company.controleUbers.map((journey) => ({
            status: journey.dt_horario_final ? "Completed" : "In Progress",
          }))
        )
        .reduce((acc: Record<string, number>, journey) => {
          acc[journey.status] = (acc[journey.status] || 0) + 1;
          return acc;
        }, {})
    : {};

  const journeyStatusData = Object.entries(journeyStatus).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <PageLayout title={t("superAdmin.dashboard.title")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={t("superAdmin.dashboard.totalCompanies")}
          value={totalCompanies.toString()}
          icon={Building2}
          loading={isLoading}
        />
        <StatCard
          title={t("superAdmin.dashboard.totalDrivers")}
          value={totalDrivers.toString()}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title={t("superAdmin.dashboard.totalVehicles")}
          value={totalVehicles.toString()}
          icon={Car}
          loading={isLoading}
        />
        <StatCard
          title={t("superAdmin.dashboard.totalDevices")}
          value={totalDevices.toString()}
          icon={Smartphone}
          loading={isLoading}
        />
        <StatCard
          title={t("superAdmin.dashboard.totalJourneys")}
          value={totalJourneys.toString()}
          icon={FileSpreadsheet}
          loading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("superAdmin.dashboard.companySizes")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companySizes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="drivers"
                    fill="#8884d8"
                    name={t("superAdmin.dashboard.drivers")}
                  />
                  <Bar
                    dataKey="vehicles"
                    fill="#82ca9d"
                    name={t("superAdmin.dashboard.vehicles")}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("superAdmin.dashboard.journeyStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={journeyStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {journeyStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
