# Project Constitution: PFM

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API + useReducer for global state, useState for local state
- **Styling**: CSS Modules or styled-components
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form with validation
- **UI Components**: Custom components following design system

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript with strict mode
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod for request validation
- **Logging**: Winston or similar structured logger
- **Environment**: dotenv for configuration

### Database
- **Engine**: MySQL 8.0+
- **ORM**: Prisma
- **Migrations**: Version-controlled schema changes
- **Backup Strategy**: Automated daily backups

### Authentication
- **Method**: Username and password with JWT tokens
- **Password Hashing**: bcrypt with minimum 12 rounds
- **JWT Secret**: Environment variable, minimum 256 bits
- **Token Expiration**: 15 minutes for access, 7 days for refresh
- **Storage**: HttpOnly, Secure cookies for tokens

### Testing
- **Unit Tests**: Vitest for business logic and utilities
- **E2E Tests**: Playwright for critical user flows
- **Test Data**: Factories for consistent test data generation
- **Coverage**: Minimum 80% for business logic, 60% overall

### Deployment
- **Frontend**: Vercel with automatic deployments
- **Backend**: AWS EC2
- **Database**: AWS RDS MySQL with encryption at rest
- **CI/CD**: GitHub Actions for automated testing and deployment

### Important Infrastructure
- **Reverse Proxy**: Nginx for SSL termination and load balancing

---

## Architecture Principles

### Separation of Concerns
- Frontend components handle UI logic only
- Backend controllers handle HTTP concerns only
- Business logic resides in service layers
- Data access logic isolated in repositories
- Configuration separated from application code

### Layered Architecture
```
Frontend: Components → Hooks → Services → API Client
Backend: Controllers → Services → Repositories → Database
```

### Single Responsibility Principle
- Each function/class has one reason to change
- Components focus on single UI concern
- Services handle single business capability
- Utilities perform one specific task

### Business Logic Separation
- No business logic in React components
- No business logic in Express controllers
- All financial calculations in dedicated services
- Validation rules centralized and reusable

### Reusable Components
- UI components follow atomic design principles
- Business services designed for reuse
- Shared utilities in dedicated modules
- Common types and interfaces centralized

---

## Boundaries

### ALWAYS DO

#### Data Access
- Validate all user input at API boundaries using schemas
- Use parameterized queries or ORM to prevent SQL injection
- Implement database transactions for multi-table operations
- Sanitize all data before database insertion
- Use connection pooling for database connections

#### Authentication & Authorization
- Verify JWT tokens on every protected API endpoint
- Check user ownership before allowing data access/modification
- Implement server-side authorization for all resource operations
- Use secure, HttpOnly cookies for token storage
- Log all authentication attempts with timestamps

#### Error Handling
- Return consistent error response format for all API errors
- Use appropriate HTTP status codes (400, 401, 403, 404, 500)
- Log errors with context but without sensitive data
- Never expose internal stack traces to clients
- Implement graceful degradation for external service failures

#### Code Quality
- Use TypeScript strict mode with no implicit any
- Write tests for all business logic and critical paths
- Implement proper error boundaries in React
- Use async/await consistently for asynchronous operations
- Follow established naming conventions throughout

#### Security
- Hash all passwords with bcrypt (minimum 12 rounds)
- Use HTTPS for all API communications
- Implement CORS with specific allowed origins
- Validate and sanitize all user inputs
- Use environment variables for all configuration secrets

### ASK FIRST

#### Dependencies
- Adding any new npm package to frontend or backend
- Upgrading major versions of existing dependencies
- Adding new database drivers or connection libraries
- Introducing new testing frameworks or tools

#### Architecture Changes
- Modifying the overall application architecture
- Changing the API design patterns (REST to GraphQL, etc.)
- Adding new layers or major refactoring of existing layers
- Implementing caching strategies
- Changing state management approach

#### Database Changes
- Modifying existing table schemas
- Adding or removing database tables
- Changing primary key strategies
- Modifying indexes or constraints
- Changing database connection configuration

#### Authentication/Authorization
- Changing authentication mechanisms
- Modifying JWT token structure or claims
- Adding new user roles or permissions
- Changing session management approach
- Implementing OAuth or third-party auth

#### API Changes
- Modifying existing API endpoint contracts
- Changing request/response formats
- Adding new API versions
- Removing existing endpoints
- Changing pagination or filtering strategies

### NEVER DO

#### Security Violations
- Never hardcode passwords, API keys, or secrets in code
- Never store passwords in plaintext or reversible encryption
- Never commit secrets or credentials to version control
- Never disable SSL certificate validation
- Never use eval() or similar dynamic code execution

#### Data Access Violations
- Never allow frontend to directly access database
- Never construct SQL queries with string concatenation
- Never return more data than necessary (no SELECT *)
- Never expose internal database IDs to clients
- Never allow users to access other users' data

#### Authentication Bypasses
- Never implement authentication bypasses for development
- Never store tokens in localStorage for production
- Never disable authentication on any endpoint
- Never accept tokens from untrusted sources
- Never implement weak password policies

#### Code Quality Issues
- Never use TypeScript any type without justification
- Never commit code with linting errors
- Never merge untested business logic
- Never ignore security vulnerabilities in dependencies
- Never implement features without proper error handling

---

## Code Style

### Naming Conventions
- **Files**: kebab-case for all files (user-profile.tsx, auth-service.ts)
- **Components**: PascalCase for React components (UserProfile, LoginForm)
- **Functions**: camelCase with descriptive verbs (getUserById, calculateBalance)
- **Variables**: camelCase, descriptive nouns (userBalance, transactionList)
- **Constants**: UPPER_SNAKE_CASE for constants (API_BASE_URL, MAX_RETRY_ATTEMPTS)
- **Types/Interfaces**: PascalCase with descriptive names (User, TransactionResponse)
- **Database Tables**: snake_case plural (users, transactions, accounts)
- **Database Columns**: snake_case (user_id, created_at, account_balance)

### File Organization
- **Maximum file length**: 300 lines for components, 200 lines for utilities
- **Maximum function length**: 50 lines, prefer 20-30 lines
- **Maximum component props**: 10 props, consider grouping related props
- **Import order**: External libraries → Internal modules → Relative imports
- **Export consistency**: Use named exports for utilities, default exports for components

### TypeScript Rules
- Enable strict mode and no implicit any
- Use interface for object shapes, type for unions/primitives
- Prefer explicit return types for public functions
- Use generic types where appropriate
- Avoid type assertions unless necessary

### Comment Standards
- Use JSDoc for public functions and complex logic
- Comment business rules and financial calculations
- Explain non-obvious algorithms or workarounds
- No TODO comments in production code
- Use comments to explain "why", not "what"

### Formatting Rules
- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas in multi-line structures
- Maximum line length: 100 characters
- Use prettier for consistent formatting

---

## Error Handling Standards

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/transactions",
  "method": "POST"
}
```

### HTTP Status Codes
- **200**: Successful GET, PUT, DELETE
- **201**: Successful POST (resource created)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (authorization failed)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (resource already exists)
- **422**: Unprocessable Entity (business logic validation)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error (unexpected errors)

### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### Error Codes
- **AUTH_REQUIRED**: Authentication token missing or invalid
- **AUTH_EXPIRED**: Authentication token has expired
- **FORBIDDEN**: User lacks permission for resource
- **VALIDATION_ERROR**: Request data validation failed
- **RESOURCE_NOT_FOUND**: Requested resource doesn't exist
- **DUPLICATE_RESOURCE**: Resource already exists
- **INSUFFICIENT_FUNDS**: Account has insufficient balance
- **RATE_LIMIT_EXCEEDED**: Too many requests
- **INTERNAL_ERROR**: Unexpected server error

### Logging Requirements
- Log all errors with request context (user ID, IP, endpoint)
- Use structured logging with consistent fields
- Log authentication failures with security context
- Never log passwords, tokens, or sensitive data
- Include correlation IDs for request tracing

### Sensitive Information Protection
- Never expose passwords in any response
- Never include database credentials in error messages
- Never return internal stack traces to clients
- Never log full request bodies with sensitive data
- Never expose JWT secrets or API keys

---

## Testing Requirements

### Unit Testing
- **Framework**: Vitest
- **Target**: Business logic, utilities, and pure functions
- **Pattern**: Arrange-Act-Assert (AAA)
- **Coverage**: Minimum 80% for business logic modules
- **Naming**: describe('functionName', () => { it('should do X', () => {}) })

### End-to-End Testing
- **Framework**: Playwright
- **Target**: Critical user journeys (login, transactions, reports)
- **Environments**: Staging environment with production-like data
- **Data**: Use deterministic test data with cleanup
- **Coverage**: All major user flows must have E2E tests

### Test Naming Conventions
- **Unit Tests**: `[function] should [expected behavior] when [condition]`
- **Integration Tests**: `[endpoint] should [response] when [request]`
- **E2E Tests**: `[user story] should [outcome] when [actions]`

### Critical Test Scenarios
- User registration and login flows
- Financial transaction creation and validation
- Account balance calculations
- Data access authorization
- Input validation and sanitization
- Error handling and recovery
- Password reset functionality
- Session management

### Mocking Strategy
- Mock external APIs and services
- Use test doubles for database operations in unit tests
- Mock time-dependent functions for consistent testing
- Use factory patterns for test data generation
- Avoid mocking business logic in integration tests

### Test Data Management
- Use seed files for consistent test data
- Clean up test data after each test
- Use transactions for database test isolation
- Generate realistic but fake financial data
- Never use production data in tests

---

## API Standards

### API Versioning
- Use URL path versioning: `/api/v1/transactions`
- Maintain backward compatibility for at least one version
- Document deprecation timeline for old versions
- Use semantic versioning for breaking changes

### URL Conventions
- **Base URL**: `/api/v1`
- **Resources**: Plural nouns: `/users`, `/transactions`, `/accounts`
- **Nested Resources**: `/users/{userId}/transactions`
- **Actions**: Use verbs for non-CRUD operations: `/api/v1/transactions/{id}/approve`
- **Query Parameters**: snake_case: `?user_id=123&status=active`

### REST Conventions
- **GET**: Retrieve resources (safe, idempotent)
- **POST**: Create new resources (not idempotent)
- **PUT**: Replace entire resource (idempotent)
- **PATCH**: Partial resource update (idempotent)
- **DELETE**: Remove resource (idempotent)

### Request Validation
- Validate all request bodies using schemas
- Validate query parameters and path parameters
- Return 400 for validation errors with field details
- Use consistent validation error format
- Sanitize all inputs before processing

### Response Format
```json
{
  "data": {
    // Response data
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  },
  "links": {
    "self": "/api/v1/transactions?page=1",
    "next": "/api/v1/transactions?page=2"
  }
}
```

### Error Format
Use the standardized error format defined in Error Handling Standards

### Pagination
- Use limit/offset or cursor-based pagination
- Include pagination metadata in responses
- Provide navigation links for large datasets
- Default limit: 20 items, maximum: 100 items
- Include total count when feasible

### Authentication
- Require JWT token for protected endpoints
- Use Authorization header: `Bearer {token}`
- Implement token refresh mechanism
- Return 401 for missing/invalid tokens
- Return 403 for insufficient permissions

### Authorization
- Check user ownership for user-specific resources
- Implement role-based access where applicable
- Use resource-based permissions for fine-grained control
- Log authorization decisions for audit
- Return 403 for unauthorized access attempts

### Rate Limiting
- Implement per-user rate limiting
- Use sliding window algorithm
- Return 429 with Retry-After header when exceeded
- Different limits for different endpoint types
- Log rate limit violations for monitoring

---

## Database Standards

### Naming Conventions
- **Tables**: snake_case plural (users, transactions, accounts)
- **Columns**: snake_case (user_id, created_at, account_balance)
- **Indexes**: idx_{table}_{column} (idx_users_email)
- **Foreign Keys**: fk_{table}_{column} (fk_transactions_user_id)
- **Primary Keys**: id for all tables (UUID or auto-increment)

### Migrations
- Use version-controlled migration files
- Include up and down migrations for each change
- Name migrations descriptively: `001_create_users_table.sql`
- Test migrations on copy of production data
- Never modify existing migration files after deployment

### Foreign Keys
- Define foreign key constraints for all relationships
- Use ON DELETE CASCADE for dependent data
- Use ON DELETE SET NULL for optional relationships
- Index foreign key columns for performance
- Document relationship rules in comments

### Indexes
- Create indexes on frequently queried columns
- Include composite indexes for common query patterns
- Index foreign key columns automatically
- Monitor index usage and remove unused indexes
- Consider covering indexes for critical queries

### Transactions
- Use transactions for multi-table operations
- Keep transactions short and focused
- Use appropriate isolation levels (READ COMMITTED default)
- Handle transaction rollbacks gracefully
- Log transaction boundaries for debugging

### Query Safety
- Always use parameterized queries or ORM
- Never construct SQL with string concatenation
- Validate input parameters before query execution
- Use prepared statements for repeated queries
- Implement query timeouts to prevent long-running queries

### Data Validation
- Implement database constraints (NOT NULL, UNIQUE, CHECK)
- Use appropriate data types and sizes
- Validate data at application layer before database
- Use triggers for complex validation rules
- Document all business constraints

### Schema Changes
- All schema changes require migration files
- Test migrations on staging before production
- Include rollback strategy for each change
- Document breaking changes and impact
- Communicate schema changes to frontend team

### Data Integrity
- Use foreign key constraints to maintain relationships
- Implement unique constraints for business rules
- Use check constraints for data validation
- Regular data consistency checks
- Backup strategy with point-in-time recovery

### Sensitive Data
- Encrypt sensitive columns at rest
- Never store passwords in plaintext
- Use separate tables for sensitive data
- Implement data retention policies
- Audit access to sensitive data

---

## Security Standards

### Secrets Management
- Store all secrets in environment variables
- Never commit secrets to version control
- Use different secrets for development, staging, and production
- Rotate secrets regularly (minimum quarterly)
- Audit secret access and usage

### Authentication

#### Password Handling
- Hash passwords with bcrypt (minimum 12 rounds)
- Enforce strong password policy (8+ chars, 1 letter, 1 number)
- Implement password history to prevent reuse
- Use pepper for additional password security
- Store only password hashes, never plaintext

#### Session/Token Handling
- Use JWT with RS256 signing for production
- Set short access token expiration (15 minutes)
- Use refresh tokens with longer expiration (7 days)
- Store tokens in HttpOnly, Secure cookies
- Implement token revocation on logout

#### Authentication Failures
- Return generic error messages for login failures
- Implement account lockout after failed attempts
- Log all authentication attempts with IP and user agent
- Use CAPTCHA for repeated failed attempts
- Notify users of suspicious login activity

### Authorization

#### Resource Ownership
- Verify user ownership before data access
- Use row-level security for multi-tenant data
- Implement resource-based permissions
- Check authorization at data access layer
- Audit authorization decisions

#### Server-Side Authorization
- Never trust client-side authorization checks
- Implement authorization in service layer
- Use middleware for common authorization patterns
- Cache authorization decisions for performance
- Log authorization failures

### Input Security

#### Injection Prevention
- Use parameterized queries for all database access
- Validate and sanitize all user inputs
- Use ORM with built-in injection protection
- Implement input length limits
- Escape output for XSS prevention

#### XSS Prevention
- Escape all user-generated content in HTML
- Use Content Security Policy headers
- Validate and sanitize file uploads
- Implement HTTP-only cookies for sensitive data
- Use modern frameworks with built-in XSS protection

#### CSRF Prevention
- Implement CSRF tokens for state-changing operations
- Use SameSite cookie attributes
- Verify origin headers for API requests
- Use double-submit cookie pattern
- Implement referrer checking

### Data Protection

#### Sensitive Data Handling
- Encrypt sensitive data at rest and in transit
- Use field-level encryption for highly sensitive data
- Implement data masking for logs and monitoring
- Regular data discovery and classification
- Follow data minimization principles

#### Personally Identifiable Information
- Collect only necessary PII
- Implement data retention policies
- Provide user data export and deletion
- Use pseudonymization where possible
- Comply with relevant privacy regulations

#### Passwords and Tokens
- Never log passwords or tokens
- Use secure token generation (cryptographically random)
- Implement secure password reset flows
- Use one-time tokens for email verification
- Invalidate tokens on password change

#### Logs and Monitoring
- Never log sensitive data in application logs
- Implement secure log storage and rotation
- Monitor for security events and anomalies
- Use structured logging for security analysis
- Implement alerting for security incidents

#### API Responses
- Filter sensitive data from API responses
- Use data transfer objects (DTOs) for response shaping
- Implement response caching with security headers
- Use compression with security considerations
- Validate response data before sending

### API Security

#### Authentication and Authorization
- Implement API key authentication for service-to-service
- Use OAuth 2.0 for third-party integrations
- Implement scope-based access control
- Use short-lived tokens for API access
- Implement token introspection where applicable

#### Input Validation
- Validate all API inputs against schemas
- Implement request size limits
- Use content-type validation
- Validate file uploads (type, size, content)
- Implement API rate limiting

#### Rate Limiting
- Implement per-IP and per-user rate limits
- Use token bucket algorithm for smooth limiting
- Implement different limits for different endpoints
- Return 429 status with Retry-After header
- Log rate limit violations

#### CORS and Headers
- Implement strict CORS policies
- Use security headers (HSTS, X-Frame-Options, etc.)
- Implement content-type validation
- Use secure cookie attributes
- Implement proper cache control headers

#### Abuse Prevention
- Implement request throttling
- Use CAPTCHA for abusive patterns
- Monitor for API abuse patterns
- Implement IP-based blocking for repeated abuse
- Use Web Application Firewall (WAF) where appropriate

---

## Git and Change Management

### Branch Naming
- **Feature branches**: `feature/description-of-feature`
- **Bugfix branches**: `bugfix/description-of-bug`
- **Hotfix branches**: `hotfix/description-of-hotfix`
- **Release branches**: `release/version-number`
- **Database migrations**: `migration/description-of-change`

### Commit Conventions
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Scope**: affected module or component
- **Description**: imperative mood, lowercase, no period
- **Body**: detailed explanation if needed
- **Footer**: breaking changes, issues, co-authors

Examples:
- `feat(auth): add JWT token refresh mechanism`
- `fix(api): handle null values in transaction response`
- `test(transactions): add unit tests for balance calculation`

### Pull Request Requirements
- All PRs must have descriptive title and description
- Include testing instructions in PR description
- Must pass all automated checks (tests, linting, security)
- Require at least one code review approval
- Include screenshots for UI changes
- Update documentation for API changes

### Code Review Standards
- Review for security vulnerabilities
- Check for proper error handling
- Verify test coverage for new code
- Ensure code follows project conventions
- Review performance implications
- Check for potential breaking changes

### Breaking Changes
- Clearly document breaking changes in PR
- Update API version for breaking changes
- Provide migration guide for database changes
- Communicate breaking changes to team
- Update relevant documentation

### Database Migrations
- Create migration files before code changes
- Test migrations on staging environment
- Include rollback strategy in migration
- Document migration impact and duration
- Coordinate database changes with deployments

### Feature Changes
- Update feature flags for gradual rollouts
- Monitor feature performance after deployment
- Document feature capabilities and limitations
- Include feature toggle in configuration
- Plan feature deprecation timeline

### Reverting Changes
- Use revert commits for undoing changes
- Revert database migrations if necessary
- Communicate revert reasons to team
- Update documentation after revert
- Learn from revert to prevent future issues

---

## Dependency Management

### Adding Dependencies
- Evaluate necessity before adding new packages
- Check for existing alternatives in project
- Review package security and maintenance status
- Prefer packages with TypeScript definitions
- Consider bundle size impact for frontend packages
- Document reason for adding each dependency

### Updating Dependencies
- Review changelog for breaking changes
- Test updates in staging environment
- Update one major version at a time
- Check for security vulnerabilities in updates
- Update related code if API changes
- Document any required code changes

### Removing Dependencies
- Identify unused dependencies regularly
- Remove dependencies that duplicate functionality
- Update code to use alternative solutions
- Test thoroughly after dependency removal
- Update documentation and examples
- Communicate removal to team members

### Evaluating Third-Party Libraries
- Check library popularity and community support
- Review security history and vulnerability reports
- Evaluate maintenance frequency and response time
- Check compatibility with project tech stack
- Review license terms and compliance
- Consider long-term maintenance implications

### Avoiding Unnecessary Dependencies
- Prefer native browser APIs when possible
- Use built-in Node.js modules instead of alternatives
- Implement simple functionality instead of adding libraries
- Choose lightweight alternatives for common tasks
- Regular dependency audits and cleanup
- Bundle size analysis for frontend dependencies

### Security Vulnerabilities
- Regular security scans of dependencies
- Immediate updates for critical vulnerabilities
- Evaluate risk vs. benefit for vulnerable packages
- Use dependency security monitoring tools
- Subscribe to security advisories for used packages
- Document security decisions and mitigations