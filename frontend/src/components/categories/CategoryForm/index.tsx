/**
 * CategoryForm Component
 * Form for creating and editing categories
 */

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/category';
import { validateCategory } from '../../../utils/validation';
import './CategoryForm.css';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingCategories?: Category[];
}

/**
 * CategoryForm component for creating and editing categories
 * @param category - Optional category data for editing mode
 * @param onSubmit - Callback function when form is submitted
 * @param onCancel - Callback function when form is cancelled
 * @param isLoading - Optional loading state
 * @param existingCategories - Optional list of existing categories for duplicate validation
 */
const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  existingCategories = []
}) => {
  const isEditing = !!category;
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    setError,
    watch
  } = useForm<CreateCategoryRequest | UpdateCategoryRequest>({
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense'
    },
    mode: 'onChange'
  });

  const watchedName = watch('name');
  const watchedType = watch('type');

  // Check for duplicate category names
  const isDuplicateName = (name: string, type: string) => {
    return existingCategories.some(
      cat => cat.name.toLowerCase() === name.toLowerCase() &&
      cat.type === type &&
      cat.id !== category?.id
    );
  };

  // Custom validation for duplicate names
  useEffect(() => {
    if (watchedName && watchedType && isDuplicateName(watchedName, watchedType)) {
      setError('name', {
        type: 'manual',
        message: 'Category with this name and type already exists'
      });
    }
  }, [watchedName, watchedType, setError, category?.id, existingCategories]);

  const onFormSubmit = (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    // Validate using our validation utility
    const validationErrors = validateCategory(data.name, data.type);
    
    if (Object.keys(validationErrors).length > 0) {
      // Set form errors
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as keyof typeof validationErrors, {
          type: 'manual',
          message
        });
      });
      return;
    }

    // Check for duplicates again
    if (isDuplicateName(data.name, data.type)) {
      setError('name', {
        type: 'manual',
        message: 'Category with this name and type already exists'
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="category-form" data-testid="category-form">
      <h2 className="category-form__title">
        {isEditing ? 'Edit Category' : 'Create New Category'}
      </h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="category-form__form">
        <div className="category-form__field">
          <label htmlFor="name" className="category-form__label">
            Category Name *
          </label>
          <input
            id="name"
            type="text"
            className={`category-form__input ${errors.name ? 'category-form__input--error' : ''}`}
            placeholder="Enter category name"
            {...register('name', {
              required: 'Category name is required',
              maxLength: {
                value: 50,
                message: 'Category name must be 50 characters or less'
              },
              validate: {
                noDuplicates: (value) => {
                  if (!value || !watchedType) return true;
                  return !isDuplicateName(value, watchedType) || 'Category with this name and type already exists';
                }
              }
            })}
            disabled={isLoading}
            data-testid="category-name-input"
          />
          {errors.name && (
            <span className="category-form__error" data-testid="name-error">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="category-form__field">
          <label htmlFor="type" className="category-form__label">
            Category Type *
          </label>
          <Controller
            name="type"
            control={control}
            rules={{
              required: 'Category type is required',
              validate: {
                validType: (value) => 
                  (value === 'income' || value === 'expense') || 'Category type must be either income or expense'
              }
            }}
            render={({ field }) => (
              <select
                id="type"
                className={`category-form__select ${errors.type ? 'category-form__select--error' : ''}`}
                disabled={isLoading}
                data-testid="category-type-select"
                {...field}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            )}
          />
          {errors.type && (
            <span className="category-form__error" data-testid="type-error">
              {errors.type.message}
            </span>
          )}
        </div>

        <div className="category-form__actions">
          <button
            type="button"
            className="category-form__button category-form__button--cancel"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="category-form__button category-form__button--submit"
            disabled={isLoading || !isValid || !isDirty}
            data-testid="submit-button"
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;