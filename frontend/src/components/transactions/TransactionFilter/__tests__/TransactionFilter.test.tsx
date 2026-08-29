/**
 * Unit tests for TransactionFilter component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionFilter from "../index";
import { TransactionFilters } from "../../../../types/transaction";
import TransactionService from "../../../../services/transactionService";

// Mock the transaction service
jest.mock("../../../../services/transactionService");
const mockTransactionService = TransactionService as jest.Mocked<
  typeof TransactionService
>;

describe("TransactionFilter", () => {
  const mockCategories = [
    {
      id: "1",
      name: "Food",
      type: "EXPENSE",
      userId: "user1",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      name: "Salary",
      type: "INCOME",
      userId: "user1",
      createdAt: "",
      updatedAt: "",
    },
  ];

  const mockFilters: TransactionFilters = {
    type: "all",
  };

  beforeEach(() => {
    mockTransactionService.getCategories.mockResolvedValue(
      mockCategories as any,
    );
  });

  it("renders filter controls correctly", async () => {
    render(
      <TransactionFilter filters={mockFilters} onFiltersChange={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByTestId("type-filter")).toBeInTheDocument();
      expect(screen.getByTestId("category-filter")).toBeInTheDocument();
    });
  });

  it("loads categories on mount", async () => {
    render(
      <TransactionFilter filters={mockFilters} onFiltersChange={jest.fn()} />,
    );

    await waitFor(() => {
      expect(mockTransactionService.getCategories).toHaveBeenCalled();
    });
  });

  it("calls onFiltersChange when search input changes", async () => {
    const onFiltersChange = jest.fn();
    render(
      <TransactionFilter
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByTestId("search-input"), "test search");
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: "test search",
    });
  });

  it("calls onFiltersChange when type filter changes", async () => {
    const onFiltersChange = jest.fn();
    render(
      <TransactionFilter
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("type-filter")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("type-filter"), "INCOME");
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      type: "INCOME",
    });
  });

  it("calls onFiltersChange when category filter changes", async () => {
    const onFiltersChange = jest.fn();
    render(
      <TransactionFilter
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("category-filter")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("category-filter"), "1");
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      categoryId: "1",
    });
  });

  it("shows advanced filters when toggle is clicked", async () => {
    render(
      <TransactionFilter filters={mockFilters} onFiltersChange={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("advanced-toggle")).toBeInTheDocument();
    });

    // Initially advanced filters should not be visible
    expect(screen.queryByTestId("start-date")).not.toBeInTheDocument();

    // Click toggle
    fireEvent.click(screen.getByTestId("advanced-toggle"));

    // Advanced filters should now be visible
    expect(screen.getByTestId("start-date")).toBeInTheDocument();
    expect(screen.getByTestId("end-date")).toBeInTheDocument();
  });

  it("calls onFiltersChange when date filters change", async () => {
    const onFiltersChange = jest.fn();
    render(
      <TransactionFilter
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("advanced-toggle")).toBeInTheDocument();
    });

    // Show advanced filters
    fireEvent.click(screen.getByTestId("advanced-toggle"));

    // Change date filters
    await userEvent.type(screen.getByTestId("start-date"), "2024-01-01");
    await userEvent.type(screen.getByTestId("end-date"), "2024-01-31");

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });

  it("clears all filters when clear button is clicked", async () => {
    const onFiltersChange = jest.fn();
    const filtersWithValues: TransactionFilters = {
      type: "EXPENSE",
      categoryId: "1",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      search: "test",
    };

    render(
      <TransactionFilter
        filters={filtersWithValues}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("clear-filters")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("clear-filters"));

    expect(onFiltersChange).toHaveBeenCalledWith({
      type: "all",
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  });

  it("displays active filter tags", async () => {
    const filtersWithValues: TransactionFilters = {
      type: "EXPENSE",
      categoryId: "1",
      search: "test",
    };

    render(
      <TransactionFilter
        filters={filtersWithValues}
        onFiltersChange={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-type")).toBeInTheDocument();
      expect(screen.getByTestId("active-category")).toBeInTheDocument();
      expect(screen.getByTestId("active-search")).toBeInTheDocument();
    });
  });

  it("removes individual filter when tag remove button is clicked", async () => {
    const onFiltersChange = jest.fn();
    const filtersWithValues: TransactionFilters = {
      type: "EXPENSE",
    };

    render(
      <TransactionFilter
        filters={filtersWithValues}
        onFiltersChange={onFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-type")).toBeInTheDocument();
    });

    // Click remove button on type tag
    fireEvent.click(screen.getByTestId("active-type").querySelector("button")!);

    expect(onFiltersChange).toHaveBeenCalledWith({
      type: "all",
    });
  });
});
