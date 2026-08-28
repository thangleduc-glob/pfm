/**
 * Unit tests for CategoryCard component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryCard from '../index';
import { Category } from '../../../../types/category';

// Mock data
const mockCategory: Category = {
  id: '1',
  name: 'Groceries',
  type: 'expense',
  userId: 'user1',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

describe('CategoryCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category information correctly', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('displays transaction count when provided', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        transactionCount={5}
      />
    );

    expect(screen.getByText('Transactions:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockCategory);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockCategory);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('disables delete button when category has transactions', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        transactionCount={3}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'Cannot delete category with existing transactions');
  });

  it('enables delete button when category has no transactions', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        transactionCount={0}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).not.toBeDisabled();
  });

  it('shows updated date when different from created date', () => {
    const updatedCategory: Category = {
      ...mockCategory,
      updatedAt: '2024-01-20T15:30:00Z'
    };

    render(
      <CategoryCard
        category={updatedCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Updated:')).toBeInTheDocument();
  });

  it('applies correct type styling for income categories', () => {
    const incomeCategory: Category = {
      ...mockCategory,
      type: 'income'
    };

    render(
      <CategoryCard
        category={incomeCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const typeElement = screen.getByText('income');
    expect(typeElement).toHaveClass('category-card__type--income');
  });

  it('applies correct type styling for expense categories', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const typeElement = screen.getByText('expense');
    expect(typeElement).toHaveClass('category-card__type--expense');
  });

  it('has proper accessibility attributes', () => {
    render(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText('Edit Groceries category');
    const deleteButton = screen.getByLabelText('Delete Groceries category');

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});