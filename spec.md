# PFM Product Specification

## 1. Overview

### Problem Statement
Individuals need a simple way to track their personal income and expenses to understand their financial situation and make informed spending decisions. Many existing tools are overly complex, require bank integrations, or have subscription costs that create barriers to basic financial tracking.

### Target Users
- Individuals who want to track personal income and expenses
- Users who prefer a simple, manual entry approach
- People who want to understand their spending patterns without complex features
- Users comfortable with web-based applications

### Success Metrics
- User can successfully register and log in within 2 minutes
- User can add a transaction within 30 seconds
- User can view current month's financial summary on dashboard
- User can generate expense report by category
- Application maintains 99% uptime for core features

## 2. User Stories

### Authentication

**US-001: User Registration**
As a new user, I want to create an account with username and password so that I can access the application and track my finances.

Acceptance Criteria:
- Given I am on the registration page, when I enter a unique username and valid password, then my account is created
- Given I enter a username that already exists, when I submit the form, then I see an error message "Username already exists"
- Given I enter a password shorter than 8 characters, when I submit the form, then I see an error message "Password must be at least 8 characters"
- Given I successfully register, when the form is submitted, then I am redirected to the login page

**US-002: User Login**
As a registered user, I want to log in with my username and password so that I can access my financial data.

Acceptance Criteria:
- Given I enter valid credentials, when I click login, then I am redirected to the dashboard
- Given I enter invalid credentials, when I click login, then I see an error message "Invalid username or password"
- Given I leave fields empty, when I click login, then I see validation errors for empty fields
- Given I successfully log in, when the dashboard loads, then I see my financial information

**US-003: User Logout**
As a logged-in user, I want to log out so that my financial data remains secure when I'm away from the application.

Acceptance Criteria:
- Given I am logged in, when I click logout, then I am redirected to the login page
- Given I have logged out, when I try to access protected pages, then I am redirected to the login page
- Given I have logged out, when I close and reopen the browser, then I remain logged out

### Category Management

**US-004: Create Category**
As a user, I want to create income and expense categories so that I can organize my transactions properly.

Acceptance Criteria:
- Given I am on the categories page, when I enter a category name and select type, then the category is created
- Given I enter a duplicate category name of the same type, when I submit, then I see an error "Category already exists"
- Given I leave the category name empty, when I submit, then I see an error "Category name is required"
- Given I successfully create a category, when the form submits, then the new category appears in the category list

**US-005: Edit Category**
As a user, I want to edit existing categories so that I can correct mistakes or update category information.

Acceptance Criteria:
- Given I click edit on a category, when I modify the name and save, then the category is updated
- Given I try to edit a category to a duplicate name, when I save, then I see an error "Category already exists"
- Given I edit a category used in transactions, when I save, then existing transactions reflect the updated category name
- Given I cancel editing, when I click cancel, then the original category name is preserved

**US-006: Delete Category**
As a user, I want to delete categories so that I can remove unused or unwanted categories.

Acceptance Criteria:
- Given I click delete on a category with no transactions, when I confirm, then the category is deleted
- Given I try to delete a category with existing transactions, when I click delete, then I see an error "Cannot delete category with existing transactions"
- Given I cancel deletion, when I click cancel, then the category remains unchanged
- Given I successfully delete a category, when the operation completes, then the category no longer appears in the list

### Transaction Management

**US-007: Add Transaction**
As a user, I want to add income and expense transactions so that I can track my financial activities.

Acceptance Criteria:
- Given I am on the add transaction page, when I enter amount, select category, choose date, and select type, then the transaction is saved
- Given I enter a negative amount, when I submit, then I see an error "Amount must be positive"
- Given I don't select a category, when I submit, then I see an error "Category is required"
- Given I select an expense transaction but choose an income category, when I submit, then I see an error "Category type must match transaction type"
- Given I successfully add a transaction, when saved, then I am redirected to the transaction history page

**US-008: View Transaction History**
As a user, I want to view my transaction history so that I can review all my financial activities.

Acceptance Criteria:
- Given I am on the transaction history page, when the page loads, then I see all my transactions ordered by date (newest first)
- Given I have no transactions, when the page loads, then I see a message "No transactions found"
- Given I have transactions, when the page loads, then each transaction shows amount, category, date, type, and note
- Given I click on a transaction, when selected, then I can see the full transaction details

**US-009: Filter Transactions**
As a user, I want to filter transactions by type, category, or date range so that I can find specific transactions quickly.

Acceptance Criteria:
- Given I select "income" as transaction type filter, when I apply filter, then only income transactions are displayed
- Given I select a specific category, when I apply filter, then only transactions from that category are displayed
- Given I select a date range, when I apply filter, then only transactions within that date range are displayed
- Given I apply multiple filters, when I apply them, then transactions matching all criteria are displayed
- Given I clear all filters, when I click clear, then all transactions are displayed

### Dashboard

**US-010: View Financial Summary**
As a user, I want to see a dashboard with my current financial situation so that I can quickly understand my financial health.

Acceptance Criteria:
- Given I am on the dashboard, when the page loads, then I see current balance (total income - total expenses)
- Given I am on the dashboard, when the page loads, then I see total income for the current month
- Given I am on the dashboard, when the page loads, then I see total expenses for the current month
- Given I am on the dashboard, when the page loads, then I see remaining amount (current month income - current month expenses)
- Given I have no transactions, when the dashboard loads, then all amounts show as $0.00

### Expense Report

**US-011: View Expense Report**
As a user, I want to view an expense report grouped by category so that I can understand where my money is going.

Acceptance Criteria:
- Given I am on the expense report page, when the page loads, then I see expense categories grouped with total amounts
- Given I have no expense transactions, when the page loads, then I see "No expense data available"
- Given I have expense transactions, when the page loads, then categories are sorted by total amount (highest first)
- Given I view the report, when displayed, then each category shows category name and total amount spent
- Given I view the report, when displayed, then I see a grand total of all expenses at the bottom

## 3. Business Rules

### Authentication Rules

**BR-001: User Registration Validation**
Given a user attempts to register, when the username is already taken, then registration must fail with error "Username already exists"

**BR-002: Password Security**
Given a user creates or updates their password, when the password is provided, then it must be at least 8 characters long and contain at least one letter and one number

**BR-003: Session Management**
Given a user is logged in, when their session expires, then they must be redirected to the login page on next action

### Category Rules

**BR-004: Category Uniqueness**
Given a user creates or updates a category, when the category name and type combination already exists for that user, then the operation must fail

**BR-005: Category Type Validation**
Given a category is created, when the type is specified, then it must be either "income" or "expense"

**BR-006: Category Deletion Constraint**
Given a user attempts to delete a category, when the category has associated transactions, then deletion must be prevented

### Transaction Rules

**BR-007: Transaction Amount Validation**
Given a transaction is created or updated, when the amount is provided, then it must be a positive number greater than 0

**BR-008: Transaction Category Type Matching**
Given a transaction is created, when the transaction type is "expense", then the selected category must also be of type "expense"

**BR-009: Transaction Date Validation**
Given a transaction is created, when the date is provided, then it must not be in the future (current date is maximum)

**BR-010: Transaction Ownership**
Given a user accesses transaction data, when the data is retrieved, then only transactions belonging to that user must be returned

### Dashboard Calculation Rules

**BR-011: Current Balance Calculation**
Given the dashboard displays current balance, when calculated, then it must equal sum of all income transactions minus sum of all expense transactions for the user

**BR-012: Monthly Income Calculation**
Given the dashboard displays current month income, when calculated, then it must equal sum of all income transactions within the current calendar month

**BR-013: Monthly Expense Calculation**
Given the dashboard displays current month expenses, when calculated, then it must equal sum of all expense transactions within the current calendar month

**BR-014: Remaining Amount Calculation**
Given the dashboard displays remaining amount, when calculated, then it must equal current month income minus current month expenses

### Report Rules

**BR-015: Expense Report Calculation**
Given an expense report is generated, when calculated, then it must group all expense transactions by category and sum amounts within each category

**BR-016: Report Date Range**
Given an expense report is viewed, when displayed, then it must include all expense transactions for the user regardless of date

### Authorization Rules

**BR-017: Data Ownership Enforcement**
Given any API request is made, when processing the request, then the system must verify the user owns the requested data

**BR-018: Authentication Requirement**
Given a user attempts to access any protected page, when not authenticated, then they must be redirected to the login page

## 4. Data Model (Conceptual)

**Technology Note**: This data model will be implemented using Prisma ORM with MySQL database.

### User
- **id**: UUID (Primary Key, Required)
- **username**: String (Required, Unique, Max 50 characters)
- **password_hash**: String (Required, Hashed with bcrypt)
- **created_at**: DateTime (Required, Auto-generated)
- **updated_at**: DateTime (Required, Auto-updated)

**Relationships**: One-to-Many with Category and Transaction

### Category
- **id**: UUID (Primary Key, Required)
- **user_id**: UUID (Foreign Key to User, Required)
- **name**: String (Required, Max 100 characters)
- **type**: Enum (Required, Values: "income", "expense")
- **created_at**: DateTime (Required, Auto-generated)
- **updated_at**: DateTime (Required, Auto-updated)

**Relationships**: 
- Many-to-One with User
- One-to-Many with Transaction

**Constraints**: 
- Unique combination of (user_id, name, type)
- Category name cannot be empty

### Transaction
- **id**: UUID (Primary Key, Required)
- **user_id**: UUID (Foreign Key to User, Required)
- **category_id**: UUID (Foreign Key to Category, Required)
- **amount**: Decimal (Required, Precision 10, Scale 2, Must be > 0)
- **type**: Enum (Required, Values: "income", "expense")
- **date**: Date (Required, Cannot be future date)
- **note**: String (Optional, Max 500 characters)
- **created_at**: DateTime (Required, Auto-generated)
- **updated_at**: DateTime (Required, Auto-updated)

**Relationships**:
- Many-to-One with User
- Many-to-One with Category

**Constraints**:
- Transaction type must match category type
- Amount must be positive
- Date cannot be in the future
- User can only access their own transactions

## 5. API Contract

**Technology Note**: API validation will be implemented using Zod schemas. HTTP requests will be made using Axios with interceptors.

### Authentication Endpoints

#### POST /api/v1/auth/register
**Purpose**: Create a new user account

**Request Body**:
```json
{
  "username": "string (required, 3-50 chars)",
  "password": "string (required, 8+ chars, 1 letter, 1 number)"
}
```

**Success Response** (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

**Error Responses**:
- 400: "Username already exists"
- 400: "Invalid username or password format"

#### POST /api/v1/auth/login
**Purpose**: Authenticate user and create session

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

**Error Responses**:
- 401: "Invalid username or password"
- 400: "Username and password required"

#### POST /api/v1/auth/logout
**Purpose**: End user session

**Success Response** (200):
```json
{
  "message": "Logout successful"
}
```

### Category Endpoints

#### GET /api/v1/categories
**Purpose**: Get all categories for authenticated user

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "income|expense",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### POST /api/v1/categories
**Purpose**: Create a new category

**Request Body**:
```json
{
  "name": "string (required, max 100 chars)",
  "type": "income|expense (required)"
}
```

**Success Response** (201):
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "income|expense",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Error Responses**:
- 400: "Category name is required"
- 400: "Invalid category type"
- 409: "Category already exists"

#### PUT /api/v1/categories/:id
**Purpose**: Update an existing category

**Request Body**:
```json
{
  "name": "string (required, max 100 chars)"
}
```

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "income|expense",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Error Responses**:
- 404: "Category not found"
- 409: "Category already exists"

#### DELETE /api/v1/categories/:id
**Purpose**: Delete a category

**Success Response** (200):
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses**:
- 404: "Category not found"
- 400: "Cannot delete category with existing transactions"

### Transaction Endpoints

#### GET /api/v1/transactions
**Purpose**: Get transactions with optional filtering

**Query Parameters**:
- `type`: "income|expense" (optional)
- `category_id`: "uuid" (optional)
- `start_date`: "date" (optional, YYYY-MM-DD)
- `end_date`: "date" (optional, YYYY-MM-DD)
- `limit`: "number" (optional, default 20, max 100)
- `offset`: "number" (optional, default 0)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": "decimal",
      "type": "income|expense",
      "date": "date",
      "note": "string|null",
      "category": {
        "id": "uuid",
        "name": "string",
        "type": "income|expense"
      },
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "meta": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

#### POST /api/v1/transactions
**Purpose**: Create a new transaction

**Request Body**:
```json
{
  "amount": "number (required, > 0)",
  "category_id": "uuid (required)",
  "type": "income|expense (required)",
  "date": "date (required, YYYY-MM-DD)",
  "note": "string (optional, max 500 chars)"
}
```

**Success Response** (201):
```json
{
  "data": {
    "id": "uuid",
    "amount": "decimal",
    "type": "income|expense",
    "date": "date",
    "note": "string|null",
    "category": {
      "id": "uuid",
      "name": "string",
      "type": "income|expense"
    },
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Error Responses**:
- 400: "Amount must be positive"
- 400: "Category is required"
- 400: "Category type must match transaction type"
- 400: "Date cannot be in the future"
- 404: "Category not found"

### Dashboard Endpoints

#### GET /api/v1/dashboard
**Purpose**: Get dashboard financial summary

**Success Response** (200):
```json
{
  "data": {
    "current_balance": "decimal",
    "current_month_income": "decimal",
    "current_month_expenses": "decimal",
    "remaining_amount": "decimal"
  }
}
```

### Report Endpoints

#### GET /api/v1/reports/expenses
**Purpose**: Get expense report grouped by category

**Success Response** (200):
```json
{
  "data": [
    {
      "category_name": "string",
      "total_amount": "decimal"
    }
  ],
  "meta": {
    "total_expenses": "decimal"
  }
}
```

### Error Response Format
All error responses follow this format:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "datetime",
  "path": "string",
  "method": "string"
}
```

### Common Error Codes
- **VALIDATION_ERROR**: Request validation failed
- **AUTHENTICATION_REQUIRED**: User not authenticated
- **AUTHORIZATION_FAILED**: User lacks permission
- **RESOURCE_NOT_FOUND**: Requested resource doesn't exist
- **DUPLICATE_RESOURCE**: Resource already exists
- **BUSINESS_RULE_VIOLATION**: Business rule validation failed

## 6. Testing Requirements

**Technology Note**: Testing will be implemented using Vitest for unit tests, Vitest + Supertest for integration tests, and Playwright for E2E tests.

### Unit Testing
- **Framework**: Vitest
- **Target**: Business logic, utilities, and pure functions
- **Coverage**: Minimum 80% for business logic modules
- **Focus**: Financial calculations, validation rules, data transformations

### End-to-End Testing
- **Framework**: Playwright
- **Target**: Critical user journeys (login, transactions, reports)
- **Coverage**: All major user flows must have E2E tests
- **Focus**: User authentication, transaction management, dashboard viewing

### Test Scenarios
- User registration and login flows
- Financial transaction creation and validation
- Account balance calculations
- Data access authorization
- Input validation and sanitization
- Error handling and recovery