/**
 * TransactionFilter Component
 * Filter controls for transaction list
 */

import React, { useState, useEffect } from "react";
import { TransactionFilters } from "../../../types/transaction";
import { Category } from "../../../types/category";
import TransactionService from "../../../services/transactionService";
import "./TransactionFilter.css";

interface TransactionFilterProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  isLoading?: boolean;
}

/**
 * TransactionFilter component for filtering transactions
 * @param filters - Current filter values
 * @param onFiltersChange - Callback when filters change
 * @param isLoading - Whether component is in loading state
 */
const TransactionFilter: React.FC<TransactionFilterProps> = ({
  filters,
  onFiltersChange,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await TransactionService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (field: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    onFiltersChange(newFilters);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return (
      filters.type !== "all" ||
      filters.categoryId ||
      filters.startDate ||
      filters.endDate ||
      filters.search
    );
  };

  return (
    <div className="transaction-filter" data-testid="transaction-filter">
      <div className="transaction-filter__basic">
        <div className="transaction-filter__field">
          <label htmlFor="search" className="transaction-filter__label">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search transactions..."
            value={filters.search || ""}
            onChange={(e) =>
              handleFilterChange("search", e.target.value || undefined)
            }
            className="transaction-filter__input"
            data-testid="search-input"
            disabled={isLoading}
          />
        </div>

        <div className="transaction-filter__field">
          <label htmlFor="type" className="transaction-filter__label">
            Type
          </label>
          <select
            id="type"
            value={filters.type || "all"}
            onChange={(e) => handleFilterChange("type", e.target.value as any)}
            className="transaction-filter__select"
            data-testid="type-filter"
            disabled={isLoading}
          >
            <option value="all">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div className="transaction-filter__field">
          <label htmlFor="categoryId" className="transaction-filter__label">
            Category
          </label>
          <select
            id="categoryId"
            value={filters.categoryId || ""}
            onChange={(e) =>
              handleFilterChange("categoryId", e.target.value || undefined)
            }
            className="transaction-filter__select"
            data-testid="category-filter"
            disabled={isLoading || loading}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type})
              </option>
            ))}
          </select>
        </div>

        <div className="transaction-filter__actions">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="transaction-filter__button transaction-filter__button--secondary"
            data-testid="advanced-toggle"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
          </button>

          {hasActiveFilters() && (
            <button
              type="button"
              onClick={clearFilters}
              className="transaction-filter__button transaction-filter__button--clear"
              data-testid="clear-filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="transaction-filter__advanced">
          <div className="transaction-filter__field">
            <label htmlFor="startDate" className="transaction-filter__label">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value || undefined)
              }
              className="transaction-filter__input"
              data-testid="start-date"
              disabled={isLoading}
            />
          </div>

          <div className="transaction-filter__field">
            <label htmlFor="endDate" className="transaction-filter__label">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value || undefined)
              }
              className="transaction-filter__input"
              data-testid="end-date"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {hasActiveFilters() && (
        <div className="transaction-filter__active">
          <span className="transaction-filter__active-label">
            Active filters:
          </span>
          <div className="transaction-filter__active-tags">
            {filters.type !== "all" && (
              <span
                className="transaction-filter__tag"
                data-testid="active-type"
              >
                Type: {filters.type}
                <button
                  onClick={() => handleFilterChange("type", "all")}
                  className="transaction-filter__tag-remove"
                  aria-label="Remove type filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.categoryId && (
              <span
                className="transaction-filter__tag"
                data-testid="active-category"
              >
                Category:{" "}
                {categories.find((c) => c.id === filters.categoryId)?.name ||
                  "Unknown"}
                <button
                  onClick={() => handleFilterChange("categoryId", undefined)}
                  className="transaction-filter__tag-remove"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.startDate && (
              <span
                className="transaction-filter__tag"
                data-testid="active-start-date"
              >
                From: {filters.startDate}
                <button
                  onClick={() => handleFilterChange("startDate", undefined)}
                  className="transaction-filter__tag-remove"
                  aria-label="Remove start date filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.endDate && (
              <span
                className="transaction-filter__tag"
                data-testid="active-end-date"
              >
                To: {filters.endDate}
                <button
                  onClick={() => handleFilterChange("endDate", undefined)}
                  className="transaction-filter__tag-remove"
                  aria-label="Remove end date filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span
                className="transaction-filter__tag"
                data-testid="active-search"
              >
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange("search", undefined)}
                  className="transaction-filter__tag-remove"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;
