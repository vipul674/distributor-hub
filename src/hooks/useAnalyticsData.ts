import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const STALE = 60_000; // 1 minute

export const useDashboardStats = () =>
  useQuery({ queryKey: ["dashboard", "stats"], queryFn: api.getDashboardStats, staleTime: STALE });

export const useMonthlySales = () =>
  useQuery({ queryKey: ["sales", "monthly"], queryFn: api.getMonthlySales, staleTime: STALE });

export const useYearlySales = () =>
  useQuery({ queryKey: ["sales", "yearly"], queryFn: api.getYearlySales, staleTime: STALE });

export const useWeeklySales = () =>
  useQuery({ queryKey: ["sales", "weekly"], queryFn: api.getWeeklySales, staleTime: STALE });

export const useSalesByCategory = () =>
  useQuery({ queryKey: ["sales", "by-category"], queryFn: api.getSalesByCategory, staleTime: STALE });

export const useStockAlerts = () =>
  useQuery({ queryKey: ["stock", "alerts"], queryFn: api.getStockAlerts, staleTime: STALE });

export const useDamagedProducts = () =>
  useQuery({ queryKey: ["stock", "damaged"], queryFn: api.getDamagedProducts, staleTime: STALE });

export const useBusinessInsights = () =>
  useQuery({ queryKey: ["insights", "business"], queryFn: api.getBusinessInsights, staleTime: STALE });

export const useInsightsRecommendations = () =>
  useQuery({ queryKey: ["insights", "recommendations"], queryFn: api.getInsightsRecommendations, staleTime: STALE });
