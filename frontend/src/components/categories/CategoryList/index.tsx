/**
 * CategoryList Component
 * Displays a list of categories with filtering and actions
 */

import React, { useState, useEffect } from "react";
import { Category, CategoryWithCount } from "../../../types/category";
import CategoryCard from "../CategoryCard";
import CategoryForm from "../CategoryForm";
import CategoryService from "../../../services/categoryService";
import "./CategoryList.css";

interface CategoryListProps {
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onCreateCategory?: () => void;
}

/**
 * CategoryList component displays and manages categories
 * @param onEditCategory - Optional callback for edit action
 * @param onDeleteCategory - Optional callback for delete action
 * @param onCreateCategory - Optional callback for create action
 */
const CategoryList: React.FC<CategoryListProps> = ({
  onEditCategory,
  onDeleteCategory,
  onCreateCategory,
}) => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [submitting, setSubmitting] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load categories from the API
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, we would get transaction counts from the API
      // For now, we'll simulate it
      const response = await CategoryService.getCategories();

      // Add mock transaction counts for demonstration
      const categoriesWithCount: CategoryWithCount[] = response.categories.map(
        (cat) => ({
          ...cat,
          transactionCount: cat.id === "1" ? 5 : cat.id === "2" ? 1 : 0, // Deterministic mock counts
        }),
      );

      setCategories(categoriesWithCount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle category creation
   */
  const handleCreateCategory = async (data: {
    name: string;
    type: "INCOME" | "EXPENSE";
  }) => {
    try {
      setSubmitting(true);
      await CategoryService.createCategory(data);
      await loadCategories();
      // Set filter to the type of the newly created category
      setFilter(data.type.toUpperCase() as any);
      setShowForm(false);
      onCreateCategory?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle category update
   */
  const handleUpdateCategory = async (data: {
    name: string;
    type: "INCOME" | "EXPENSE";
  }) => {
    if (!editingCategory) return;

    try {
      setSubmitting(true);
      await CategoryService.updateCategory(editingCategory.id, data);
      await loadCategories();
      // Set filter to the updated category type
      setFilter(data.type as any);
      setEditingCategory(null);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle category edit
   */
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
    onEditCategory?.(category);
  };

  /**
   * Handle category delete
   */
  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`,
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await CategoryService.deleteCategory(category.id);
      await loadCategories();
      onDeleteCategory?.(category);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle form cancel
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (data: {
    name: string;
    type: "INCOME" | "EXPENSE";
  }) => {
    if (editingCategory) {
      handleUpdateCategory(data);
    } else {
      handleCreateCategory(data);
    }
  };

  /**
   * Filter categories based on selected filter
   */
  const filteredCategories = categories.filter((category) => {
    if (filter === "ALL") return true;
    return category.type === (filter as any);
  });

  /**
   * Get category counts by type
   */
  const getCategoryCounts = () => {
    const incomeCount = categories.filter(
      (cat) => cat.type === ("INCOME" as any),
    ).length;
    const expenseCount = categories.filter(
      (cat) => cat.type === ("EXPENSE" as any),
    ).length;
    return { incomeCount, expenseCount, total: categories.length };
  };

  const counts = getCategoryCounts();

  if (loading && categories.length === 0) {
    return (
      <div className="category-list" data-testid="category-list">
        <div className="category-list__loading" data-testid="loading-state">
          <div className="category-list__spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-list" data-testid="category-list">
      <div className="category-list__header">
        <h2 className="category-list__title">Categories</h2>
        <button
          className="category-list__add-button"
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          data-testid="add-category-button"
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="category-list__error" data-testid="error-message">
          <span className="category-list__error-icon">⚠</span>
          {error}
          <button
            className="category-list__error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="category-list__stats">
        <span className="category-list__stat">
          Total: <strong>{counts.total}</strong>
        </span>
        <span className="category-list__stat">
          Income: <strong>{counts.incomeCount}</strong>
        </span>
        <span className="category-list__stat">
          Expense: <strong>{counts.expenseCount}</strong>
        </span>
      </div>

      <div className="category-list__filters">
        <button
          className={`category-list__filter ${filter === "ALL" ? "category-list__filter--active" : ""}`}
          onClick={() => setFilter("ALL")}
          data-testid="filter-all"
        >
          All ({counts.total})
        </button>
        <button
          className={`category-list__filter ${filter === "INCOME" ? "category-list__filter--active" : ""}`}
          onClick={() => setFilter("INCOME")}
          data-testid="filter-income"
        >
          Income ({counts.incomeCount})
        </button>
        <button
          className={`category-list__filter ${filter === "EXPENSE" ? "category-list__filter--active" : ""}`}
          onClick={() => setFilter("EXPENSE")}
          data-testid="filter-expense"
        >
          Expense ({counts.expenseCount})
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
          existingCategories={categories}
        />
      )}

      <div className="category-list__content">
        {filteredCategories.length === 0 ? (
          <div className="category-list__empty" data-testid="empty-state">
            <p>
              {filter === "ALL"
                ? "No categories found. Create your first category to get started!"
                : `No ${filter} categories found.`}
            </p>
          </div>
        ) : (
          <div className="category-list__grid">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
                transactionCount={category.transactionCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
