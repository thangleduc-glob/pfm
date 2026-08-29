/**
 * CategoriesPage Component
 * Main page for managing categories
 */

import React from 'react';
import CategoryList from '../../components/categories/CategoryList';
import { Category } from '../../types/category';
import './CategoriesPage.css';

/**
 * CategoriesPage component - Main page for category management
 */
const CategoriesPage: React.FC = () => {
  /**
   * Handle category edit action
   */
  const handleEditCategory = (category: Category) => {
    console.log('Editing category:', category);
    // In a real implementation, this might trigger a modal or navigation
  };

  /**
   * Handle category delete action
   */
  const handleDeleteCategory = (category: Category) => {
    console.log('Deleted category:', category);
    // In a real implementation, this might show a success notification
  };

  /**
   * Handle category create action
   */
  const handleCreateCategory = () => {
    console.log('Created new category');
    // In a real implementation, this might show a success notification
  };

  return (
    <div className="categories-page" data-testid="categories-page">
      <div className="page-content">
        <CategoryList
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onCreateCategory={handleCreateCategory}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;