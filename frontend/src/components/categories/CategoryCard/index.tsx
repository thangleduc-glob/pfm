/**
 * CategoryCard Component
 * Displays a single category with actions for edit and delete
 */

import React from 'react';
import { Category } from '../../../types/category';
import './CategoryCard.css';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  transactionCount?: number;
}

/**
 * CategoryCard component displays category information and action buttons
 * @param category - The category to display
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @param transactionCount - Optional number of transactions using this category
 */
const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  transactionCount = 0
}) => {
  const handleEdit = () => {
    onEdit(category);
  };

  const handleDelete = () => {
    onDelete(category);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="category-card" data-testid="category-card">
      <div className="category-card__header">
        <h3 className="category-card__name">{category.name}</h3>
        <span className={`category-card__type category-card__type--${category.type}`}>
          {category.type}
        </span>
      </div>
      
      <div className="category-card__details">
        <div className="category-card__info">
          <span className="category-card__label">Created:</span>
          <span className="category-card__value">{formatDate(category.createdAt)}</span>
        </div>
        
        {transactionCount > 0 && (
          <div className="category-card__info">
            <span className="category-card__label">Transactions:</span>
            <span className="category-card__value">{transactionCount}</span>
          </div>
        )}
        
        {category.updatedAt !== category.createdAt && (
          <div className="category-card__info">
            <span className="category-card__label">Updated:</span>
            <span className="category-card__value">{formatDate(category.updatedAt)}</span>
          </div>
        )}
      </div>
      
      <div className="category-card__actions">
        <button
          className="category-card__button category-card__button--edit"
          onClick={handleEdit}
          data-testid="edit-button"
          aria-label={`Edit ${category.name} category`}
        >
          Edit
        </button>
        
        <button
          className="category-card__button category-card__button--delete"
          onClick={handleDelete}
          data-testid="delete-button"
          aria-label={`Delete ${category.name} category`}
          disabled={transactionCount > 0}
          title={transactionCount > 0 ? 'Cannot delete category with existing transactions' : 'Delete category'}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;