/**
 * Unit tests for TransactionList component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionList from "../index";
import { Transaction } from "../../../../types/transaction";
import TransactionService from "../../../../services/transactionService";

// Mock the transaction service
jest.mock("../../../../services/transactionService");
const mockTransactionService = TransactionService as jest.Mocked<
  typeof TransactionService
>;

// Mock child components
jest.mock("../TransactionCard", () => {
  return function MockTransactionCard({ transaction, onEdit, onDelete }: any) {
    return (
      <div data-testid={`transaction-card-${transaction.id}`}>
        <span>{transaction.amount}</span>
        <button onClick={() => onEdit?.(transaction)}>Edit</button>
        <button onClick={() => onDelete?.(transaction)}>Delete</button>
      </div>
    );
  };
});

jest.mock("../TransactionForm", () => {
  return function MockTransactionForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="transaction-form">
        <button onClick={() => onSubmit({ amount: 100 })}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock("../TransactionFilter", () => {
  return function MockTransactionFilter({ filters, onFiltersChange }: any) {
    return (
      <div data-testid="transaction-filter">
        <button onClick={() => onFiltersChange({ ...filters, type: "INCOME" })}>
          Filter
        </button>
      </div>
    );
  };
});

describe("TransactionList", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      userId: "user1",
      amount: 100,
      categoryId: "cat1",
      date: "2024-01-15",
      type: "EXPENSE",
      note: "Test transaction 1",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      category: { id: "cat1", name: "Food", type: "EXPENSE" },
    },
    {
      id: "2",
      userId: "user1",
      amount: 200,
      categoryId: "cat2",
      date: "2024-01-16",
      type: "INCOME",
      note: "Test transaction 2",
      createdAt: "2024-01-16T10:00:00Z",
      updatedAt: "2024-01-16T10:00:00Z",
      category: { id: "cat2", name: "Salary", type: "INCOME" },
    },
  ];

  const mockResponse = {
    transactions: mockTransactions,
    total: 2,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    mockTransactionService.getTransactions.mockResolvedValue(mockResponse);
    mockTransactionService.createTransaction.mockResolvedValue(
      mockTransactions[0],
    );
    mockTransactionService.updateTransaction.mockResolvedValue(
      mockTransactions[0],
    );
    mockTransactionService.deleteTransaction.mockResolvedValue();
  });

  it("renders transaction list correctly", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-card-2")).toBeInTheDocument();
    });
  });

  it("loads transactions on mount", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith(
        1,
        10,
        { type: "all" },
      );
    });
  });

  it("shows loading state initially", () => {
    mockTransactionService.getTransactions.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<TransactionList />);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    mockTransactionService.getTransactions.mockResolvedValue({
      transactions: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  it("opens form when add transaction button is clicked", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("add-transaction-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("add-transaction-button"));

    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
  });

  it("creates transaction when form is submitted", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("add-transaction-button")).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByTestId("add-transaction-button"));

    // Submit form
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith({
        amount: 100,
      });
    });
  });

  it("edits transaction when edit button is clicked", async () => {
    const onEdit = jest.fn();
    render(<TransactionList onEditTransaction={onEdit} />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-card-1")).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
  });

  it("deletes transaction when delete button is clicked", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-card-1")).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith(
        "1",
      );
    });
  });

  it("applies filters when filter changes", async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-filter")).toBeInTheDocument();
    });

    // Apply filter
    fireEvent.click(screen.getByText("Filter"));

    await waitFor(() => {
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith(
        1,
        10,
        { type: "INCOME" },
      );
    });
  });

  it("handles pagination correctly", async () => {
    const paginatedResponse = {
      ...mockResponse,
      total: 25,
    };
    mockTransactionService.getTransactions.mockResolvedValue(paginatedResponse);

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("next-page")).toBeInTheDocument();
    });

    // Click next page
    fireEvent.click(screen.getByTestId("next-page"));

    await waitFor(() => {
      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith(
        2,
        10,
        { type: "all" },
      );
    });
  });

  it("shows error message when API call fails", async () => {
    mockTransactionService.getTransactions.mockRejectedValue(
      new Error("API Error"),
    );

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  it("dismisses error message when close button is clicked", async () => {
    mockTransactionService.getTransactions.mockRejectedValue(
      new Error("API Error"),
    );

    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    // Click close button
    fireEvent.click(screen.getByLabelText("Dismiss error"));

    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});
