/**
 * TransactionForm Component
 * Form for creating and editing transactions
 */

import React, { useState, useEffect } from "react";
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "../../../types/transaction";
import { Category } from "../../../types/category";
import { validateTransaction } from "../../../utils/validation";
import TransactionService from "../../../services/transactionService";
import "./TransactionForm.css";

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionRequest | UpdateTransactionRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * TransactionForm component for adding/editing transactions
 * @param transaction - Optional transaction data for edit mode
 * @param onSubmit - Callback for form submission
 * @param onCancel - Callback for form cancellation
 * @param isLoading - Whether form is in loading state
 */
const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    note: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>(null);

  const isEdit = !!transaction;

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Initialize form data if editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        categoryId: transaction.categoryId,
        date: transaction.date.split("T")[0],
        type: transaction.type.toLowerCase() as "INCOME" | "EXPENSE",
        note: transaction.note || "",
      });
    }
  }, [transaction]);

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await TransactionService.getCategories();
      setCategories(cats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Clear validation error for this field
    if (validationErrors && validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined,
      });
    }

    // Special handling for amount field
    if (name === "amount") {
      // Allow only numbers and decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      const parts = numericValue.split(".");
      if (parts.length > 2) {
        return; // Prevent multiple decimal points
      }
      if (parts[1] && parts[1].length > 2) {
        return; // Limit to 2 decimal places
      }
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "type") {
      // Clear category when type changes to prevent mismatch
      setFormData((prev) => ({
        ...prev,
        [name]: value as any,
        categoryId: "", // Reset category when type changes
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    const validationErrors = validateTransaction(
      formData.amount,
      formData.categoryId,
      formData.date,
      formData.type,
      formData.note,
    );

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    // Prepare submission data
    const submitData = {
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      date: formData.date,
      type: formData.type,
      note: formData.note || undefined,
    };

    onSubmit(submitData);
  };

  /**
   * Filter categories based on transaction type
   */
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type,
  );

  if (loading) {
    return (
      <div className="transaction-form" data-testid="transaction-form">
        <div className="transaction-form__loading">
          <div className="transaction-form__spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-form" data-testid="transaction-form">
      <div className="transaction-form__header">
        <h3>{isEdit ? "Edit Transaction" : "Add Transaction"}</h3>
      </div>

      {error && (
        <div className="transaction-form__error" data-testid="error-message">
          <span className="transaction-form__error-icon">⚠</span>
          {error}
          <button
            className="transaction-form__error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="transaction-form__form">
        <div className="transaction-form__field">
          <label htmlFor="type" className="transaction-form__label">
            Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`transaction-form__select ${validationErrors?.type ? "transaction-form__input--error" : ""}`}
            data-testid="transaction-type"
            disabled={isLoading}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          {validationErrors?.type && (
            <span
              className="transaction-form__error-text"
              data-testid="error-type"
            >
              {validationErrors.type}
            </span>
          )}
        </div>

        <div className="transaction-form__field">
          <label htmlFor="amount" className="transaction-form__label">
            Amount *
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`transaction-form__input ${validationErrors?.amount ? "transaction-form__input--error" : ""}`}
            data-testid="transaction-amount"
            disabled={isLoading}
          />
          {validationErrors?.amount && (
            <span
              className="transaction-form__error-text"
              data-testid="error-amount"
            >
              {validationErrors.amount}
            </span>
          )}
        </div>

        <div className="transaction-form__field">
          <label htmlFor="categoryId" className="transaction-form__label">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className={`transaction-form__select ${validationErrors?.categoryId ? "transaction-form__input--error" : ""}`}
            data-testid="transaction-category"
            disabled={isLoading}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {validationErrors?.categoryId && (
            <span
              className="transaction-form__error-text"
              data-testid="error-category"
            >
              {validationErrors.categoryId}
            </span>
          )}
        </div>

        <div className="transaction-form__field">
          <label htmlFor="date" className="transaction-form__label">
            Date *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]}
            className={`transaction-form__input ${validationErrors?.date ? "transaction-form__input--error" : ""}`}
            data-testid="transaction-date"
            disabled={isLoading}
          />
          {validationErrors?.date && (
            <span
              className="transaction-form__error-text"
              data-testid="error-date"
            >
              {validationErrors.date}
            </span>
          )}
        </div>

        <div className="transaction-form__field">
          <label htmlFor="note" className="transaction-form__label">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Optional note about this transaction"
            rows={3}
            className={`transaction-form__textarea ${validationErrors?.note ? "transaction-form__input--error" : ""}`}
            data-testid="transaction-note"
            disabled={isLoading}
          />
          {validationErrors?.note && (
            <span
              className="transaction-form__error-text"
              data-testid="error-note"
            >
              {validationErrors.note}
            </span>
          )}
        </div>

        <div className="transaction-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="transaction-form__button transaction-form__button--cancel"
            data-testid="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="transaction-form__button transaction-form__button--submit"
            data-testid="submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isEdit ? "Update" : "Add"} Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
