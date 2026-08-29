/**
 * Unit tests for TransactionForm component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionForm from "../index";
import { Transaction } from "../../../../types/transaction";
import TransactionService from "../../../../services/transactionService";

// Mock the transaction service
jest.mock("../../../../services/transactionService");
const mockTransactionService = TransactionService as jest.Mocked<
  typeof TransactionService
>;

// Mock the validation utility
jest.mock("../../../../utils/validation", () => ({
  validateTransaction: () => ({}),
}));

describe("TransactionForm", () => {
  const mockCategories = [
    {
      id: "1",
      name: "Food",
      type: "EXPENSE" as const,
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

  const mockTransaction: Transaction = {
    id: "1",
    userId: "user1",
    amount: 100,
    categoryId: "1",
    date: "2024-01-15",
    type: "EXPENSE" as const,
    note: "Test note",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    category: { id: "1", name: "Food", type: "EXPENSE" },
  };

  beforeEach(() => {
    mockTransactionService.getCategories.mockResolvedValue(mockCategories);
  });

  it("renders form fields correctly", async () => {
    render(<TransactionForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-type")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-amount")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-category")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-date")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-note")).toBeInTheDocument();
    });
  });

  it("loads categories on mount", async () => {
    render(<TransactionForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(mockTransactionService.getCategories).toHaveBeenCalled();
    });
  });

  it("submits form with correct data", async () => {
    const onSubmit = jest.fn();
    render(<TransactionForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-type")).toBeInTheDocument();
    });

    // Fill form
    await userEvent.selectOptions(
      screen.getByTestId("transaction-type"),
      "EXPENSE",
    );
    await userEvent.type(screen.getByTestId("transaction-amount"), "100.50");
    await userEvent.selectOptions(
      screen.getByTestId("transaction-category"),
      "1",
    );
    await userEvent.type(screen.getByTestId("transaction-note"), "Test note");

    // Submit form
    fireEvent.click(screen.getByTestId("submit-button"));

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 100.5,
      categoryId: "1",
      date: expect.any(String),
      type: "EXPENSE" as const,
      note: "Test note",
    });
  });

  it("populates form with transaction data in edit mode", async () => {
    render(
      <TransactionForm
        transaction={mockTransaction}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("EXPENSE")).toBeInTheDocument();
      expect(screen.getByDisplayValue("100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-01-15")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test note")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = jest.fn();
    render(<TransactionForm onSubmit={jest.fn()} onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("cancel-button"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("filters categories based on transaction type", async () => {
    render(<TransactionForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-category")).toBeInTheDocument();
    });

    // Initially should show all categories
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();

    // Change to income type
    await userEvent.selectOptions(
      screen.getByTestId("transaction-type"),
      "INCOME",
    );

    // Should only show income categories
    expect(screen.queryByText("Food")).not.toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("resets category when type changes", async () => {
    render(<TransactionForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-category")).toBeInTheDocument();
    });

    // Select expense category
    await userEvent.selectOptions(
      screen.getByTestId("transaction-category"),
      "1",
    );
    await userEvent.selectOptions(
      screen.getByTestId("transaction-type"),
      "EXPENSE",
    );

    // Change type to income
    await userEvent.selectOptions(
      screen.getByTestId("transaction-type"),
      "INCOME",
    );

    // Category should be reset
    expect(screen.getByDisplayValue("")).toBeInTheDocument();
  });
});
