"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/pageLayout";
import { StatCard } from "@/components/stat-card";
import { useDashboardDataQuery } from "@/lib/redux/services/empresaApi";
import { BadgeCheck, User, Car, Clock, Droplet, DollarSign, RefreshCw } from 'lucide-react';
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
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const defaultDashboardData = {
  licenses: { data: [], totalLicenses: 0, activeLicenses: 0 },
  drivers: { data: [], totalDrivers: 0, onlineDrivers: 0 },
  vehicles: { data: [], totalVehicles: 0, activeVehicles: 0 },
  journeyEntries: { data: [], totalJourneys: 0 },
  refuelings: {
    data: [],
    totalRefuelings: 0,
    totalFuelLiters: 0,
    totalFuelCost: 0,
  },
  revenues: { data: [], totalRevenue: 0, totalTips: 0, totalTrips: 0 },
  hasDamage: false,
};

export default function DashboardPage() {
  const { t } = useTranslation();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 31),
    to: new Date(),
  });

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardDataQuery(
    {
      startDate: dateRange?.from
        ? dateRange.from.toISOString().split("T")[0]
        : "",
      endDate: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : "",
    },
    {
      skip: !dateRange?.from || !dateRange?.to,
    }
  );

  const data = dashboardData || defaultDashboardData;

  const { licenses, drivers, vehicles, refuelings, revenues, hasDamage } = data;

  const nextLicenseToExpire = Array.isArray(licenses.data)
    ? licenses.data
        .filter((l) => l.status === "wc-completed")
        .sort((a, b) => a.days_remaining - b.days_remaining)[0]
    : null;

  const isLicenseExpiringCritically = nextLicenseToExpire && nextLicenseToExpire.days_remaining <= 7;

  const driverHours = drivers.data
    .map((driver) => ({
      name: driver.name,
      hours: driver.totalHoursOnline,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  const vehicleHours = vehicles.data
    .map((vehicle) => ({
      name: vehicle.licensePlate,
      hours: vehicle.totalHoursOnline,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  const revenueByPlatform = revenues.data.reduce((acc, revenue) => {
    acc[revenue.platform] = (acc[revenue.platform] || 0) + revenue.revenue;
    return acc;
  }, {} as Record<string, number>);

  const revenueByPlatformData = Object.entries(revenueByPlatform).map(
    ([name, value]) => ({ name, value })
  );

  const revenueByDriver = drivers.data
    .map((driver) => ({
      name: driver.name,
      revenue: driver.totalRevenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const totalDaysInRange = dateRange?.from && dateRange?.to
    ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;
  
  const averageDailyTrips = revenues.totalTrips / totalDaysInRange;
  
  const totalHoursOnline = drivers.data.reduce(
    (sum, driver) => sum + driver.totalHoursOnline,
    0
  );
  const averageDailyHoursOnline = (totalHoursOnline / drivers.totalDrivers / totalDaysInRange) || 0;

  const hasGoldLicense = Array.isArray(licenses.data) && licenses.data.some(
    license => license.type_license === "gold"
  );

  return (
    <PageLayout title={t("dashboard.title")}>
      <div className="mb-4 flex justify-between items-center">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          disabledDays={{ after: new Date() }}
        />
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("dashboard.refresh")}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.licenses")}
          value={`${licenses.activeLicenses}/${licenses.totalLicenses}`}
          description={t("dashboard.nextExpiry", {
            date: nextLicenseToExpire
              ? `${nextLicenseToExpire.days_remaining} ${t("dashboard.daysRemaining")}`
              : t("dashboard.na"),
          })}
          descriptionClassName={isLicenseExpiringCritically ? "text-red-500 font-semibold" : ""}
          icon={BadgeCheck}
          loading={isLoading}
        />
        <StatCard
          title={t("dashboard.drivers")}
          value={drivers.totalDrivers.toString()}
          description={t("dashboard.driversStatus", {
            online: drivers.onlineDrivers,
            offline: drivers.totalDrivers - drivers.onlineDrivers,
          })}
          icon={User}
          loading={isLoading}
        />
        <StatCard
          title={t("dashboard.vehicles")}
          value={vehicles.totalVehicles.toString()}
          description={t("dashboard.activeVehicles", {
            count: vehicles.activeVehicles,
          })}
          icon={Car}
          damageIndicator={hasDamage}
          loading={isLoading}
        />
        <StatCard
          title={t("dashboard.totalRevenue")}
          value={t("dashboard.currency", {
            value: revenues.totalRevenue.toFixed(2),
          })}
          description={t("dashboard.dailyAverage", {
            value: revenues.mediaRevenue?.toFixed(2) || "0.00",
          })}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.totalRefueled")}
          value={t("dashboard.liters", {
            value: refuelings.totalFuelLiters.toFixed(2),
          })}
          description={t("dashboard.totalCost", {
            value: refuelings.totalFuelCost.toFixed(2),
          })}
          icon={Droplet}
          loading={isLoading}
          goldIndicator={hasGoldLicense}
        />
        <StatCard
          title={t("dashboard.totalTrips")}
          value={revenues.totalTrips.toString()}
          description={t("dashboard.averageTripsPerDriver", {
            value: (revenues.totalTrips / drivers.totalDrivers / totalDaysInRange || 0).toFixed(2),
          })}
          icon={Car}
          loading={isLoading}
        />
        <StatCard
          title={t("dashboard.averageOnlineHours")}
          value={t("dashboard.hours", {
            value: (
              drivers.data.reduce(
                (sum, driver) => sum + driver.totalHoursOnline,
                0
              ) / drivers.totalDrivers / totalDaysInRange || 0
            ).toFixed(2),
          })}
          description={t("dashboard.averageAllDrivers")}
          icon={Clock}
          loading={isLoading}
        />
        <StatCard
          title={t("dashboard.totalTips")}
          value={t("dashboard.currency", {
            value: revenues.totalTips.toFixed(2),
          })}
          description={t("dashboard.averageTipPerTrip", {
            value: (revenues.totalTips / revenues.totalTrips || 0).toFixed(2),
          })}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.onlineHoursDrivers")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.onlineHoursVehicles")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.revenueByPlatform")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByPlatformData}
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
                    {revenueByPlatformData.map((entry, index) => (
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
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.revenueRankingDrivers")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDriver}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
