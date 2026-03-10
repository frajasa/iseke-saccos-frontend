import { gql } from "@apollo/client";

// Dashboard
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalMembers
      totalSavings
      activeLoans
      loanPortfolio
      overdueLoans
      pendingApplications
      recentTransactions {
        id
        memberName
        transactionType
        amount
        date
        status
      }
    }
  }
`;

// Auth Queries
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      forcePasswordChange
      user {
        id
        username
        firstName
        middleName
        lastName
        fullName
        email
        role
        passwordExpiresAt
        forcePasswordChange
        branch {
          id
          branchCode
          branchName
          address
          phoneNumber
          email
          managerName
          openingDate
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

// Member Queries
export const GET_MEMBER = gql`
  query GetMember($id: ID!) {
    member(id: $id) {
      id
      memberNumber
      firstName
      middleName
      lastName
      fullName
      dateOfBirth
      gender
      nationalId
      phoneNumber
      email
      address
      occupation
      employer
      monthlyIncome
      maritalStatus
      nextOfKinName
      nextOfKinPhone
      nextOfKinRelationship
      membershipDate
      status
      stage
      shares
      photoPath
      signaturePath
      fingerprintPath
      branch {
        id
        branchCode
        branchName
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MEMBERS = gql`
  query GetMembers($page: Int, $size: Int, $status: MemberStatus) {
    members(page: $page, size: $size, status: $status) {
      content {
        id
        memberNumber
        firstName
        middleName
        lastName
        phoneNumber
        email
        status
        membershipDate
        branch {
          id
          branchName
        }
      }
      totalElements
      totalPages
    }
  }
`;

export const SEARCH_MEMBERS = gql`
  query SearchMembers($searchTerm: String!, $page: Int, $size: Int) {
    searchMembers(searchTerm: $searchTerm, page: $page, size: $size) {
      totalElements
      totalPages
      content {
        id
        memberNumber
        firstName
        middleName
        lastName
        fullName
        dateOfBirth
        gender
        nationalId
        phoneNumber
        email
        address
        occupation
        employer
        monthlyIncome
        maritalStatus
        nextOfKinName
        nextOfKinPhone
        nextOfKinRelationship
        membershipDate
        status
        createdAt
        updatedAt
        branch {
          id
          branchCode
          branchName
          address
          phoneNumber
          email
          managerName
          openingDate
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const CREATE_MEMBER = gql`
  mutation CreateMember($input: CreateMemberInput!) {
    createMember(input: $input) {
      id
      memberNumber
      firstName
      lastName
      phoneNumber
      email
      status
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: ID!, $input: UpdateMemberInput!) {
    updateMember(id: $id, input: $input) {
      id
      memberNumber
      firstName
      lastName
      phoneNumber
      email
      status
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation DeactivateMember($id: ID!) {
    deactivateMember(id: $id) {
      id
      status
    }
  }
`;

// Savings Queries
export const GET_SAVINGS_PRODUCT = gql`
  query GetActiveSavingsProductById($id: ID!) {
    activeSavingsProductById(id: $id) {
      id
      productCode
      productName
      productType
      description
      interestRate
      interestCalculationMethod
      interestPaymentFrequency
      minimumBalance
      maximumBalance
      minimumOpeningBalance
      withdrawalLimit
      withdrawalFee
      monthlyFee
      taxWithholdingRate
      dormancyPeriodDays
      allowsOverdraft
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_SAVINGS_PRODUCTS = gql`
  query GetActiveSavingsProducts {
    activeSavingsProducts {
      id
      productCode
      productName
      productType
      description
      interestRate
      interestCalculationMethod
      interestPaymentFrequency
      minimumBalance
      maximumBalance
      minimumOpeningBalance
      withdrawalLimit
      withdrawalFee
      monthlyFee
      taxWithholdingRate
      dormancyPeriodDays
      allowsOverdraft
      status
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SAVINGS_PRODUCT = gql`
  mutation CreateSavingsProduct($input: CreateSavingsProductInput!) {
    createSavingsProduct(input: $input) {
      id
      productCode
      productName
      productType
      description
      interestRate
      interestCalculationMethod
      interestPaymentFrequency
      minimumBalance
      maximumBalance
      minimumOpeningBalance
      withdrawalLimit
      withdrawalFee
      monthlyFee
      taxWithholdingRate
      dormancyPeriodDays
      allowsOverdraft
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SAVINGS_PRODUCT = gql`
  mutation UpdateSavingsProduct($id: ID!, $input: UpdateSavingsProductInput!) {
    updateSavingsProduct(id: $id, input: $input) {
      id
      productCode
      productName
      productType
      description
      interestRate
      interestCalculationMethod
      interestPaymentFrequency
      minimumBalance
      maximumBalance
      minimumOpeningBalance
      withdrawalLimit
      withdrawalFee
      monthlyFee
      taxWithholdingRate
      dormancyPeriodDays
      allowsOverdraft
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SAVINGS_PRODUCT = gql`
  mutation DeactivateSavingsProduct($id: ID!) {
    deactivateProduct(id: $id)
  }
`;

export const GET_SAVINGS_ACCOUNT = gql`
  query GetSavingsAccount($id: ID!) {
    savingsAccount(id: $id) {
      id
      accountNumber
      member {
        id
        memberNumber
        firstName
        lastName
        phoneNumber
      }
      product {
        id
        productCode
        productName
        productType
        interestRate
      }
      branch {
        id
        branchName
      }
      openingDate
      balance
      availableBalance
      accruedInterest
      lastTransactionDate
      status
      beneficiaryName
      beneficiaryRelationship
    }
  }
`;

export const GET_MEMBER_SAVINGS_ACCOUNTS = gql`
  query GetMemberSavingsAccounts($memberId: ID!) {
    memberSavingsAccounts(memberId: $memberId) {
      id
      accountNumber
      product {
        id
        productName
      }
      balance
      status
      openingDate
    }
  }
`;

export const OPEN_SAVINGS_ACCOUNT = gql`
  mutation OpenSavingsAccount($input: CreateSavingsAccountInput!) {
    openSavingsAccount(input: $input) {
      id
      accountNumber
      balance
      status
    }
  }
`;

export const DEPOSIT = gql`
  mutation Deposit($input: DepositInput!) {
    deposit(input: $input) {
      id
      transactionNumber
      amount
      balanceAfter
      status
    }
  }
`;

export const WITHDRAW = gql`
  mutation Withdraw($input: WithdrawInput!) {
    withdraw(input: $input) {
      id
      transactionNumber
      amount
      balanceAfter
      status
    }
  }
`;

// Loan Queries
export const GET_LOAN_PRODUCT = gql`
  query GetLoanProduct($id: ID!) {
    loanProduct(id: $id) {
      id
      productCode
      productName
      description
      interestRate
      interestMethod
      repaymentFrequency
      minimumAmount
      maximumAmount
      minimumTermMonths
      maximumTermMonths
      processingFeeRate
      processingFeeFixed
      insuranceFeeRate
      latePaymentPenaltyRate
      gracePeriodDays
      requiresGuarantors
      minimumGuarantors
      requiresCollateral
      collateralPercentage
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_LOAN_PRODUCTS = gql`
  query GetLoanProducts {
    loanProducts {
      id
      productCode
      productName
      description
      interestRate
      interestMethod
      minimumAmount
      maximumAmount
      minimumTermMonths
      maximumTermMonths
      processingFeeRate
      insuranceFeeRate
      status
    }
  }
`;

export const CREATE_LOAN_PRODUCT = gql`
  mutation CreateLoanProduct($input: CreateLoanProductInput!) {
    createLoanProduct(input: $input) {
      id
      productCode
      productName
      status
    }
  }
`;

export const UPDATE_LOAN_PRODUCT = gql`
  mutation UpdateLoanProduct($id: ID!, $input: UpdateLoanProductInput!) {
    updateLoanProduct(id: $id, input: $input) {
      id
      productCode
      productName
      status
    }
  }
`;

export const DELETE_LOAN_PRODUCT = gql`
  mutation DeactivateLoanProduct($id: ID!) {
    deactivateProduct(id: $id)
  }
`;

export const GET_LOAN_ACCOUNTS = gql`
  query GetLoanAccounts($page: Int, $size: Int, $status: LoanStatus) {
    loanAccounts(page: $page, size: $size, status: $status) {
      content {
        id
        loanNumber
        member {
          id
          firstName
          lastName
          memberNumber
        }
        product {
          id
          productName
        }
        principalAmount
        outstandingPrincipal
        outstandingInterest
        outstandingFees
        outstandingPenalties
        status
        applicationDate
        disbursementDate
        daysInArrears
        branch {
          id
          branchName
        }
      }
      totalElements
      totalPages
    }
  }
`;

export const GET_LOAN_ACCOUNT = gql`
  query GetLoanAccount($id: ID!) {
    loanAccount(id: $id) {
      id
      loanNumber
      member {
        id
        memberNumber
        firstName
        lastName
        phoneNumber
      }
      product {
        id
        productCode
        productName
        interestRate
        interestMethod
      }
      branch {
        id
        branchName
      }
      applicationDate
      approvalDate
      disbursementDate
      principalAmount
      interestRate
      termMonths
      repaymentFrequency
      outstandingPrincipal
      outstandingInterest
      outstandingFees
      outstandingPenalties
      totalPaid
      nextPaymentDate
      maturityDate
      status
      loanOfficer
      purpose
      daysInArrears
      guarantors {
        id
        guarantorName
        guarantorPhone
        guarantorNationalId
        guaranteedAmount
        relationship
        status
      }
      collateral {
        id
        collateralType
        description
        estimatedValue
        registrationNumber
        location
        status
      }
    }
  }
`;

export const GET_MEMBER_LOAN_ACCOUNTS = gql`
  query GetMemberLoanAccounts($memberId: ID!) {
    memberLoanAccounts(memberId: $memberId) {
      id
      loanNumber
      product {
        id
        productName
      }
      principalAmount
      outstandingPrincipal
      outstandingInterest
      outstandingFees
      outstandingPenalties
      status
      applicationDate
      disbursementDate
      daysInArrears
    }
  }
`;

export const GET_LOAN_REPAYMENT_SCHEDULE = gql`
  query GetLoanRepaymentSchedule($loanId: ID!, $page: Int, $size: Int) {
    loanRepaymentSchedule(loanId: $loanId, page: $page, size: $size) {
      content {
        id
        installmentNumber
        dueDate
        principalDue
        interestDue
        totalDue
        principalPaid
        interestPaid
        feesPaid
        penaltiesPaid
        totalPaid
        paymentDate
        status
      }
      totalElements
      totalPages
    }
  }
`;

export const GET_LOAN_TRANSACTIONS = gql`
  query GetLoanTransactions($loanId: ID!) {
    loanTransactions(loanId: $loanId) {
      id
      transactionNumber
      transactionDate
      transactionType
      amount
      paymentMethod
      description
      status
      createdAt
    }
  }
`;

export const APPLY_FOR_LOAN = gql`
  mutation ApplyForLoan($input: LoanApplicationInput!) {
    applyForLoan(input: $input) {
      id
      loanNumber
      status
      applicationDate
    }
  }
`;

export const APPROVE_LOAN = gql`
  mutation ApproveLoan($id: ID!, $approvedAmount: Decimal) {
    approveLoan(id: $id, approvedAmount: $approvedAmount) {
      id
      loanNumber
      status
      approvalDate
    }
  }
`;

export const DISBURSE_LOAN = gql`
  mutation DisburseLoan($id: ID!, $disbursementDate: Date) {
    disburseLoan(id: $id, disbursementDate: $disbursementDate) {
      id
      loanNumber
      status
      disbursementDate
    }
  }
`;

export const REPAY_LOAN = gql`
  mutation RepayLoan($input: LoanRepaymentInput!) {
    repayLoan(input: $input) {
      id
      transactionNumber
      amount
      status
    }
  }
`;

export const ADD_GUARANTOR = gql`
  mutation AddGuarantor($input: AddGuarantorInput!) {
    addGuarantor(input: $input) {
      id
      guarantorName
      guaranteedAmount
      status
    }
  }
`;

export const ADD_COLLATERAL = gql`
  mutation AddCollateral($input: AddCollateralInput!) {
    addCollateral(input: $input) {
      id
      collateralType
      estimatedValue
      status
    }
  }
`;

// Transaction Queries
export const GET_MEMBER_TRANSACTIONS = gql`
  query GetMemberTransactions(
    $memberId: ID!
    $startDate: Date
    $endDate: Date
  ) {
    memberTransactions(
      memberId: $memberId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      transactionNumber
      transactionDate
      transactionTime
      transactionType
      amount
      balanceBefore
      balanceAfter
      description
      paymentMethod
      status
      processedBy
    }
  }
`;

export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions(
    $accountId: ID!
    $startDate: Date
    $endDate: Date
  ) {
    accountTransactions(
      accountId: $accountId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      transactionNumber
      transactionDate
      transactionTime
      transactionType
      amount
      balanceBefore
      balanceAfter
      description
      referenceNumber
      paymentMethod
      status
      processedBy
      createdAt
    }
  }
`;

// Branch Queries
export const GET_BRANCH = gql`
  query GetBranch($id: ID!) {
    branch(id: $id) {
      id
      branchCode
      branchName
      address
      phoneNumber
      email
      managerName
      openingDate
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_BRANCHES = gql`
  query GetBranches($status: BranchStatus) {
    branches(status: $status) {
      id
      branchCode
      branchName
      address
      phoneNumber
      email
      managerName
      openingDate
      status
    }
  }
`;

export const CREATE_BRANCH = gql`
  mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(input: $input) {
      id
      branchCode
      branchName
      status
    }
  }
`;

export const UPDATE_BRANCH = gql`
  mutation UpdateBranch($id: ID!, $input: UpdateBranchInput!) {
    updateBranch(id: $id, input: $input) {
      id
      branchCode
      branchName
      status
    }
  }
`;

// Note: Backend has no deleteBranch mutation. Use updateBranch to deactivate instead.
export const DELETE_BRANCH = gql`
  mutation DeactivateBranch($id: ID!, $input: UpdateBranchInput!) {
    updateBranch(id: $id, input: $input) {
      id
      status
    }
  }
`;

// Accounting Queries
export const GET_CHART_OF_ACCOUNTS = gql`
  query GetChartOfAccounts {
    chartOfAccounts {
      id
      accountCode
      accountName
      accountType
      accountCategory
      parentAccount {
        id
        accountCode
        accountName
      }
      level
      isControlAccount
      normalBalance
      balance
      debitBalance
      creditBalance
      status
    }
  }
`;

export const GET_GENERAL_LEDGER = gql`
  query GetGeneralLedger($accountId: ID!, $startDate: Date!, $endDate: Date!) {
    generalLedger(
      accountId: $accountId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      postingDate
      account {
        id
        accountCode
        accountName
        accountType
      }
      debitAmount
      creditAmount
      balance
      description
      reference
      branch {
        id
        branchName
      }
      postedBy
      createdAt
    }
  }
`;

export const GET_TRIAL_BALANCE = gql`
  query GetTrialBalance($date: Date!) {
    trialBalance(date: $date) {
      date
      entries {
        account {
          id
          accountCode
          accountName
          accountType
          accountCategory
        }
        debitBalance
        creditBalance
      }
      totalDebits
      totalCredits
    }
  }
`;

export const GET_FINANCIAL_STATEMENTS = gql`
  query GetFinancialStatements($date: Date!, $branchId: ID) {
    financialStatements(date: $date, branchId: $branchId) {
      date
      balanceSheet {
        assets
        liabilities
        equity
        details {
          category
          amount
          accounts {
            accountName
            amount
          }
        }
      }
      incomeStatement {
        revenue
        expenses
        netIncome
        details {
          category
          amount
          accounts {
            accountName
            amount
          }
        }
      }
    }
  }
`;

export const GET_PORTFOLIO_SUMMARY = gql`
  query GetPortfolioSummary($branchId: ID, $startDate: Date!, $endDate: Date!) {
    portfolioSummary(
      branchId: $branchId
      startDate: $startDate
      endDate: $endDate
    ) {
      totalLoans
      totalDisbursed
      totalOutstanding
      totalPaid
      activeLoans
      delinquentLoans
      averageLoanSize
      portfolioAtRisk
    }
  }
`;

export const GET_DELINQUENCY_REPORT = gql`
  query GetDelinquencyReport($branchId: ID, $date: Date!) {
    delinquencyReport(branchId: $branchId, date: $date) {
      date
      ranges {
        range
        numberOfLoans
        outstandingAmount
        percentage
      }
      totalOutstanding
      totalAtRisk
    }
  }
`;

// ===== SACCOS Compliance - New Queries & Mutations =====

// Audit Logs (Gap 7)
export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($entityType: String, $entityId: ID, $userId: ID, $startDate: DateTime, $endDate: DateTime, $page: Int, $size: Int) {
    auditLogs(entityType: $entityType, entityId: $entityId, userId: $userId, startDate: $startDate, endDate: $endDate, page: $page, size: $size) {
      content {
        id
        user {
          id
          username
          fullName
        }
        action
        entityType
        entityId
        oldValue
        newValue
        ipAddress
        timestamp
      }
      totalElements
      totalPages
    }
  }
`;

// Transaction Reversal (Gap 2)
export const REVERSE_TRANSACTION = gql`
  mutation ReverseTransaction($transactionId: ID!, $reason: String!) {
    reverseTransaction(transactionId: $transactionId, reason: $reason) {
      id
      transactionNumber
      amount
      status
      reversalOfId
      reversalReason
    }
  }
`;

// Manual Journal Entry (Gap 3)
export const POST_JOURNAL_ENTRY = gql`
  mutation PostJournalEntry($input: JournalEntryInput!) {
    postJournalEntry(input: $input) {
      success
      reference
      entriesPosted
      postingDate
    }
  }
`;

// Cash Flow Statement (Gap 4)
export const GET_CASH_FLOW_STATEMENT = gql`
  query GetCashFlowStatement($startDate: Date!, $endDate: Date!, $branchId: ID) {
    cashFlowStatement(startDate: $startDate, endDate: $endDate, branchId: $branchId) {
      date
      operatingActivities {
        name
        items {
          description
          amount
        }
        total
      }
      investingActivities {
        name
        items {
          description
          amount
        }
        total
      }
      financingActivities {
        name
        items {
          description
          amount
        }
        total
      }
      netCashFlow
    }
  }
`;

// Loan Provision Report (Gap 5)
export const GET_LOAN_PROVISION_REPORT = gql`
  query GetLoanProvisionReport($date: Date, $branchId: ID) {
    loanProvisionReport(date: $date, branchId: $branchId) {
      date
      classifications {
        classification
        count
        outstandingAmount
        provisionRate
        provisionAmount
      }
      totalOutstanding
      totalProvision
    }
  }
`;

// Member Statement (Gap 6)
export const GET_MEMBER_STATEMENT = gql`
  query GetMemberStatement($memberId: ID!, $accountId: ID, $startDate: Date!, $endDate: Date!) {
    memberStatement(memberId: $memberId, accountId: $accountId, startDate: $startDate, endDate: $endDate) {
      member {
        id
        memberNumber
        firstName
        lastName
        fullName
      }
      account {
        id
        accountNumber
        product {
          productName
        }
      }
      transactions {
        id
        transactionNumber
        transactionDate
        transactionType
        amount
        balanceBefore
        balanceAfter
        description
        status
      }
      openingBalance
      closingBalance
      period
    }
  }
`;

// Daily Transaction Summary (Gap 6)
export const GET_DAILY_TRANSACTION_SUMMARY = gql`
  query GetDailyTransactionSummary($date: Date!, $branchId: ID) {
    dailyTransactionSummary(date: $date, branchId: $branchId) {
      date
      deposits
      withdrawals
      loanDisbursements
      loanRepayments
      totalCount
    }
  }
`;

// End-of-Day Processing (Gap 10)
export const RUN_END_OF_DAY = gql`
  mutation RunEndOfDay {
    runEndOfDay
  }
`;

// Interest Accrual (Gap 1)
export const RUN_INTEREST_ACCRUAL = gql`
  mutation RunInterestAccrual {
    runInterestAccrual
  }
`;

// Loan Provisioning (Gap 5)
export const RUN_LOAN_PROVISIONING = gql`
  mutation RunLoanProvisioning {
    runLoanProvisioning
  }
`;

// ==========================================
// Payment Integration Queries & Mutations
// ==========================================

export const GET_PAYMENT_REQUEST = gql`
  query GetPaymentRequest($id: ID!) {
    paymentRequest(id: $id) {
      id
      requestNumber
      provider
      direction
      status
      amount
      currency
      phoneNumber
      bankAccountNumber
      member {
        id
        firstName
        lastName
        memberNumber
      }
      purpose
      providerReference
      providerResponseCode
      providerResponseMessage
      failureReason
      initiatedBy
      initiatedAt
      sentAt
      callbackAt
      completedAt
      expiresAt
    }
  }
`;

export const GET_PAYMENT_REQUESTS = gql`
  query GetPaymentRequests($provider: PaymentProvider, $status: PaymentRequestStatus, $page: Int, $size: Int) {
    paymentRequests(provider: $provider, status: $status, page: $page, size: $size) {
      content {
        id
        requestNumber
        provider
        direction
        status
        amount
        currency
        phoneNumber
        member {
          id
          firstName
          lastName
          memberNumber
        }
        purpose
        providerReference
        failureReason
        initiatedBy
        initiatedAt
        completedAt
      }
      totalElements
      totalPages
    }
  }
`;

export const GET_MEMBER_PAYMENT_REQUESTS = gql`
  query GetMemberPaymentRequests($memberId: ID!, $page: Int, $size: Int) {
    memberPaymentRequests(memberId: $memberId, page: $page, size: $size) {
      content {
        id
        requestNumber
        provider
        direction
        status
        amount
        purpose
        initiatedAt
        completedAt
      }
      totalElements
      totalPages
    }
  }
`;

export const GET_AVAILABLE_PAYMENT_PROVIDERS = gql`
  query GetAvailablePaymentProviders {
    availablePaymentProviders
  }
`;

export const GET_PAYMENT_DASHBOARD = gql`
  query GetPaymentDashboard {
    paymentDashboard {
      totalPaymentsToday
      completedPayments
      failedPayments
      pendingPayments
      totalAmountToday
      totalCollections
      totalDisbursements
      mpesaCount
      tigopesaCount
      nmbCount
    }
  }
`;

export const INITIATE_MOBILE_DEPOSIT = gql`
  mutation InitiateMobileDeposit($input: MobileDepositInput!) {
    initiateMobileDeposit(input: $input) {
      id
      requestNumber
      provider
      status
      amount
      phoneNumber
      providerResponseMessage
    }
  }
`;

export const INITIATE_MOBILE_LOAN_REPAYMENT = gql`
  mutation InitiateMobileLoanRepayment($input: MobileLoanRepaymentInput!) {
    initiateMobileLoanRepayment(input: $input) {
      id
      requestNumber
      provider
      status
      amount
      phoneNumber
      providerResponseMessage
    }
  }
`;

export const INITIATE_MOBILE_DISBURSEMENT = gql`
  mutation InitiateMobileDisbursement($input: MobileDisbursementInput!) {
    initiateMobileDisbursement(input: $input) {
      id
      requestNumber
      provider
      status
      amount
      phoneNumber
      providerResponseMessage
    }
  }
`;

export const CHECK_PAYMENT_STATUS = gql`
  mutation CheckPaymentStatus($paymentRequestId: ID!) {
    checkPaymentStatus(paymentRequestId: $paymentRequestId) {
      id
      requestNumber
      status
      providerReference
      providerResponseMessage
      completedAt
    }
  }
`;

export const CANCEL_PAYMENT_REQUEST = gql`
  mutation CancelPaymentRequest($paymentRequestId: ID!) {
    cancelPaymentRequest(paymentRequestId: $paymentRequestId) {
      id
      requestNumber
      status
    }
  }
`;

// ==========================================
// ESS (Employee Self-Service) Queries & Mutations
// ==========================================

export const GET_ESS_DASHBOARD = gql`
  query GetEssDashboard {
    essDashboard {
      memberName
      memberNumber
      employerName
      totalSavings
      totalLoanOutstanding
      activeLoans
      activeSavingsAccounts
      monthlyDeductions
      shares
      shareValue
      maxLoanByShares
      recentRequests {
        id
        requestNumber
        requestType
        status
        amount
        createdAt
      }
    }
  }
`;

export const GET_ESS_PAYROLL_DEDUCTIONS = gql`
  query GetEssPayrollDeductions {
    essPayrollDeductions {
      id
      deductionType
      amount
      isActive
      description
      savingsAccount {
        id
        accountNumber
      }
      loanAccount {
        id
        loanNumber
      }
      employer {
        id
        employerName
      }
    }
  }
`;

export const GET_ESS_SERVICE_REQUESTS = gql`
  query GetEssServiceRequests {
    essServiceRequests {
      id
      requestNumber
      requestType
      status
      amount
      description
      reviewNotes
      reviewedAt
      createdAt
    }
  }
`;

export const ESS_APPLY_FOR_LOAN = gql`
  mutation EssApplyForLoan($amount: Decimal!, $termMonths: Int!, $purpose: String, $productId: ID) {
    essApplyForLoan(amount: $amount, termMonths: $termMonths, purpose: $purpose, productId: $productId) {
      id
      requestNumber
      requestType
      status
      amount
    }
  }
`;

export const ESS_REQUEST_WITHDRAWAL = gql`
  mutation EssRequestWithdrawal($accountId: ID!, $amount: Decimal!, $reason: String) {
    essRequestWithdrawal(accountId: $accountId, amount: $amount, reason: $reason) {
      id
      requestNumber
      requestType
      status
      amount
    }
  }
`;

export const GET_EMPLOYERS = gql`
  query GetEmployers {
    employers {
      id
      employerCode
      employerName
      contactPerson
      phoneNumber
      email
      isActive
    }
  }
`;

export const CREATE_EMPLOYER = gql`
  mutation CreateEmployer(
    $employerCode: String!
    $employerName: String!
    $contactPerson: String
    $phoneNumber: String
    $email: String
    $address: String
    $tinNumber: String
    $payrollCutoffDay: Int
  ) {
    createEmployer(
      employerCode: $employerCode
      employerName: $employerName
      contactPerson: $contactPerson
      phoneNumber: $phoneNumber
      email: $email
      address: $address
      tinNumber: $tinNumber
      payrollCutoffDay: $payrollCutoffDay
    ) {
      id
      employerCode
      employerName
    }
  }
`;

export const PROCESS_PAYROLL_BATCH = gql`
  mutation ProcessPayrollBatch($employerId: ID!, $period: String!) {
    processPayrollBatch(employerId: $employerId, period: $period) {
      id
      batchNumber
      period
      totalDeductions
      successfulDeductions
      failedDeductions
      totalAmount
      status
    }
  }
`;

export const SETUP_PAYROLL_DEDUCTION = gql`
  mutation SetupPayrollDeduction(
    $memberId: ID!
    $employerId: ID!
    $deductionType: String!
    $savingsAccountId: ID
    $loanAccountId: ID
    $amount: Decimal!
    $description: String
  ) {
    setupPayrollDeduction(
      memberId: $memberId
      employerId: $employerId
      deductionType: $deductionType
      savingsAccountId: $savingsAccountId
      loanAccountId: $loanAccountId
      amount: $amount
      description: $description
    ) {
      id
      deductionType
      amount
      isActive
    }
  }
`;

export const REVIEW_ESS_REQUEST = gql`
  mutation ReviewEssRequest($requestId: ID!, $status: String!, $reviewNotes: String) {
    reviewEssRequest(requestId: $requestId, status: $status, reviewNotes: $reviewNotes) {
      id
      requestNumber
      status
      reviewNotes
      reviewedAt
    }
  }
`;

export const GET_ESS_SAVINGS_ACCOUNTS = gql`
  query GetEssSavingsAccounts {
    essSavingsAccounts {
      id
      accountNumber
      balance
      availableBalance
      accruedInterest
      status
      openingDate
      lastTransactionDate
      product {
        id
        productName
        productType
        interestRate
      }
      branch {
        id
        branchName
      }
    }
  }
`;

export const GET_ESS_LOAN_ACCOUNTS = gql`
  query GetEssLoanAccounts {
    essLoanAccounts {
      id
      loanNumber
      principalAmount
      outstandingPrincipal
      outstandingInterest
      outstandingFees
      outstandingPenalties
      totalPaid
      interestRate
      termMonths
      repaymentFrequency
      applicationDate
      approvalDate
      disbursementDate
      nextPaymentDate
      maturityDate
      status
      daysInArrears
      purpose
      product {
        id
        productName
      }
      branch {
        id
        branchName
      }
    }
  }
`;

export const GET_ESS_PROFILE = gql`
  query GetEssProfile {
    essProfile {
      id
      memberNumber
      firstName
      middleName
      lastName
      dateOfBirth
      gender
      nationalId
      phoneNumber
      email
      address
      membershipDate
      status
      shares
      branch {
        id
        branchName
      }
      employerEntity {
        id
        employerName
      }
      employeeNumber
      department
    }
  }
`;

export const GET_ESS_ACCOUNT_TRANSACTIONS = gql`
  query GetEssAccountTransactions($accountId: ID!, $limit: Int) {
    essAccountTransactions(accountId: $accountId, limit: $limit) {
      id
      transactionNumber
      transactionDate
      transactionType
      amount
      balanceBefore
      balanceAfter
      description
      referenceNumber
      paymentMethod
      status
      createdAt
    }
  }
`;

export const GET_ESS_LOAN_REPAYMENT_SCHEDULE = gql`
  query GetEssLoanRepaymentSchedule($loanId: ID!, $page: Int, $size: Int) {
    essLoanRepaymentSchedule(loanId: $loanId, page: $page, size: $size) {
      content {
        id
        installmentNumber
        dueDate
        principalDue
        interestDue
        totalDue
        totalPaid
        status
        paymentDate
      }
      totalElements
      totalPages
    }
  }
`;

export const GET_ESS_LOAN_PRODUCTS = gql`
  query GetEssLoanProducts {
    essLoanProducts {
      id
      productCode
      productName
      description
      interestRate
      interestMethod
      repaymentFrequency
      minimumAmount
      maximumAmount
      minimumTermMonths
      maximumTermMonths
      processingFeeRate
      processingFeeFixed
      requiresGuarantors
      minimumGuarantors
      requiresCollateral
    }
  }
`;

// ==========================================
// Missing Queries & Mutations
// ==========================================

export const GET_MEMBER_BY_NUMBER = gql`
  query GetMemberByNumber($memberNumber: String!) {
    memberByNumber(memberNumber: $memberNumber) {
      id
      memberNumber
      firstName
      middleName
      lastName
      fullName
      phoneNumber
      email
      status
    }
  }
`;

export const GET_SAVINGS_ACCOUNT_BY_NUMBER = gql`
  query GetSavingsAccountByNumber($accountNumber: String!) {
    savingsAccountByNumber(accountNumber: $accountNumber) {
      id
      accountNumber
      balance
      availableBalance
      status
      member {
        id
        firstName
        lastName
        memberNumber
      }
      product {
        id
        productName
      }
    }
  }
`;

export const GET_LOAN_ACCOUNT_BY_NUMBER = gql`
  query GetLoanAccountByNumber($loanNumber: String!) {
    loanAccountByNumber(loanNumber: $loanNumber) {
      id
      loanNumber
      principalAmount
      outstandingPrincipal
      status
      member {
        id
        firstName
        lastName
        memberNumber
      }
      product {
        id
        productName
      }
    }
  }
`;

export const CLOSE_SAVINGS_ACCOUNT = gql`
  mutation CloseSavingsAccount($id: ID!) {
    closeSavingsAccount(id: $id) {
      id
      accountNumber
      status
    }
  }
`;

export const ACTIVATE_MEMBER = gql`
  mutation ActivateMember($id: ID!) {
    activateMember(id: $id) {
      id
      memberNumber
      status
    }
  }
`;

export const REGISTER_PROSPECT = gql`
  mutation RegisterProspect($input: CreateMemberInput!) {
    registerProspect(input: $input) {
      id
      memberNumber
      firstName
      lastName
      status
    }
  }
`;

export const SUBMIT_APPLICATION = gql`
  mutation SubmitApplication($memberId: ID!) {
    submitApplication(memberId: $memberId) {
      id
      memberNumber
      status
    }
  }
`;

export const APPROVE_MEMBERSHIP = gql`
  mutation ApproveMembership($memberId: ID!) {
    approveMembership(memberId: $memberId) {
      id
      memberNumber
      status
    }
  }
`;

export const UPDATE_MEMBER_PHOTO = gql`
  mutation UpdateMemberPhoto($memberId: ID!, $photoPath: String!) {
    updateMemberPhoto(memberId: $memberId, photoPath: $photoPath) {
      id
      photoPath
    }
  }
`;

export const UPDATE_MEMBER_SIGNATURE = gql`
  mutation UpdateMemberSignature($memberId: ID!, $signaturePath: String!) {
    updateMemberSignature(memberId: $memberId, signaturePath: $signaturePath) {
      id
      signaturePath
    }
  }
`;

export const UPDATE_MEMBER_FINGERPRINT = gql`
  mutation UpdateMemberFingerprint($memberId: ID!, $fingerprintPath: String!) {
    updateMemberFingerprint(memberId: $memberId, fingerprintPath: $fingerprintPath) {
      id
      fingerprintPath
    }
  }
`;

export const INTER_BRANCH_TRANSFER = gql`
  mutation InterBranchTransfer($fromAccountId: ID!, $toAccountId: ID!, $amount: Decimal!, $description: String) {
    interBranchTransfer(fromAccountId: $fromAccountId, toAccountId: $toAccountId, amount: $amount, description: $description) {
      id
      transactionNumber
      amount
      status
    }
  }
`;

// ===== SACCOS Business Rules =====

export const CHECK_LOAN_ELIGIBILITY = gql`
  query CheckLoanEligibility($memberId: ID!, $amount: Decimal!, $termMonths: Int!, $productId: ID!) {
    loanEligibility(memberId: $memberId, amount: $amount, termMonths: $termMonths, productId: $productId) {
      eligible
      maxLoanAmount
      shareValue
      maxByShares
      monthlySalary
      currentMonthlyDeductions
      availableMonthlyCapacity
      proposedMonthlyRepayment
      reasons
    }
  }
`;

export const CHECK_ESS_LOAN_ELIGIBILITY = gql`
  query CheckEssLoanEligibility($amount: Decimal!, $termMonths: Int!, $productId: ID!) {
    essLoanEligibility(amount: $amount, termMonths: $termMonths, productId: $productId) {
      eligible
      maxLoanAmount
      shareValue
      maxByShares
      monthlySalary
      currentMonthlyDeductions
      availableMonthlyCapacity
      proposedMonthlyRepayment
      reasons
    }
  }
`;

export const PURCHASE_SHARES = gql`
  mutation PurchaseShares($memberId: ID!, $quantity: Int!) {
    purchaseShares(memberId: $memberId, quantity: $quantity) {
      id
      memberNumber
      shares
    }
  }
`;

export const SELL_SHARES = gql`
  mutation SellShares($memberId: ID!, $quantity: Int!) {
    sellShares(memberId: $memberId, quantity: $quantity) {
      id
      memberNumber
      shares
    }
  }
`;

export const ESS_PURCHASE_SHARES = gql`
  mutation EssPurchaseShares($quantity: Int!) {
    essPurchaseShares(quantity: $quantity) {
      id
      memberNumber
      shares
    }
  }
`;

export const GET_SACCOS_SETTINGS = gql`
  query GetSaccosSettings {
    saccosSettings {
      id
      settingKey
      settingValue
      description
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SACCOS_SETTING = gql`
  mutation UpdateSaccosSetting($key: String!, $value: String!, $description: String) {
    updateSaccosSetting(key: $key, value: $value, description: $description) {
      id
      settingKey
      settingValue
      description
    }
  }
`;

export const GET_ATTACHMENTS = gql`
  query GetAttachments($entityType: String!, $entityId: ID!) {
    attachments(entityType: $entityType, entityId: $entityId) {
      id
      entityType
      entityId
      documentType
      fileName
      filePath
      fileSize
      mimeType
      uploadedBy
      createdAt
    }
  }
`;

export const ADD_ATTACHMENT = gql`
  mutation AddAttachment($entityType: String!, $entityId: ID!, $documentType: String!, $filePath: String!, $fileName: String) {
    addAttachment(entityType: $entityType, entityId: $entityId, documentType: $documentType, filePath: $filePath, fileName: $fileName) {
      id
      entityType
      entityId
      documentType
      fileName
      filePath
    }
  }
`;

export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($id: ID!) {
    deleteAttachment(id: $id)
  }
`;

// SRS Compliance: Write-off Loan
export const WRITE_OFF_LOAN = gql`
  mutation WriteOffLoan($loanId: ID!, $reason: String!) {
    writeOffLoan(loanId: $loanId, reason: $reason) {
      id
      loanNumber
      status
      writeOffReason
      writeOffDate
      writtenOffBy
      outstandingPrincipal
    }
  }
`;

// SRS Compliance: Refinance Loan
export const REFINANCE_LOAN = gql`
  mutation RefinanceLoan($loanId: ID!, $newTermMonths: Int!, $newInterestRate: Decimal!, $reason: String!) {
    refinanceLoan(loanId: $loanId, newTermMonths: $newTermMonths, newInterestRate: $newInterestRate, reason: $reason) {
      id
      loanNumber
      status
      interestRate
      termMonths
      outstandingPrincipal
    }
  }
`;

// SRS Compliance: Inter-Account Transfer
export const TRANSFER_BETWEEN_ACCOUNTS = gql`
  mutation TransferBetweenAccounts($fromAccountId: ID!, $toAccountId: ID!, $amount: Decimal!, $description: String) {
    transferBetweenAccounts(fromAccountId: $fromAccountId, toAccountId: $toAccountId, amount: $amount, description: $description) {
      id
      transactionNumber
      transactionDate
      amount
      description
      status
    }
  }
`;

// SRS Compliance: Duplicate Member Check
export const CHECK_DUPLICATE_MEMBERS = gql`
  query CheckDuplicateMembers($firstName: String!, $lastName: String!, $dateOfBirth: Date!, $phoneNumber: String) {
    checkDuplicateMembers(firstName: $firstName, lastName: $lastName, dateOfBirth: $dateOfBirth, phoneNumber: $phoneNumber) {
      id
      memberNumber
      firstName
      middleName
      lastName
      dateOfBirth
      phoneNumber
      nationalId
      status
    }
  }
`;

// SRS Compliance: Accounting Periods
export const GET_ACCOUNTING_PERIODS = gql`
  query GetAccountingPeriods {
    accountingPeriods {
      id
      periodName
      startDate
      endDate
      isClosed
      closedBy
      closedAt
      createdAt
    }
  }
`;

export const CREATE_ACCOUNTING_PERIOD = gql`
  mutation CreateAccountingPeriod($periodName: String!, $startDate: Date!, $endDate: Date!) {
    createAccountingPeriod(periodName: $periodName, startDate: $startDate, endDate: $endDate) {
      id
      periodName
      startDate
      endDate
      isClosed
    }
  }
`;

export const CLOSE_ACCOUNTING_PERIOD = gql`
  mutation CloseAccountingPeriod($id: ID!) {
    closeAccountingPeriod(id: $id) {
      id
      periodName
      isClosed
      closedBy
      closedAt
    }
  }
`;

export const REOPEN_ACCOUNTING_PERIOD = gql`
  mutation ReopenAccountingPeriod($id: ID!) {
    reopenAccountingPeriod(id: $id) {
      id
      periodName
      isClosed
    }
  }
`;

// SRS Compliance: Loan Officer Performance
export const GET_LOAN_OFFICER_PERFORMANCE = gql`
  query GetLoanOfficerPerformance($startDate: Date!, $endDate: Date!) {
    loanOfficerPerformance(startDate: $startDate, endDate: $endDate) {
      loanOfficer
      totalLoans
      activeLoans
      delinquentLoans
      totalDisbursed
      totalOutstanding
      portfolioAtRisk
      parPercentage
    }
  }
`;
