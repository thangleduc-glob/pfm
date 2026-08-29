/**
 * Unit tests for TransactionCard component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import TransactionCard from "../index";
import { Transaction } from "../../../../types/transaction";

// Mock the formatting utilities
jest.mock("../../../../utils/formatting", () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

describe("TransactionCard", () => {
  const mockTransaction: Transaction = {
    id: "1",
    userId: "user1",
    amount: 100.5,
    categoryId: "cat1",
    date: "2024-01-15",
    type: "EXPENSE",
    note: "Test transaction",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    category: {
      id: "cat1",
      name: "Food",
      type: "EXPENSE",
    },
  };

  it("renders transaction information correctly", () => {
    render(<TransactionCard transaction={mockTransaction} />);

    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("$100.50")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Test transaction")).toBeInTheDocument();
  });

  it("displays income transaction with positive styling", () => {
    const incomeTransaction = {
      ...mockTransaction,
      type: "INCOME" as const,
      amount: 200,
      category: { ...mockTransaction.category, type: "INCOME" as const },
    };

    render(<TransactionCard transaction={incomeTransaction} />);

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = jest.fn();
    render(<TransactionCard transaction={mockTransaction} onEdit={onEdit} />);

    fireEvent.click(screen.getByTestId("edit-transaction"));
    expect(onEdit).toHaveBeenCalledWith(mockTransaction);
  });

  it("calls onDelete when delete button is clicked and confirmed", () => {
    const onDelete = jest.fn();
    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <TransactionCard transaction={mockTransaction} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByTestId("delete-transaction"));
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(mockTransaction);
  });

  it("does not show actions when showActions is false", () => {
    render(
      <TransactionCard transaction={mockTransaction} showActions={false} />,
    );

    expect(screen.queryByTestId("edit-transaction")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-transaction")).not.toBeInTheDocument();
  });

  it("does not display note when not provided", () => {
    const transactionWithoutNote = {
      ...mockTransaction,
      note: undefined,
    };

    render(<TransactionCard transaction={transactionWithoutNote} />);

    expect(screen.queryByText("Note:")).not.toBeInTheDocument();
  });
});
