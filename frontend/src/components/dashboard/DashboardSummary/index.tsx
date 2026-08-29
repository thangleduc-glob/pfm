/**
 * DashboardSummary Component
 * Main dashboard component that combines balance and monthly summary
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DashboardData, DashboardSummaryProps } from "../../../types/dashboard";
import DashboardService from "../../../services/dashboardService";
import BalanceCard from "../BalanceCard";
import MonthlySummary from "../MonthlySummary";
import "./DashboardSummary.css";

/**
 * DashboardSummary component displays complete financial summary
 * @param data - Dashboard data (if pre-loaded)
 * @param loading - Whether the data is loading
 * @param error - Error message if any
 * @param onRefresh - Optional callback to refresh data
 */
const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  data: initialData = null,
  loading: initialLoading = false,
  error: initialError = null,
  onRefresh,
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  const inFlightRequestRef = useRef<Promise<void> | null>(null);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    if (inFlightRequestRef.current) {
      return inFlightRequestRef.current;
    }

    const request = (async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await DashboardService.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    })();

    inFlightRequestRef.current = request;
    request.finally(() => {
      inFlightRequestRef.current = null;
    });

    return request;
  }, []);

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchDashboardData();
    onRefresh?.();
  };

  /**
   * Load data on mount if not provided
   */
  useEffect(() => {
    if (!initialData) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, initialData]);

  return (
    <div className="dashboard-summary">
      <div className="dashboard-summary__header">
        <h1 className="dashboard-summary__title">Financial Dashboard</h1>
        <button
          className="dashboard-summary__refresh"
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Refresh dashboard data"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="dashboard-summary__content">
        <div className="dashboard-summary__balance-section">
          <BalanceCard
            balance={data?.currentBalance || 0}
            loading={loading}
            error={error}
          />
        </div>

        <div className="dashboard-summary__monthly-section">
          <MonthlySummary
            income={data?.currentMonthIncome || 0}
            expenses={data?.currentMonthExpenses || 0}
            remaining={data?.remainingAmount || 0}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
