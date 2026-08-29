# Personal Finance Manager (PFM)

A comprehensive web application for managing personal finances, tracking expenses, and generating insightful reports.

## 🚀 App Functionalities

### Core Features

1. **User Authentication**
   - Secure user registration and login
   - Session management with JWT tokens
   - Protected routes and middleware

2. **Dashboard**
   - Real-time financial overview
   - Monthly income and expense summaries
   - Quick insights into spending patterns
   - Visual charts and metrics

3. **Transaction Management**
   - Add, edit, and delete transactions
   - Categorize transactions (income/expense)
   - Search and filter transactions
   - Date-based transaction tracking

4. **Category Management**
   - Create custom income and expense categories
   - Edit and delete categories
   - Category-based transaction organization

5. **Expense Reports**
   - Category-wise expense breakdowns
   - Visual charts for spending analysis
   - Monthly and yearly reports
   - Export functionality for reports

6. **Data Visualization**
   - Interactive charts for financial data
   - Category-wise spending distribution
   - Trend analysis over time

## 🏗️ Development Approach: Spec-Driven Development with CODA

This project is implemented using **Spec-Driven Development**, a methodology that emphasizes thorough planning and documentation before implementation. The entire development process was orchestrated using the **CODA AI agent**.

### Development Workflow

#### 1. **Specification Phase** (`spec.md`)
The project begins with a comprehensive specification document that defines:
- Business requirements and rules
- User stories and use cases
- Technical requirements
- Data models and API contracts
- UI/UX guidelines

#### 2. **Constitution Phase** (`constitution.md`)
The constitution establishes the development standards:
- Technology stack decisions
- Coding standards and conventions
- Testing strategies
- Deployment guidelines
- Quality assurance processes

#### 3. **Architecture Planning** (`plan.md`)
Detailed architectural planning includes:
- System design and component architecture
- Database schema design
- API design patterns
- Frontend component hierarchy
- Integration patterns

#### 4. **Task Breakdown** (`tasks.md`)
The entire project is broken down into granular tasks:
- Each task has clear acceptance criteria
- Dependencies between tasks are identified
- Time estimates are provided
- Tasks are prioritized and sequenced

#### 5. **Progress Tracking** (`progress.md`)
Real-time progress tracking maintains:
- Completed tasks with timestamps
- Current work in progress
- Time spent on each task
- Rejection log for failed attempts

### CODA Agent Implementation

The **CODA AI agent** was instrumental throughout the development process:

#### 🤖 What CODA Does

1. **Task Execution**
   - Automatically reads and understands task requirements
   - Implements features according to specifications
   - Writes code following constitutional guidelines
   - Creates and runs tests

2. **Code Generation**
   - Generates both frontend and backend code
   - Creates database migrations
   - Implements API endpoints
   - Builds React components with proper styling

3. **Testing**
   - Writes unit tests for all components
   - Creates integration tests
   - Validates functionality against requirements
   - Ensures code quality

4. **Documentation**
   - Updates progress in real-time
   - Documents implementation decisions
   - Maintains consistency across the codebase

#### 🎯 Key Benefits of Using CODA

1. **Consistency**: All code follows the same patterns and standards
2. **Speed**: Parallel development of multiple features
3. **Quality**: Built-in testing and validation
4. **Traceability**: Every change is documented and tracked
5. **Compliance**: Adherence to constitutional guidelines

### Project Structure

```
pfm/
├── 📋 spec.md              # Business requirements and specifications
├── 📜 constitution.md       # Development standards and guidelines
├── 📐 plan.md              # Architecture and system design
├── 📝 tasks.md             # Detailed task breakdown
├── 📊 progress.md          # Real-time progress tracking
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── controllers/   # API endpoint handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── middleware/    # Auth and validation
│   │   └── routes/        # API routes
│   └── tests/             # Backend tests
├── frontend/              # React/TypeScript UI
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript definitions
│   └── test/              # Frontend tests
└── e2e/                   # End-to-end tests
```

### Technology Stack

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **MySQL** as the database
- **JWT** for authentication
- **Jest** for testing

#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API calls
- **Vitest** for testing
- **CSS Modules** for styling

### Development Process

1. **Initialization**
   - CODA reads `spec.md` to understand requirements
   - Reviews `constitution.md` for standards
   - Analyzes `plan.md` for architecture

2. **Task Execution**
   - CODA picks tasks from `tasks.md` in order
   - Implements features according to specifications
   - Updates `progress.md` with completion status

3. **Quality Assurance**
   - Automatic testing of all features
   - Code review against constitutional standards
   - Integration testing across components

4. **Documentation**
   - Real-time progress updates
   - Implementation notes and decisions
   - Time tracking for each task

### Results

This spec-driven approach with CODA has resulted in:
- ✅ **100% requirement coverage** - All features from spec.md implemented
- ✅ **Consistent code quality** - Following constitutional guidelines
- ✅ **Comprehensive testing** - Unit and integration tests for all features
- ✅ **Transparent development** - Full traceability in progress.md
- ✅ **Rapid development** - Parallel implementation of features

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up the database
4. Configure environment variables
5. Run the application

### Running the App

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📸 App Screenshots

### Login/Register
<img width="1371" height="780" alt="Login/Register" src="https://github.com/user-attachments/assets/ebe11690-2b97-4faf-ba5a-40d6a751d958" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-radius: 8px;" />

**Authentication Interface** 
- Clean and modern login/register form with:
- Secure password validation with strength requirements
- Toggle between login and registration modes
- Form validation with helpful error messages
- Responsive design for all devices

### Dashboard
<img width="1377" height="776" alt="Dashboard" src="https://github.com/user-attachments/assets/22a81ca7-3b32-46e4-b576-7db808a79b38" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-radius: 8px;" />

**Financial Overview Dashboard** 
- Comprehensive view of your financial health featuring:
- Monthly income vs expense comparison with visual charts
- Total balance and transaction count metrics
- Recent transactions list with quick actions
- Interactive spending category breakdown
- Quick navigation to all major features

### Transactions
<img width="1372" height="781" alt="Transactions" src="https://github.com/user-attachments/assets/e61a156e-92c2-43a9-ae45-5dbe099507ee" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-radius: 8px;" />

**Transaction Management** 
- Complete control over your financial transactions:
- Add new income/expense transactions with detailed forms
- Edit or delete existing transactions with confirmation
- Advanced filtering by date, category, and type
- Search functionality to find specific transactions quickly
- Sortable columns for better organization
- Visual indicators for income (green) vs expenses (red)

### Categories
<img width="1373" height="780" alt="Categories" src="https://github.com/user-attachments/assets/feca4200-b8b3-465f-bd7d-330c195b2fb5" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-radius: 8px;" />

**Category Management** 
- Organize your finances with custom categories:
- Create unlimited income and expense categories
- Color-coded category types for easy identification
- Edit category names and types as needed
- Delete unused categories with safety checks
- View transaction count per category
- Clean, intuitive interface for quick category management

### Reports
<img width="1370" height="884" alt="Reports" src="https://github.com/user-attachments/assets/86ec3576-7758-421d-a873-b6eec89a7b15" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-radius: 8px;" />

**Expense Reports & Analytics** 
- Deep insights into your spending patterns:
- Category-wise expense breakdown with percentages
- Interactive bar charts for visual analysis
- Filter reports by date range for specific periods
- Grand total calculations with detailed summaries
- Export functionality for external analysis
- Responsive charts that adapt to different screen sizes
- Clear visualization of where your money goes each month

---

*Built with ❤️ using modern web technologies*