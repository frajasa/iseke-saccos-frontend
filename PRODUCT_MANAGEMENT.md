# Product Management - Implementation Guide

## ✅ What's Been Completed

### 1. **GraphQL Operations Added**

All product CRUD operations have been added to `lib/graphql/queries.ts`:

#### Savings Products (6 operations)
- `GET_SAVINGS_PRODUCT` - Fetch single product details
- `GET_SAVINGS_PRODUCTS` - List all savings products ✅ (already in use)
- `CREATE_SAVINGS_PRODUCT` - Create new savings product
- `UPDATE_SAVINGS_PRODUCT` - Update savings product
- `DELETE_SAVINGS_PRODUCT` - Delete savings product

#### Loan Products (6 operations)
- `GET_LOAN_PRODUCT` - Fetch single product details
- `GET_LOAN_PRODUCTS` - List all loan products ✅ (already in use)
- `CREATE_LOAN_PRODUCT` - Create new loan product
- `UPDATE_LOAN_PRODUCT` - Update loan product
- `DELETE_LOAN_PRODUCT` - Delete loan product

### 2. **TypeScript Types Added**

Added to `lib/types.ts`:

```typescript
// Savings Product Types
export interface CreateSavingsProductInput {
  productCode: string;
  productName: string;
  productType: SavingsProductType;
  description: string;
  interestRate: number;
  interestCalculationMethod: string;
  interestPaymentFrequency: string;
  minimumBalance: number;
  maximumBalance?: number;
  minimumOpeningBalance: number;
  withdrawalLimit?: number;
  withdrawalFee?: number;
  monthlyFee?: number;
  taxWithholdingRate?: number;
  dormancyPeriodDays: number;
  allowsOverdraft: boolean;
}

export interface UpdateSavingsProductInput {
  productName?: string;
  description?: string;
  interestRate?: number;
  minimumBalance?: number;
  maximumBalance?: number;
  minimumOpeningBalance?: number;
  withdrawalLimit?: number;
  withdrawalFee?: number;
  monthlyFee?: number;
  status?: ProductStatus;
}

// Loan Product Types
export interface CreateLoanProductInput {
  productCode: string;
  productName: string;
  description: string;
  interestRate: number;
  interestMethod: InterestMethod;
  repaymentFrequency: string;
  minimumAmount: number;
  maximumAmount: number;
  minimumTermMonths: number;
  maximumTermMonths: number;
  processingFeeRate?: number;
  processingFeeFixed?: number;
  insuranceFeeRate?: number;
  latePaymentPenaltyRate?: number;
  gracePeriodDays: number;
  requiresGuarantors: boolean;
  minimumGuarantors: number;
  requiresCollateral: boolean;
  collateralPercentage?: number;
}

export interface UpdateLoanProductInput {
  productName?: string;
  description?: string;
  interestRate?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  minimumTermMonths?: number;
  maximumTermMonths?: number;
  processingFeeRate?: number;
  insuranceFeeRate?: number;
  latePaymentPenaltyRate?: number;
  status?: ProductStatus;
}
```

### 3. **Updated Listing Pages**

Both product listing pages now have:
- **"Add Product" button** in the header
- **"Manage" link** on each product card
- Ready to navigate to product management pages

**Updated Pages:**
- `/savings` - [app/savings/page.tsx](app/savings/page.tsx)
- `/loans` - [app/loans/page.tsx](app/loans/page.tsx)

---

## 📝 Pages To Create

To complete the product management system, create these pages:

### Savings Product Pages

1. **Create Savings Product** - `/savings/products/new`
   - Form with all fields from `CreateSavingsProductInput`
   - Product type selection (SAVINGS, FIXED_DEPOSIT, SHARES, etc.)
   - Interest calculation method
   - Validation for all required fields

2. **View Savings Product** - `/savings/products/[id]`
   - Display all product details
   - Show accounts using this product (count)
   - Edit and Delete buttons
   - Status badge

3. **Edit Savings Product** - `/savings/products/[id]/edit`
   - Pre-populated form
   - Cannot edit product code
   - Can change status (ACTIVE/INACTIVE)

### Loan Product Pages

1. **Create Loan Product** - `/loans/products/new`
   - Form with all fields from `CreateLoanProductInput`
   - Interest method selection (FLAT, DECLINING_BALANCE, REDUCING_BALANCE)
   - Repayment frequency
   - Guarantor/Collateral requirements
   - Fee configuration

2. **View Loan Product** - `/loans/products/[id]`
   - Display all product details
   - Show loans using this product (count)
   - Edit and Delete buttons
   - Requirements displayed prominently

3. **Edit Loan Product** - `/loans/products/[id]/edit`
   - Pre-populated form
   - Cannot edit product code
   - Can change status

---

## 🎯 Quick Implementation Guide

### Step 1: Create Savings Product Form

**Path**: `app/savings/products/new/page.tsx`

**Key Fields:**
- Product Code (unique identifier)
- Product Name
- Product Type (dropdown: SAVINGS, FIXED_DEPOSIT, SHARES, CHECKING, CURRENT)
- Description
- Interest Rate (%)
- Interest Calculation Method
- Interest Payment Frequency
- Minimum Balance
- Maximum Balance (optional)
- Minimum Opening Balance
- Withdrawal Limit (optional)
- Withdrawal Fee (optional)
- Monthly Fee (optional)
- Tax Withholding Rate (optional)
- Dormancy Period (days)
- Allows Overdraft (checkbox)

**Validation:**
- All required fields must be filled
- Interest rate must be >= 0
- Minimum balance must be >= 0
- Minimum opening balance must be >= minimum balance

### Step 2: Create Loan Product Form

**Path**: `app/loans/products/new/page.tsx`

**Key Fields:**
- Product Code (unique identifier)
- Product Name
- Description
- Interest Rate (%)
- Interest Method (dropdown: FLAT, DECLINING_BALANCE, REDUCING_BALANCE)
- Repayment Frequency (DAILY, WEEKLY, MONTHLY, etc.)
- Minimum Amount
- Maximum Amount
- Minimum Term (months)
- Maximum Term (months)
- Processing Fee Rate (%) (optional)
- Processing Fee Fixed (optional)
- Insurance Fee Rate (%) (optional)
- Late Payment Penalty Rate (%) (optional)
- Grace Period (days)
- Requires Guarantors (checkbox)
- Minimum Guarantors (if required)
- Requires Collateral (checkbox)
- Collateral Percentage (if required)

**Validation:**
- All required fields must be filled
- Min amount < Max amount
- Min term < Max term
- If requires guarantors, minimum guarantors must be > 0

---

## 📊 Usage Flow

### Current Flow (With Your Backend Connected):

```
1. View Products List
   /savings or /loans
   ↓
2. Click "Add Product"
   /savings/products/new or /loans/products/new
   ↓
3. Fill Form & Submit
   → CREATE_SAVINGS_PRODUCT or CREATE_LOAN_PRODUCT mutation
   ↓
4. View Product Details
   /savings/products/[id] or /loans/products/[id]
   ↓
5. Click "Edit" or "Delete"
   → UPDATE or DELETE mutation
```

---

## 🔧 Backend Integration

The GraphQL operations are ready and expect your backend to support:

### Savings Products Mutations
```graphql
mutation CreateSavingsProduct($input: CreateSavingsProductInput!) {
  createSavingsProduct(input: $input) {
    id
    productCode
    productName
    status
  }
}

mutation UpdateSavingsProduct($id: ID!, $input: UpdateSavingsProductInput!) {
  updateSavingsProduct(id: $id, input: $input) {
    id
    productCode
    productName
    status
  }
}

mutation DeleteSavingsProduct($id: ID!) {
  deleteSavingsProduct(id: $id)
}
```

### Loan Products Mutations
```graphql
mutation CreateLoanProduct($input: CreateLoanProductInput!) {
  createLoanProduct(input: $input) {
    id
    productCode
    productName
    status
  }
}

mutation UpdateLoanProduct($id: ID!, $input: UpdateLoanProductInput!) {
  updateLoanProduct(id: $id, input: $input) {
    id
    productCode
    productName
    status
  }
}

mutation DeleteLoanProduct($id: ID!) {
  deleteLoanProduct(id: $id)
}
```

---

## 🎨 UI Components to Reuse

You can copy patterns from existing pages:

1. **Form Layout** - Use the pattern from:
   - `app/branches/new/page.tsx`
   - `app/members/new/page.tsx`

2. **Detail View** - Use the pattern from:
   - `app/branches/[id]/page.tsx`
   - `app/members/[id]/page.tsx`

3. **Edit Form** - Use the pattern from:
   - `app/branches/[id]/edit/page.tsx`
   - `app/members/[id]/edit/page.tsx`

---

## ✅ What's Ready to Use Now

1. **View All Products**:
   - http://localhost:3001/savings (with "Add Product" button)
   - http://localhost:3001/loans (with "Add Product" button)

2. **GraphQL Operations**: All mutations ready in `lib/graphql/queries.ts`

3. **TypeScript Types**: All input types defined in `lib/types.ts`

4. **Product Cards**: Now have "Manage" links (will navigate to detail pages once created)

---

## 🚀 Next Steps

To complete product management:

1. Create the 6 remaining pages (3 for savings, 3 for loans)
2. Test with your backend GraphQL API
3. Add product statistics (how many accounts use each product)
4. Add product activation/deactivation workflow

---

## 📝 Notes

- Product codes should be unique identifiers (e.g., "SAV001", "LOAN001")
- Once a product is in use (has active accounts), some fields shouldn't be editable
- Consider adding product templates for quick setup
- Interest calculation methods affect how savings interest and loan payments are computed

---

**Status**: GraphQL operations and types are ready. UI pages need to be created to enable full CRUD functionality.

**Server**: Running on http://localhost:3001 ✅
