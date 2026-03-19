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
        permissions
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
      tinNumber
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
      tinNumber
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
      tinNumber
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
      withdrawalAmountLimit
      withdrawalAmountLimitMonthly
      excessWithdrawalFee
      prematureWithdrawalPenaltyRate
      prematureWithdrawalInterestReduction
      maturityAction
      postMaturityInterestRate
      termDays
      autoRenewAtCurrentRate
      interestRateGroup
      baseRateSpread
      useBaseRate
      hasSteppedRates
      taxExemptProduct
      overdraftLimit
      overdraftFeeFlat
      overdraftInterestRate
      accountSubType
      groupInsuranceFeeRate
      groupInsuranceFeeFlat
      interestCalcMethod
      interestPayFrequency
      userDefinedPaymentDays
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
      interestCalcMethod
      interestPayFrequency
      accountSubType
      hasSteppedRates
      useBaseRate
      taxExemptProduct
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
      status
      createdAt
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
      status
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
      scheduleType
      balloonPaymentPercentage
      allowsFreeSchedule
      capitalizeInterest
      hasSteppedRates
      allowsVariableRate
      allowsDeferment
      maxDefermentMonths
      allowsPenaltySuspension
      allowsAdvanceRecalculation
      supportsGroupLending
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
        allowsDeferment
        allowsPenaltySuspension
        allowsVariableRate
        allowsAdvanceRecalculation
        scheduleType
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
      effectiveInterestRate
      rateEffectiveDate
      penaltySuspended
      penaltySuspendedUntil
      defermentEndDate
      deferredInstallments
      firstPaymentDate
      paymentDayOfMonth
      scheduleType
      groupLoanType
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

export const GET_ALL_SERVICE_REQUESTS = gql`
  query GetAllServiceRequests($status: String, $page: Int, $size: Int) {
    allServiceRequests(status: $status, page: $page, size: $size) {
      content {
        id
        requestNumber
        member {
          id
          memberNumber
          firstName
          lastName
          fullName
          phoneNumber
        }
        requestType
        status
        amount
        description
        reviewNotes
        reviewedAt
        createdAt
      }
      totalElements
      totalPages
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

// ===== Multi-Currency =====

export const GET_CURRENCIES = gql`
  query GetCurrencies {
    currencies {
      id
      currencyCode
      currencyName
      symbol
      decimalPlaces
      isBaseCurrency
      isActive
    }
  }
`;

export const GET_EXCHANGE_RATES = gql`
  query GetExchangeRates($fromCurrency: String!, $toCurrency: String!) {
    exchangeRates(fromCurrency: $fromCurrency, toCurrency: $toCurrency) {
      id
      fromCurrencyCode
      toCurrencyCode
      rate
      effectiveDate
      expiryDate
      source
      createdAt
    }
  }
`;

export const CONVERT_CURRENCY = gql`
  query ConvertCurrency($amount: Decimal!, $fromCurrency: String!, $toCurrency: String!, $date: Date) {
    convertCurrency(amount: $amount, fromCurrency: $fromCurrency, toCurrency: $toCurrency, date: $date)
  }
`;

export const CREATE_CURRENCY = gql`
  mutation CreateCurrency($currencyCode: String!, $currencyName: String!, $symbol: String, $decimalPlaces: Int) {
    createCurrency(currencyCode: $currencyCode, currencyName: $currencyName, symbol: $symbol, decimalPlaces: $decimalPlaces) {
      id
      currencyCode
      currencyName
      symbol
      isActive
    }
  }
`;

export const UPDATE_CURRENCY = gql`
  mutation UpdateCurrency($id: ID!, $currencyName: String, $symbol: String, $isActive: Boolean) {
    updateCurrency(id: $id, currencyName: $currencyName, symbol: $symbol, isActive: $isActive) {
      id
      currencyCode
      currencyName
      symbol
      isActive
    }
  }
`;

export const SET_EXCHANGE_RATE = gql`
  mutation SetExchangeRate($fromCurrency: String!, $toCurrency: String!, $rate: Decimal!, $effectiveDate: Date, $expiryDate: Date, $source: String) {
    setExchangeRate(fromCurrency: $fromCurrency, toCurrency: $toCurrency, rate: $rate, effectiveDate: $effectiveDate, expiryDate: $expiryDate, source: $source) {
      id
      fromCurrencyCode
      toCurrencyCode
      rate
      effectiveDate
    }
  }
`;

// ===== Transaction Limits =====

export const GET_TRANSACTION_LIMITS = gql`
  query GetTransactionLimits {
    transactionLimits {
      id
      role
      transactionType
      dailyLimit
      singleTransactionLimit
      monthlyLimit
      requiresApprovalAbove
      isActive
    }
  }
`;

export const SET_TRANSACTION_LIMIT = gql`
  mutation SetTransactionLimit($role: String!, $transactionType: String!, $dailyLimit: Decimal, $singleTransactionLimit: Decimal, $monthlyLimit: Decimal, $requiresApprovalAbove: Decimal) {
    setTransactionLimit(role: $role, transactionType: $transactionType, dailyLimit: $dailyLimit, singleTransactionLimit: $singleTransactionLimit, monthlyLimit: $monthlyLimit, requiresApprovalAbove: $requiresApprovalAbove) {
      id
      role
      transactionType
      dailyLimit
      singleTransactionLimit
      monthlyLimit
      requiresApprovalAbove
    }
  }
`;

export const DELETE_TRANSACTION_LIMIT = gql`
  mutation DeleteTransactionLimit($id: ID!) {
    deleteTransactionLimit(id: $id)
  }
`;

// ===== Session Restrictions =====

export const GET_SESSION_RESTRICTIONS = gql`
  query GetSessionRestrictions {
    sessionRestrictions {
      id
      role
      maxConcurrentSessions
      allowedLoginStart
      allowedLoginEnd
      allowedDays
      sessionTimeoutMinutes
      isActive
    }
  }
`;

export const UPDATE_SESSION_RESTRICTION = gql`
  mutation UpdateSessionRestriction($id: ID!, $maxConcurrentSessions: Int, $allowedLoginStart: String, $allowedLoginEnd: String, $allowedDays: String, $sessionTimeoutMinutes: Int) {
    updateSessionRestriction(id: $id, maxConcurrentSessions: $maxConcurrentSessions, allowedLoginStart: $allowedLoginStart, allowedLoginEnd: $allowedLoginEnd, allowedDays: $allowedDays, sessionTimeoutMinutes: $sessionTimeoutMinutes) {
      id
      role
      maxConcurrentSessions
      allowedLoginStart
      allowedLoginEnd
      allowedDays
      sessionTimeoutMinutes
    }
  }
`;

export const TERMINATE_USER_SESSIONS = gql`
  mutation TerminateUserSessions($userId: ID!) {
    terminateUserSessions(userId: $userId)
  }
`;

// ===== Batch Import =====

export const GET_BATCH_IMPORTS = gql`
  query GetBatchImports {
    batchImports {
      id
      batchNumber
      fileName
      importType
      totalRecords
      successfulRecords
      failedRecords
      totalAmount
      status
      uploadedBy
      processedBy
      uploadedAt
      processedAt
    }
  }
`;

export const GET_BATCH_IMPORT = gql`
  query GetBatchImport($id: ID!) {
    batchImport(id: $id) {
      id
      batchNumber
      fileName
      importType
      totalRecords
      successfulRecords
      failedRecords
      totalAmount
      status
      errorDetails
      uploadedBy
      processedBy
      uploadedAt
      processedAt
    }
  }
`;

export const GET_BATCH_IMPORT_ITEMS = gql`
  query GetBatchImportItems($batchId: ID!) {
    batchImportItems(batchId: $batchId) {
      id
      rowNumber
      accountNumber
      memberNumber
      amount
      transactionType
      paymentMethod
      referenceNumber
      description
      status
      errorMessage
      transactionId
    }
  }
`;

export const CREATE_BATCH_IMPORT = gql`
  mutation CreateBatchImport($fileName: String!, $importType: String!, $rows: [JSON!]!) {
    createBatchImport(fileName: $fileName, importType: $importType, rows: $rows) {
      id
      batchNumber
      totalRecords
      status
    }
  }
`;

export const PROCESS_BATCH_IMPORT = gql`
  mutation ProcessBatchImport($batchId: ID!) {
    processBatchImport(batchId: $batchId) {
      id
      batchNumber
      successfulRecords
      failedRecords
      status
      processedAt
    }
  }
`;

// ===== Passbook / Receipt Printing =====

export const GET_TRANSACTION_RECEIPT = gql`
  query GetTransactionReceipt($transactionId: String!) {
    transactionReceipt(transactionId: $transactionId)
  }
`;

export const GET_PASSBOOK_ENTRIES = gql`
  query GetPassbookEntries($accountId: ID!, $startDate: Date, $endDate: Date) {
    passbookEntries(accountId: $accountId, startDate: $startDate, endDate: $endDate)
  }
`;

export const GET_LOAN_STATEMENT = gql`
  query GetLoanStatement($loanId: ID!) {
    loanStatement(loanId: $loanId)
  }
`;

// ===== Roles & Permissions =====

export const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      displayName
      description
      isSystemRole
      isActive
      permissions {
        id
        name
        displayName
        module
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVE_ROLES = gql`
  query GetActiveRoles {
    activeRoles {
      id
      name
      displayName
      description
      isSystemRole
      isActive
      permissions {
        id
        name
        displayName
        module
      }
    }
  }
`;

export const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions {
      id
      name
      displayName
      description
      module
    }
  }
`;

export const GET_PERMISSION_MODULES = gql`
  query GetPermissionModules {
    permissionModules
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!, $displayName: String!, $description: String) {
    createRole(name: $name, displayName: $displayName, description: $description) {
      id
      name
      displayName
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $displayName: String, $description: String, $isActive: Boolean) {
    updateRole(id: $id, displayName: $displayName, description: $description, isActive: $isActive) {
      id
      name
      displayName
      isActive
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

export const ASSIGN_PERMISSIONS = gql`
  mutation AssignPermissions($roleId: ID!, $permissionIds: [ID!]!) {
    assignPermissions(roleId: $roleId, permissionIds: $permissionIds) {
      id
      name
      displayName
      permissions {
        id
        name
        displayName
        module
      }
    }
  }
`;

// ===== Savings Enhancement Queries =====

export const GET_INTEREST_RATE_TIERS = gql`
  query GetInterestRateTiers($productId: ID!) {
    interestRateTiers(productId: $productId) {
      id
      fromAmount
      toAmount
      interestRate
      bonusRate
      minimumDaysAtBalance
      sortOrder
      createdAt
    }
  }
`;

export const CREATE_INTEREST_RATE_TIER = gql`
  mutation CreateInterestRateTier($productId: ID!, $fromAmount: Decimal!, $toAmount: Decimal!, $interestRate: Decimal!, $bonusRate: Decimal, $minimumDaysAtBalance: Int, $sortOrder: Int) {
    createInterestRateTier(productId: $productId, fromAmount: $fromAmount, toAmount: $toAmount, interestRate: $interestRate, bonusRate: $bonusRate, minimumDaysAtBalance: $minimumDaysAtBalance, sortOrder: $sortOrder) {
      id
      fromAmount
      toAmount
      interestRate
      bonusRate
      minimumDaysAtBalance
      sortOrder
    }
  }
`;

export const UPDATE_INTEREST_RATE_TIER = gql`
  mutation UpdateInterestRateTier($id: ID!, $fromAmount: Decimal, $toAmount: Decimal, $interestRate: Decimal, $bonusRate: Decimal, $minimumDaysAtBalance: Int, $sortOrder: Int) {
    updateInterestRateTier(id: $id, fromAmount: $fromAmount, toAmount: $toAmount, interestRate: $interestRate, bonusRate: $bonusRate, minimumDaysAtBalance: $minimumDaysAtBalance, sortOrder: $sortOrder) {
      id
      fromAmount
      toAmount
      interestRate
      bonusRate
      minimumDaysAtBalance
      sortOrder
    }
  }
`;

export const DELETE_INTEREST_RATE_TIER = gql`
  mutation DeleteInterestRateTier($id: ID!) {
    deleteInterestRateTier(id: $id)
  }
`;

export const GET_INTEREST_RATE_GROUPS = gql`
  query GetInterestRateGroups {
    interestRateGroups {
      id
      groupName
      description
      baseRate
      effectiveDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_INTEREST_RATE_GROUP = gql`
  query GetInterestRateGroup($id: ID!) {
    interestRateGroup(id: $id) {
      id
      groupName
      description
      baseRate
      effectiveDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_INTEREST_RATE_GROUP = gql`
  mutation CreateInterestRateGroup($groupName: String!, $description: String, $baseRate: Decimal!, $effectiveDate: Date!) {
    createInterestRateGroup(groupName: $groupName, description: $description, baseRate: $baseRate, effectiveDate: $effectiveDate) {
      id
      groupName
      baseRate
      effectiveDate
      isActive
    }
  }
`;

export const UPDATE_INTEREST_RATE_GROUP_RATE = gql`
  mutation UpdateInterestRateGroupRate($id: ID!, $newRate: Decimal!, $effectiveDate: Date!, $retroactiveFromDate: Date) {
    updateInterestRateGroupRate(id: $id, newRate: $newRate, effectiveDate: $effectiveDate, retroactiveFromDate: $retroactiveFromDate) {
      id
      groupName
      baseRate
      effectiveDate
    }
  }
`;

export const GET_INTEREST_RATE_CHANGE_LOGS = gql`
  query GetInterestRateChangeLogs($productId: ID) {
    interestRateChangeLogs(productId: $productId) {
      id
      savingsProduct {
        id
        productName
      }
      interestRateGroup {
        id
        groupName
      }
      oldRate
      newRate
      effectiveDate
      retroactiveFromDate
      retroactiveCorrectionAmount
      accountsAffected
      processedAt
      processedBy
      createdAt
    }
  }
`;

export const CHANGE_PRODUCT_INTEREST_RATE = gql`
  mutation ChangeProductInterestRate($productId: ID!, $newRate: Decimal!, $effectiveDate: Date!, $retroactiveFromDate: Date) {
    changeProductInterestRate(productId: $productId, newRate: $newRate, effectiveDate: $effectiveDate, retroactiveFromDate: $retroactiveFromDate) {
      id
      oldRate
      newRate
      effectiveDate
      retroactiveFromDate
      accountsAffected
    }
  }
`;

export const RUN_RETROACTIVE_INTEREST_CORRECTION = gql`
  mutation RunRetroactiveInterestCorrection($changeLogId: ID!) {
    runRetroactiveInterestCorrection(changeLogId: $changeLogId) {
      id
      retroactiveCorrectionAmount
      accountsAffected
      processedAt
    }
  }
`;

// Group Savings
export const GET_GROUP_SAVINGS_ACCOUNTS = gql`
  query GetGroupSavingsAccounts {
    groupSavingsAccounts {
      id
      accountNumber
      groupName
      description
      product {
        id
        productName
      }
      branch {
        id
        branchName
      }
      accountType
      balance
      accruedInterest
      insuranceFeeBalance
      status
      openingDate
      members {
        id
        member {
          id
          fullName
          memberNumber
        }
        sharePercentage
        isActive
        joinDate
      }
      createdAt
    }
  }
`;

export const GET_GROUP_SAVINGS_ACCOUNT = gql`
  query GetGroupSavingsAccount($id: ID!) {
    groupSavingsAccount(id: $id) {
      id
      accountNumber
      groupName
      description
      product {
        id
        productName
        productCode
      }
      branch {
        id
        branchName
      }
      accountType
      balance
      accruedInterest
      insuranceFeeBalance
      status
      openingDate
      members {
        id
        member {
          id
          fullName
          memberNumber
        }
        sharePercentage
        isActive
        joinDate
      }
      createdAt
    }
  }
`;

export const CREATE_GROUP_SAVINGS_ACCOUNT = gql`
  mutation CreateGroupSavingsAccount($groupName: String!, $productId: ID!, $branchId: ID, $accountType: GroupAccountType!, $description: String) {
    createGroupSavingsAccount(groupName: $groupName, productId: $productId, branchId: $branchId, accountType: $accountType, description: $description) {
      id
      accountNumber
      groupName
      accountType
      status
    }
  }
`;

export const ADD_MEMBER_TO_GROUP = gql`
  mutation AddMemberToGroup($groupId: ID!, $memberId: ID!, $sharePercentage: Decimal) {
    addMemberToGroup(groupId: $groupId, memberId: $memberId, sharePercentage: $sharePercentage) {
      id
      member {
        id
        fullName
      }
      sharePercentage
      isActive
    }
  }
`;

export const REMOVE_MEMBER_FROM_GROUP = gql`
  mutation RemoveMemberFromGroup($groupId: ID!, $memberId: ID!) {
    removeMemberFromGroup(groupId: $groupId, memberId: $memberId)
  }
`;

export const DEPOSIT_TO_GROUP_ACCOUNT = gql`
  mutation DepositToGroupAccount($groupId: ID!, $amount: Decimal!, $paymentMethod: PaymentMethod!) {
    depositToGroupAccount(groupId: $groupId, amount: $amount, paymentMethod: $paymentMethod) {
      id
      transactionNumber
      amount
      status
    }
  }
`;

export const WITHDRAW_FROM_GROUP_ACCOUNT = gql`
  mutation WithdrawFromGroupAccount($groupId: ID!, $amount: Decimal!, $paymentMethod: PaymentMethod!) {
    withdrawFromGroupAccount(groupId: $groupId, amount: $amount, paymentMethod: $paymentMethod) {
      id
      transactionNumber
      amount
      status
    }
  }
`;

export const CALCULATE_GROUP_INSURANCE_FEES = gql`
  mutation CalculateGroupInsuranceFees {
    calculateGroupInsuranceFees
  }
`;

// Check Register
export const GET_CHECK_REGISTER = gql`
  query GetCheckRegister($accountId: ID!) {
    checkRegister(accountId: $accountId) {
      id
      checkNumber
      issuedDate
      amount
      payee
      status
      clearedDate
      stopDate
      stopReason
      createdBy
      createdAt
    }
  }
`;

export const GET_STOPPED_CHECKS = gql`
  query GetStoppedChecks($accountId: ID!) {
    stoppedChecks(accountId: $accountId) {
      id
      checkNumber
      issuedDate
      amount
      payee
      status
      stopDate
      stopReason
    }
  }
`;

export const ISSUE_CHECK = gql`
  mutation IssueCheck($accountId: ID!, $checkNumber: String!, $amount: Decimal, $payee: String) {
    issueCheck(accountId: $accountId, checkNumber: $checkNumber, amount: $amount, payee: $payee) {
      id
      checkNumber
      issuedDate
      amount
      payee
      status
    }
  }
`;

export const CLEAR_CHECK = gql`
  mutation ClearCheck($checkId: ID!) {
    clearCheck(checkId: $checkId) {
      id
      checkNumber
      status
      clearedDate
    }
  }
`;

export const STOP_CHECK = gql`
  mutation StopCheck($checkId: ID!, $reason: String!) {
    stopCheck(checkId: $checkId, reason: $reason) {
      id
      checkNumber
      status
      stopDate
      stopReason
    }
  }
`;

export const VOID_CHECK = gql`
  mutation VoidCheck($checkId: ID!) {
    voidCheck(checkId: $checkId) {
      id
      checkNumber
      status
    }
  }
`;

// Term Deposits
export const GET_TERM_DEPOSIT_MATURITY_REPORT = gql`
  query GetTermDepositMaturityReport($fromDate: Date!, $toDate: Date!) {
    termDepositMaturityReport(fromDate: $fromDate, toDate: $toDate) {
      id
      accountNumber
      member {
        id
        fullName
        memberNumber
      }
      product {
        id
        productName
      }
      termDepositAmount
      maturityAmount
      maturityDate
      maturityAction
      matured
      rolloverCount
      effectiveInterestRate
      status
    }
  }
`;

export const PROCESS_TERM_DEPOSIT_MATURITY = gql`
  mutation ProcessTermDepositMaturity {
    processTermDepositMaturity
  }
`;

export const PREMATURE_WITHDRAW_TERM_DEPOSIT = gql`
  mutation PrematureWithdrawTermDeposit($accountId: ID!, $reason: String!) {
    prematureWithdrawTermDeposit(accountId: $accountId, reason: $reason) {
      id
      transactionNumber
      amount
      status
    }
  }
`;

export const ROLLOVER_TERM_DEPOSIT = gql`
  mutation RolloverTermDeposit($accountId: ID!, $newRate: Decimal) {
    rolloverTermDeposit(accountId: $accountId, newRate: $newRate) {
      id
      accountNumber
      maturityDate
      rolloverCount
      effectiveInterestRate
    }
  }
`;

// Enhanced Dividends
export const GET_DIVIDEND_ALLOCATIONS = gql`
  query GetDividendAllocations($dividendRunId: ID!) {
    dividendAllocations(dividendRunId: $dividendRunId) {
      id
      member {
        id
        fullName
        memberNumber
      }
      savingsAccount {
        id
        accountNumber
      }
      interestPoints
      allocationAmount
      taxAmount
      netAmount
      posted
      createdAt
    }
  }
`;

export const CALCULATE_ENHANCED_DIVIDENDS = gql`
  mutation CalculateEnhancedDividends($year: Int!, $method: String!, $rateOrProfit: Decimal!, $distributionMethod: String!) {
    calculateEnhancedDividends(year: $year, method: $method, rateOrProfit: $rateOrProfit, distributionMethod: $distributionMethod) {
      id
      year
      method
      rate
      totalAmount
      membersPaid
      distributionMethod
      profitFigure
      totalInterestPoints
      status
    }
  }
`;

// ===== Lending Enhancement Queries =====

export const GET_LOAN_GROUPS = gql`
  query GetLoanGroups {
    loanGroups {
      id
      groupNumber
      groupName
      description
      groupLoanType
      maxGroupLoanAmount
      jointLiability
      formationDate
      isActive
      members {
        id
        member { id firstName lastName memberNumber }
        liabilityShare
        roleInGroup
        joinDate
        isActive
      }
    }
  }
`;

export const GET_ACTIVE_LOAN_GROUPS = gql`
  query GetActiveLoanGroups {
    activeLoanGroups {
      id
      groupNumber
      groupName
      groupLoanType
      maxGroupLoanAmount
      jointLiability
      isActive
    }
  }
`;

export const GET_LOAN_GROUP = gql`
  query GetLoanGroup($id: ID!) {
    loanGroup(id: $id) {
      id
      groupNumber
      groupName
      description
      groupLoanType
      maxGroupLoanAmount
      jointLiability
      formationDate
      isActive
      members {
        id
        member { id firstName lastName memberNumber phoneNumber }
        liabilityShare
        roleInGroup
        joinDate
        isActive
      }
    }
  }
`;

export const CREATE_LOAN_GROUP = gql`
  mutation CreateLoanGroup($groupName: String!, $description: String, $groupLoanType: String!, $branchId: ID, $maxGroupLoanAmount: Decimal, $jointLiability: Boolean) {
    createLoanGroup(groupName: $groupName, description: $description, groupLoanType: $groupLoanType, branchId: $branchId, maxGroupLoanAmount: $maxGroupLoanAmount, jointLiability: $jointLiability) {
      id groupNumber groupName groupLoanType isActive
    }
  }
`;

export const UPDATE_LOAN_GROUP = gql`
  mutation UpdateLoanGroup($id: ID!, $groupName: String, $description: String, $maxGroupLoanAmount: Decimal, $jointLiability: Boolean, $isActive: Boolean) {
    updateLoanGroup(id: $id, groupName: $groupName, description: $description, maxGroupLoanAmount: $maxGroupLoanAmount, jointLiability: $jointLiability, isActive: $isActive) {
      id groupNumber groupName isActive
    }
  }
`;

export const ADD_LOAN_GROUP_MEMBER = gql`
  mutation AddLoanGroupMember($groupId: ID!, $memberId: ID!, $liabilityShare: Decimal, $roleInGroup: String) {
    addLoanGroupMember(groupId: $groupId, memberId: $memberId, liabilityShare: $liabilityShare, roleInGroup: $roleInGroup) {
      id member { id firstName lastName memberNumber } liabilityShare roleInGroup joinDate isActive
    }
  }
`;

export const REMOVE_LOAN_GROUP_MEMBER = gql`
  mutation RemoveLoanGroupMember($groupId: ID!, $memberId: ID!) {
    removeLoanGroupMember(groupId: $groupId, memberId: $memberId)
  }
`;

export const GET_LOAN_FEE_CONFIGS = gql`
  query GetLoanFeeConfigs($productId: ID!) {
    loanFeeConfigs(productId: $productId) {
      id feeName feeType rate fixedAmount minAmount maxAmount isRefundable chargeOn isActive
      product { id productName }
      member { id firstName lastName }
    }
  }
`;

export const CREATE_LOAN_FEE_CONFIG = gql`
  mutation CreateLoanFeeConfig($feeName: String!, $feeType: String!, $productId: ID, $memberId: ID, $rate: Decimal, $fixedAmount: Decimal, $minAmount: Decimal, $maxAmount: Decimal, $isRefundable: Boolean, $chargeOn: String, $incomeAccountId: ID) {
    createLoanFeeConfig(feeName: $feeName, feeType: $feeType, productId: $productId, memberId: $memberId, rate: $rate, fixedAmount: $fixedAmount, minAmount: $minAmount, maxAmount: $maxAmount, isRefundable: $isRefundable, chargeOn: $chargeOn, incomeAccountId: $incomeAccountId) {
      id feeName feeType rate fixedAmount chargeOn isActive
    }
  }
`;

export const UPDATE_LOAN_FEE_CONFIG = gql`
  mutation UpdateLoanFeeConfig($id: ID!, $feeName: String, $rate: Decimal, $fixedAmount: Decimal, $minAmount: Decimal, $maxAmount: Decimal, $isRefundable: Boolean, $chargeOn: String, $isActive: Boolean) {
    updateLoanFeeConfig(id: $id, feeName: $feeName, rate: $rate, fixedAmount: $fixedAmount, minAmount: $minAmount, maxAmount: $maxAmount, isRefundable: $isRefundable, chargeOn: $chargeOn, isActive: $isActive) {
      id feeName feeType rate fixedAmount chargeOn isActive
    }
  }
`;

export const DELETE_LOAN_FEE_CONFIG = gql`
  mutation DeleteLoanFeeConfig($id: ID!) {
    deleteLoanFeeConfig(id: $id)
  }
`;

export const CALCULATE_LOAN_FEES = gql`
  query CalculateLoanFees($productId: ID!, $memberId: ID!, $loanAmount: Decimal!, $chargeOn: String) {
    calculateLoanFees(productId: $productId, memberId: $memberId, loanAmount: $loanAmount, chargeOn: $chargeOn)
  }
`;

export const GET_LOAN_DEFERMENTS = gql`
  query GetLoanDeferments($loanId: ID!) {
    loanDeferments(loanId: $loanId) {
      id defermentType startDate endDate installmentsDeferred reason approvedBy createdAt
    }
  }
`;

export const DEFER_LOAN_PAYMENT = gql`
  mutation DeferLoanPayment($loanId: ID!, $installmentsToDefer: Int!, $reason: String!) {
    deferLoanPayment(loanId: $loanId, installmentsToDefer: $installmentsToDefer, reason: $reason) {
      id defermentType startDate endDate installmentsDeferred reason
    }
  }
`;

export const SUSPEND_PENALTY = gql`
  mutation SuspendPenalty($loanId: ID!, $suspendUntil: Date!, $reason: String!) {
    suspendPenalty(loanId: $loanId, suspendUntil: $suspendUntil, reason: $reason) {
      id loanNumber penaltySuspended penaltySuspendedUntil
    }
  }
`;

export const RESUME_PENALTY = gql`
  mutation ResumePenalty($loanId: ID!) {
    resumePenalty(loanId: $loanId) {
      id loanNumber penaltySuspended
    }
  }
`;

export const PREVIEW_LOAN_SCHEDULE = gql`
  query PreviewLoanSchedule($productId: ID!, $principal: Decimal!, $termMonths: Int!, $interestRateOverride: Decimal, $frequencyOverride: String, $firstPaymentDate: Date, $paymentDayOfMonth: Int, $scheduleTypeOverride: String, $balloonPercentageOverride: Decimal) {
    previewLoanSchedule(productId: $productId, principal: $principal, termMonths: $termMonths, interestRateOverride: $interestRateOverride, frequencyOverride: $frequencyOverride, firstPaymentDate: $firstPaymentDate, paymentDayOfMonth: $paymentDayOfMonth, scheduleTypeOverride: $scheduleTypeOverride, balloonPercentageOverride: $balloonPercentageOverride)
  }
`;

export const CHANGE_LOAN_INTEREST_RATE = gql`
  mutation ChangeLoanInterestRate($loanId: ID!, $newRate: Decimal!) {
    changeLoanInterestRate(loanId: $loanId, newRate: $newRate) {
      id loanNumber interestRate effectiveInterestRate rateEffectiveDate
    }
  }
`;

export const CHANGE_PRODUCT_LOAN_RATE = gql`
  mutation ChangeProductLoanRate($productId: ID!, $newRate: Decimal!) {
    changeProductLoanRate(productId: $productId, newRate: $newRate)
  }
`;

export const RECALCULATE_LOAN_SCHEDULE = gql`
  mutation RecalculateLoanSchedule($loanId: ID!) {
    recalculateLoanSchedule(loanId: $loanId)
  }
`;

// ===== Cashier/Teller Sessions =====

export const GET_ACTIVE_SESSION = gql`
  query GetActiveSession($userId: ID!) {
    activeSession(userId: $userId) {
      id user { id username fullName } branch { id branchName }
      openingBalance closingBalance cashInTotal cashOutTotal
      expectedBalance actualBalance discrepancy
      status openedAt closedAt reconciledAt reconciledBy notes
    }
  }
`;

export const GET_CASHIER_SESSION = gql`
  query GetCashierSession($id: ID!) {
    cashierSession(id: $id) {
      id user { id username fullName } branch { id branchName }
      openingBalance closingBalance cashInTotal cashOutTotal
      expectedBalance actualBalance discrepancy
      status openedAt closedAt reconciledAt reconciledBy notes
    }
  }
`;

export const GET_OPEN_SESSIONS_BY_BRANCH = gql`
  query GetOpenSessionsByBranch($branchId: ID!) {
    openSessionsByBranch(branchId: $branchId) {
      id user { id username fullName } branch { id branchName }
      openingBalance cashInTotal cashOutTotal status openedAt
    }
  }
`;

export const GET_SESSION_HISTORY = gql`
  query GetSessionHistory($userId: ID!, $page: Int, $size: Int) {
    sessionHistory(userId: $userId, page: $page, size: $size) {
      content {
        id user { id username fullName } branch { id branchName }
        openingBalance closingBalance cashInTotal cashOutTotal
        expectedBalance actualBalance discrepancy
        status openedAt closedAt reconciledAt
      }
      totalElements totalPages
    }
  }
`;

export const GET_DRAWER_TRANSACTIONS = gql`
  query GetDrawerTransactions($sessionId: ID!) {
    drawerTransactions(sessionId: $sessionId) {
      id cashDirection amount runningBalance currencyCode description createdAt
      transaction { id transactionNumber }
    }
  }
`;

export const OPEN_CASHIER_SESSION = gql`
  mutation OpenCashierSession($userId: ID!, $branchId: ID!, $openingBalance: Decimal) {
    openCashierSession(userId: $userId, branchId: $branchId, openingBalance: $openingBalance) {
      id status openingBalance openedAt
      user { id username fullName } branch { id branchName }
    }
  }
`;

export const CLOSE_CASHIER_SESSION = gql`
  mutation CloseCashierSession($sessionId: ID!) {
    closeCashierSession(sessionId: $sessionId) {
      id status closingBalance expectedBalance closedAt
      cashInTotal cashOutTotal
    }
  }
`;

export const RECONCILE_CASHIER_SESSION = gql`
  mutation ReconcileCashierSession($sessionId: ID!, $actualCash: Decimal!, $notes: String) {
    reconcileCashierSession(sessionId: $sessionId, actualCash: $actualCash, notes: $notes) {
      id status actualBalance expectedBalance discrepancy reconciledAt reconciledBy
    }
  }
`;

// ===== FX Positions =====

export const GET_FX_POSITIONS = gql`
  query GetFxPositions($branchId: ID) {
    fxPositions(branchId: $branchId) {
      id currencyCode positionAmount averageRate unrealizedPnL lastUpdated
      branch { id branchName }
    }
  }
`;

export const GET_FX_POSITION_HISTORY = gql`
  query GetFxPositionHistory($currencyCode: String!, $from: DateTime!, $to: DateTime!) {
    fxPositionHistory(currencyCode: $currencyCode, from: $from, to: $to) {
      id currencyCode positionBefore positionAfter changeAmount exchangeRate createdAt
      transaction { id transactionNumber }
      branch { id branchName }
    }
  }
`;

// ===== Branch Settlements =====

export const GET_BRANCH_SETTLEMENTS = gql`
  query GetBranchSettlements($branchId: ID) {
    branchSettlements(branchId: $branchId) {
      id fromBranch { id branchName } toBranch { id branchName }
      settlementDate totalAmount transactionCount status
      settledAt settledBy referenceNumber notes createdAt
    }
  }
`;

export const GET_PENDING_SETTLEMENTS = gql`
  query GetPendingSettlements {
    pendingBranchSettlements {
      id fromBranch { id branchName } toBranch { id branchName }
      settlementDate totalAmount transactionCount status referenceNumber createdAt
    }
  }
`;

export const CREATE_BRANCH_SETTLEMENT = gql`
  mutation CreateBranchSettlement($fromBranchId: ID!, $toBranchId: ID!, $settlementDate: Date!, $totalAmount: Decimal!, $transactionCount: Int, $notes: String) {
    createBranchSettlement(fromBranchId: $fromBranchId, toBranchId: $toBranchId, settlementDate: $settlementDate, totalAmount: $totalAmount, transactionCount: $transactionCount, notes: $notes) {
      id referenceNumber status totalAmount settlementDate
      fromBranch { id branchName } toBranch { id branchName }
    }
  }
`;

export const SETTLE_BRANCH_SETTLEMENT = gql`
  mutation SettleBranchSettlement($settlementId: ID!) {
    settleBranchSettlement(settlementId: $settlementId) {
      id status settledAt settledBy
    }
  }
`;

export const UPDATE_PREFERRED_LANGUAGE = gql`
  mutation UpdatePreferredLanguage($language: String!) {
    updatePreferredLanguage(language: $language)
  }
`;

// Fixed Assets
export const GET_FIXED_ASSETS = gql`
  query GetFixedAssets {
    fixedAssets {
      id assetCode assetName description category acquisitionDate acquisitionCost
      usefulLifeMonths residualValue depreciationMethod depreciationRate
      accumulatedDepreciation netBookValue location serialNumber supplier
      warrantyExpiry status disposalDate disposalAmount
      branch { id branchName }
      createdAt
    }
  }
`;

export const GET_ASSET_DEPRECIATION_HISTORY = gql`
  query GetAssetDepreciationHistory($assetId: ID!) {
    assetDepreciationHistory(assetId: $assetId) {
      id periodDate depreciationAmount accumulatedAfter netBookValueAfter postedBy createdAt
    }
  }
`;

export const CREATE_FIXED_ASSET = gql`
  mutation CreateFixedAsset(
    $assetName: String!, $description: String, $category: String!,
    $acquisitionDate: Date!, $acquisitionCost: Decimal!, $usefulLifeMonths: Int!,
    $residualValue: Decimal, $depreciationMethod: String!, $depreciationRate: Decimal,
    $location: String, $serialNumber: String, $supplier: String, $warrantyExpiry: Date,
    $assetAccountId: ID, $depreciationExpenseAccountId: ID, $accumulatedDepreciationAccountId: ID,
    $branchId: ID
  ) {
    createFixedAsset(
      assetName: $assetName, description: $description, category: $category,
      acquisitionDate: $acquisitionDate, acquisitionCost: $acquisitionCost,
      usefulLifeMonths: $usefulLifeMonths, residualValue: $residualValue,
      depreciationMethod: $depreciationMethod, depreciationRate: $depreciationRate,
      location: $location, serialNumber: $serialNumber, supplier: $supplier,
      warrantyExpiry: $warrantyExpiry, assetAccountId: $assetAccountId,
      depreciationExpenseAccountId: $depreciationExpenseAccountId,
      accumulatedDepreciationAccountId: $accumulatedDepreciationAccountId,
      branchId: $branchId
    ) {
      id assetCode assetName description category acquisitionDate acquisitionCost
      usefulLifeMonths residualValue depreciationMethod depreciationRate
      accumulatedDepreciation netBookValue location serialNumber supplier
      warrantyExpiry status branch { id branchName } createdAt
    }
  }
`;

export const UPDATE_FIXED_ASSET = gql`
  mutation UpdateFixedAsset(
    $id: ID!, $assetName: String, $description: String, $location: String,
    $serialNumber: String, $residualValue: Decimal, $usefulLifeMonths: Int
  ) {
    updateFixedAsset(
      id: $id, assetName: $assetName, description: $description, location: $location,
      serialNumber: $serialNumber, residualValue: $residualValue, usefulLifeMonths: $usefulLifeMonths
    ) {
      id assetCode assetName description category acquisitionDate acquisitionCost
      usefulLifeMonths residualValue depreciationMethod depreciationRate
      accumulatedDepreciation netBookValue location serialNumber supplier
      warrantyExpiry status branch { id branchName } createdAt
    }
  }
`;

export const RUN_DEPRECIATION = gql`
  mutation RunDepreciation($periodDate: Date!) {
    runDepreciation(periodDate: $periodDate)
  }
`;

export const DISPOSE_FIXED_ASSET = gql`
  mutation DisposeFixedAsset($id: ID!, $disposalAmount: Decimal!, $reason: String) {
    disposeFixedAsset(id: $id, disposalAmount: $disposalAmount, reason: $reason) {
      id assetCode assetName status disposalDate disposalAmount netBookValue
    }
  }
`;

// Budget
export const GET_BUDGETS = gql`
  query GetBudgets {
    budgets {
      id budgetName fiscalYear startDate endDate status approvedBy approvedAt
      branch { id branchName }
      notes createdBy createdAt
    }
  }
`;

export const GET_BUDGET_LINES = gql`
  query GetBudgetLines($budgetId: ID!) {
    budgetLines(budgetId: $budgetId) {
      id
      account { id accountCode accountName }
      periodMonth budgetedAmount notes
    }
  }
`;

export const GET_BUDGET_VS_ACTUAL = gql`
  query GetBudgetVsActual($budgetId: ID!) {
    budgetVsActual(budgetId: $budgetId)
  }
`;

export const CREATE_BUDGET = gql`
  mutation CreateBudget($budgetName: String!, $fiscalYear: Int!, $startDate: Date!, $endDate: Date!, $branchId: ID, $notes: String) {
    createBudget(budgetName: $budgetName, fiscalYear: $fiscalYear, startDate: $startDate, endDate: $endDate, branchId: $branchId, notes: $notes) {
      id budgetName fiscalYear startDate endDate status notes createdBy createdAt
    }
  }
`;

export const ADD_BUDGET_LINE = gql`
  mutation AddBudgetLine($budgetId: ID!, $accountId: ID!, $periodMonth: Int!, $amount: Decimal!, $notes: String) {
    addBudgetLine(budgetId: $budgetId, accountId: $accountId, periodMonth: $periodMonth, amount: $amount, notes: $notes) {
      id account { id accountCode accountName } periodMonth budgetedAmount notes
    }
  }
`;

export const UPDATE_BUDGET_LINE = gql`
  mutation UpdateBudgetLine($lineId: ID!, $amount: Decimal!, $notes: String) {
    updateBudgetLine(lineId: $lineId, amount: $amount, notes: $notes) {
      id account { id accountCode accountName } periodMonth budgetedAmount notes
    }
  }
`;

export const APPROVE_BUDGET = gql`
  mutation ApproveBudget($id: ID!) {
    approveBudget(id: $id) {
      id status approvedBy approvedAt
    }
  }
`;

export const ACTIVATE_BUDGET = gql`
  mutation ActivateBudget($id: ID!) {
    activateBudget(id: $id) {
      id status
    }
  }
`;

export const CLOSE_BUDGET = gql`
  mutation CloseBudget($id: ID!) {
    closeBudget(id: $id) {
      id status
    }
  }
`;

// Cost Centers
export const GET_COST_CENTERS = gql`
  query GetCostCenters {
    costCenters {
      id centerCode centerName description centerType
      parentCenter { id centerName }
      branch { id branchName }
      managerName isActive createdAt
    }
  }
`;

export const GET_COST_CENTER_REPORT = gql`
  query GetCostCenterReport($startDate: Date!, $endDate: Date!) {
    costCenterReport(startDate: $startDate, endDate: $endDate)
  }
`;

export const CREATE_COST_CENTER = gql`
  mutation CreateCostCenter(
    $centerCode: String!, $centerName: String!, $description: String,
    $centerType: String!, $parentCenterId: ID, $branchId: ID, $managerName: String
  ) {
    createCostCenter(
      centerCode: $centerCode, centerName: $centerName, description: $description,
      centerType: $centerType, parentCenterId: $parentCenterId, branchId: $branchId,
      managerName: $managerName
    ) {
      id centerCode centerName description centerType
      parentCenter { id centerName }
      branch { id branchName }
      managerName isActive createdAt
    }
  }
`;

export const UPDATE_COST_CENTER = gql`
  mutation UpdateCostCenter($id: ID!, $centerName: String, $description: String, $managerName: String, $isActive: Boolean) {
    updateCostCenter(id: $id, centerName: $centerName, description: $description, managerName: $managerName, isActive: $isActive) {
      id centerCode centerName description centerType
      parentCenter { id centerName }
      branch { id branchName }
      managerName isActive createdAt
    }
  }
`;

// Joint Account Holders
export const GET_JOINT_HOLDERS = gql`
  query GetJointAccountHolders($accountId: ID!) {
    jointAccountHolders(accountId: $accountId) {
      id
      savingsAccount { id accountNumber }
      member { id memberNumber fullName }
      relationship canTransact canClose addedDate isActive
    }
  }
`;

export const ADD_JOINT_HOLDER = gql`
  mutation AddJointHolder($accountId: ID!, $memberId: ID!, $relationship: String!, $canTransact: Boolean!, $canClose: Boolean!) {
    addJointHolder(accountId: $accountId, memberId: $memberId, relationship: $relationship, canTransact: $canTransact, canClose: $canClose) {
      id
      savingsAccount { id accountNumber }
      member { id memberNumber fullName }
      relationship canTransact canClose addedDate isActive
    }
  }
`;

export const REMOVE_JOINT_HOLDER = gql`
  mutation RemoveJointHolder($holderId: ID!) {
    removeJointHolder(holderId: $holderId)
  }
`;

// ALM Reports
export const GET_ALM_REPORT = gql`
  query GetALMReport($date: Date!, $branchId: ID) {
    almReport(date: $date, branchId: $branchId) {
      reportDate
      loanMaturity { bucket count amount }
      depositMaturity { bucket count amount }
      gapAnalysis { bucket loanAmount depositAmount gap cumulativeGap }
      totalLoans totalDeposits netGap
    }
  }
`;

// Loan Insurance
export const GET_LOAN_INSURANCE_POLICIES = gql`
  query GetLoanInsurancePolicies($loanId: ID!) {
    loanInsurancePolicies(loanId: $loanId) {
      id policyNumber premiumAmount maxInsuredAmount
      coverageStartDate coverageEndDate status
      claimStatus claimAmount claimDate claimReason
      claimProcessedDate claimProcessedBy
      createdAt
    }
  }
`;

export const CALCULATE_INSURANCE_PREMIUM = gql`
  query CalculateInsurancePremium($loanId: ID!) {
    calculateInsurancePremium(loanId: $loanId)
  }
`;

export const CREATE_LOAN_INSURANCE_POLICY = gql`
  mutation CreateLoanInsurancePolicy($loanId: ID!) {
    createLoanInsurancePolicy(loanId: $loanId) {
      id policyNumber premiumAmount maxInsuredAmount
      coverageStartDate coverageEndDate status
    }
  }
`;

export const SUBMIT_INSURANCE_CLAIM = gql`
  mutation SubmitInsuranceClaim($policyId: ID!, $claimAmount: Decimal!, $reason: String!) {
    submitInsuranceClaim(policyId: $policyId, claimAmount: $claimAmount, reason: $reason) {
      id policyNumber status claimStatus claimAmount claimDate claimReason
    }
  }
`;

export const PROCESS_INSURANCE_CLAIM = gql`
  mutation ProcessInsuranceClaim($policyId: ID!, $approved: Boolean!, $processedBy: String!) {
    processInsuranceClaim(policyId: $policyId, approved: $approved, processedBy: $processedBy) {
      id policyNumber status claimStatus claimProcessedDate claimProcessedBy
    }
  }
`;

// Member Custom Fields
export const GET_MEMBER_CUSTOM_FIELDS = gql`
  query GetMemberCustomFields {
    memberCustomFields {
      id fieldName fieldLabel fieldType options isRequired sortOrder isActive
    }
  }
`;

export const GET_ALL_MEMBER_CUSTOM_FIELDS = gql`
  query GetAllMemberCustomFields {
    allMemberCustomFields {
      id fieldName fieldLabel fieldType options isRequired sortOrder isActive createdAt
    }
  }
`;

export const GET_MEMBER_CUSTOM_FIELD_VALUES = gql`
  query GetMemberCustomFieldValues($memberId: ID!) {
    memberCustomFieldValues(memberId: $memberId) {
      id
      field { id fieldName fieldLabel fieldType options isRequired }
      fieldValue
    }
  }
`;

export const CREATE_MEMBER_CUSTOM_FIELD = gql`
  mutation CreateMemberCustomField($fieldName: String!, $fieldLabel: String!, $fieldType: CustomFieldType, $options: String, $isRequired: Boolean, $sortOrder: Int) {
    createMemberCustomField(fieldName: $fieldName, fieldLabel: $fieldLabel, fieldType: $fieldType, options: $options, isRequired: $isRequired, sortOrder: $sortOrder) {
      id fieldName fieldLabel fieldType options isRequired sortOrder isActive
    }
  }
`;

export const UPDATE_MEMBER_CUSTOM_FIELD = gql`
  mutation UpdateMemberCustomField($id: ID!, $fieldLabel: String, $options: String, $isRequired: Boolean, $sortOrder: Int, $isActive: Boolean) {
    updateMemberCustomField(id: $id, fieldLabel: $fieldLabel, options: $options, isRequired: $isRequired, sortOrder: $sortOrder, isActive: $isActive) {
      id fieldName fieldLabel fieldType options isRequired sortOrder isActive
    }
  }
`;

export const DELETE_MEMBER_CUSTOM_FIELD = gql`
  mutation DeleteMemberCustomField($id: ID!) {
    deleteMemberCustomField(id: $id)
  }
`;

export const SET_MEMBER_CUSTOM_FIELD_VALUE = gql`
  mutation SetMemberCustomFieldValue($memberId: ID!, $fieldId: ID!, $value: String!) {
    setMemberCustomFieldValue(memberId: $memberId, fieldId: $fieldId, value: $value) {
      id fieldValue
      field { id fieldName fieldLabel }
    }
  }
`;

// ===== Petty Cash =====
export const GET_PETTY_CASH_ACCOUNTS = gql`
  query GetPettyCashAccounts {
    pettyCashAccounts {
      id accountName authorizedAmount currentBalance custodian isActive
      branch { id branchName }
      glAccount { id accountName accountNumber }
      createdAt updatedAt
    }
  }
`;

export const GET_PETTY_CASH_ACCOUNT = gql`
  query GetPettyCashAccount($id: ID!) {
    pettyCashAccount(id: $id) {
      id accountName authorizedAmount currentBalance custodian isActive
      branch { id branchName }
      glAccount { id accountName accountNumber }
      createdAt updatedAt
    }
  }
`;

export const GET_PETTY_CASH_TRANSACTIONS = gql`
  query GetPettyCashTransactions($accountId: ID!) {
    pettyCashTransactions(accountId: $accountId) {
      id transactionDate transactionType amount balanceAfter description
      receiptNumber category approvedBy processedBy createdAt
      pettyCashAccount { id accountName }
    }
  }
`;

export const CREATE_PETTY_CASH_ACCOUNT = gql`
  mutation CreatePettyCashAccount($accountName: String!, $authorizedAmount: Decimal!, $custodian: String!, $branchId: ID!, $glAccountId: ID!) {
    createPettyCashAccount(accountName: $accountName, authorizedAmount: $authorizedAmount, custodian: $custodian, branchId: $branchId, glAccountId: $glAccountId) {
      id accountName authorizedAmount currentBalance custodian isActive
    }
  }
`;

export const FUND_PETTY_CASH = gql`
  mutation FundPettyCash($accountId: ID!, $amount: Decimal!, $description: String!) {
    fundPettyCash(accountId: $accountId, amount: $amount, description: $description) {
      id transactionType amount balanceAfter description createdAt
    }
  }
`;

export const SPEND_PETTY_CASH = gql`
  mutation SpendPettyCash($accountId: ID!, $amount: Decimal!, $description: String!, $receiptNumber: String, $category: String) {
    spendPettyCash(accountId: $accountId, amount: $amount, description: $description, receiptNumber: $receiptNumber, category: $category) {
      id transactionType amount balanceAfter description receiptNumber category createdAt
    }
  }
`;

export const REPLENISH_PETTY_CASH = gql`
  mutation ReplenishPettyCash($accountId: ID!, $description: String!) {
    replenishPettyCash(accountId: $accountId, description: $description) {
      id transactionType amount balanceAfter description createdAt
    }
  }
`;

// ===== Board Members =====
export const GET_BOARD_MEMBERS = gql`
  query GetBoardMembers {
    boardMembers {
      id fullName position committee appointmentDate expiryDate
      phoneNumber email nationalId isActive notes createdAt updatedAt
      member { id memberNumber firstName lastName }
    }
  }
`;

export const GET_BOARD_MEMBERS_BY_COMMITTEE = gql`
  query GetBoardMembersByCommittee($committee: String!) {
    boardMembersByCommittee(committee: $committee) {
      id fullName position committee appointmentDate expiryDate
      phoneNumber email nationalId isActive notes
      member { id memberNumber firstName lastName }
    }
  }
`;

export const GET_BOARD_MEMBER = gql`
  query GetBoardMember($id: ID!) {
    boardMember(id: $id) {
      id fullName position committee appointmentDate expiryDate
      phoneNumber email nationalId isActive notes createdAt updatedAt
      member { id memberNumber firstName lastName }
    }
  }
`;

export const CREATE_BOARD_MEMBER = gql`
  mutation CreateBoardMember($fullName: String!, $position: String!, $committee: String, $appointmentDate: Date!, $expiryDate: Date, $phoneNumber: String, $email: String, $nationalId: String, $memberId: ID, $notes: String) {
    createBoardMember(fullName: $fullName, position: $position, committee: $committee, appointmentDate: $appointmentDate, expiryDate: $expiryDate, phoneNumber: $phoneNumber, email: $email, nationalId: $nationalId, memberId: $memberId, notes: $notes) {
      id fullName position committee appointmentDate expiryDate isActive
    }
  }
`;

export const UPDATE_BOARD_MEMBER = gql`
  mutation UpdateBoardMember($id: ID!, $fullName: String, $position: String, $committee: String, $expiryDate: Date, $phoneNumber: String, $email: String, $isActive: Boolean, $notes: String) {
    updateBoardMember(id: $id, fullName: $fullName, position: $position, committee: $committee, expiryDate: $expiryDate, phoneNumber: $phoneNumber, email: $email, isActive: $isActive, notes: $notes) {
      id fullName position committee expiryDate phoneNumber email isActive notes
    }
  }
`;

// ===== TCDC Compliance =====
export const GET_TCDC_COMPLIANCE_REPORT = gql`
  query GetTCDCComplianceReport($date: Date!, $branchId: ID) {
    tcdcComplianceReport(date: $date, branchId: $branchId) {
      reportDate
      totalAssets totalLiabilities totalEquity totalLoans totalDeposits
      totalMembers totalBorrowers
      capitalAdequacy {
        coreCapital riskWeightedAssets capitalAdequacyRatio minimumRequired compliant
      }
      liquidityRatio {
        liquidAssets shortTermLiabilities liquidityRatio minimumRequired compliant
      }
      sectorConcentration {
        sector loanCount totalExposure percentageOfPortfolio
      }
      insiderLending {
        memberName position loanAmount outstandingBalance percentageOfCoreCapital
      }
    }
  }
`;

// ===== Credit Scoring =====
export const GET_CREDIT_SCORE = gql`
  query GetCreditScore($memberId: ID!) {
    creditScore(memberId: $memberId) {
      id score rating factors calculatedAt
      member { id memberNumber firstName lastName }
    }
  }
`;

export const CALCULATE_CREDIT_SCORE = gql`
  mutation CalculateCreditScore($memberId: ID!) {
    calculateCreditScore(memberId: $memberId) {
      id score rating factors calculatedAt
      member { id memberNumber firstName lastName }
    }
  }
`;

// ===== Enhanced Credit Scoring & Risk =====

const ENHANCED_SCORE_FIELDS = `
  id score rating riskLevel recommendation
  transactionBehaviorScore savingsBehaviorScore loanHistoryScore
  financialStabilityScore memberProfileScore
  scoreBreakdown riskFlags trend trendDelta previousScore
  scoringModelVersion calculatedAt
  member { id memberNumber firstName lastName }
`;

export const GET_ENHANCED_CREDIT_SCORE = gql`
  query GetEnhancedCreditScore($memberId: ID!) {
    enhancedCreditScore(memberId: $memberId) {
      ${ENHANCED_SCORE_FIELDS}
    }
  }
`;

export const CALCULATE_ENHANCED_CREDIT_SCORE = gql`
  mutation CalculateEnhancedCreditScore($memberId: ID!) {
    calculateEnhancedCreditScore(memberId: $memberId) {
      ${ENHANCED_SCORE_FIELDS}
    }
  }
`;

export const GET_SCORE_HISTORY = gql`
  query GetScoreHistory($memberId: ID!, $limit: Int) {
    scoreHistory(memberId: $memberId, limit: $limit) {
      score rating riskLevel calculatedAt
    }
  }
`;

export const GET_SCORE_TREND_ANALYSIS = gql`
  query GetScoreTrendAnalysis($memberId: ID!) {
    scoreTrendAnalysis(memberId: $memberId) {
      currentScore trend trendDelta averageScore highestScore lowestScore
      scores { score rating riskLevel calculatedAt }
    }
  }
`;

export const GET_LOAN_APPROVAL_CONTEXT = gql`
  query GetLoanApprovalContext($loanId: ID!) {
    loanApprovalContext(loanId: $loanId) {
      creditScore { ${ENHANCED_SCORE_FIELDS} }
      eligible maxLoanAmount riskRecommendation requiresManualReview
      activeAlerts { id alertType severity message createdAt }
    }
  }
`;

export const GET_RISK_ALERTS = gql`
  query GetRiskAlerts($page: Int, $size: Int) {
    riskAlerts(page: $page, size: $size) {
      content {
        id alertType severity message details isResolved
        resolvedBy resolvedAt createdAt
        member { id memberNumber firstName lastName }
      }
      totalElements totalPages
    }
  }
`;

export const GET_MEMBER_RISK_ALERTS = gql`
  query GetMemberRiskAlerts($memberId: ID!) {
    memberRiskAlerts(memberId: $memberId) {
      id alertType severity message details isResolved createdAt
    }
  }
`;

export const RESOLVE_RISK_ALERT = gql`
  mutation ResolveRiskAlert($alertId: ID!) {
    resolveRiskAlert(alertId: $alertId) {
      id isResolved resolvedBy resolvedAt
    }
  }
`;

export const GET_RISK_DASHBOARD = gql`
  query GetRiskDashboard {
    riskDashboard {
      totalMembers scoredMembers averageScore
      riskDistribution criticalAlerts warningAlerts
    }
  }
`;

export const GET_ACTIVE_SCORING_CONFIG = gql`
  query GetActiveScoringConfig {
    activeScoringConfig {
      id configName weights isActive createdBy createdAt updatedAt
    }
  }
`;

export const UPDATE_SCORING_WEIGHTS = gql`
  mutation UpdateScoringWeights($configName: String!, $weights: JSON!) {
    updateScoringWeights(configName: $configName, weights: $weights) {
      id configName weights isActive updatedAt
    }
  }
`;

export const BATCH_RECALCULATE_SCORES = gql`
  mutation BatchRecalculateScores {
    batchRecalculateScores
  }
`;

// ===== Loan Approval Workflow =====
export const GET_PENDING_REVIEW_LOANS = gql`
  query GetPendingReviewLoans($page: Int, $size: Int) {
    pendingReviewLoans(page: $page, size: $size) {
      content {
        id loanNumber principalAmount interestRate termMonths status
        applicationDate autoApproved approvalLevel
        member { id memberNumber firstName lastName }
        product { id productName }
        branch { id branchName }
      }
      totalElements totalPages
    }
  }
`;

export const GET_LOAN_APPROVAL_HISTORY = gql`
  query GetLoanApprovalHistory($loanId: ID!) {
    loanApprovalHistory(loanId: $loanId) {
      id approvalLevel action comments riskLevel creditScore createdAt
      approvedBy { id username fullName }
    }
  }
`;

export const LOAN_OFFICER_APPROVAL = gql`
  mutation LoanOfficerApproval($loanId: ID!, $approved: Boolean!, $approvedAmount: Decimal, $comments: String) {
    loanOfficerApproval(loanId: $loanId, approved: $approved, approvedAmount: $approvedAmount, comments: $comments) {
      id loanNumber status approvalLevel
    }
  }
`;

export const MANAGER_APPROVAL = gql`
  mutation ManagerApproval($loanId: ID!, $approved: Boolean!, $approvedAmount: Decimal, $comments: String) {
    managerApproval(loanId: $loanId, approved: $approved, approvedAmount: $approvedAmount, comments: $comments) {
      id loanNumber status approvalLevel
    }
  }
`;

// ===== Fraud Detection =====
export const GET_FRAUD_DASHBOARD_STATS = gql`
  query GetFraudDashboardStats {
    fraudDashboardStats {
      totalFraudAlerts unresolvedFraudAlerts openInvestigations
      transactionAlerts accountAlerts internalAlerts
    }
  }
`;

export const GET_FRAUD_ALERTS = gql`
  query GetFraudAlerts($category: String, $page: Int, $size: Int) {
    fraudAlerts(category: $category, page: $page, size: $size) {
      content {
        id alertType severity alertCategory message details
        relatedTransactionId relatedUserId isResolved resolvedBy resolvedAt createdAt
        member { id memberNumber firstName lastName }
      }
      totalElements totalPages
    }
  }
`;

export const GET_FRAUD_INVESTIGATIONS = gql`
  query GetFraudInvestigations($status: String, $page: Int, $size: Int) {
    fraudInvestigations(status: $status, page: $page, size: $size) {
      content {
        id status investigationNotes createdAt updatedAt
        riskAlert { id alertType severity message member { id memberNumber firstName lastName } }
        assignedTo { id username fullName }
      }
      totalElements totalPages
    }
  }
`;

export const OPEN_FRAUD_INVESTIGATION = gql`
  mutation OpenFraudInvestigation($alertId: ID!, $assignedToUserId: ID!) {
    openFraudInvestigation(alertId: $alertId, assignedToUserId: $assignedToUserId) {
      id status
    }
  }
`;

export const UPDATE_FRAUD_INVESTIGATION = gql`
  mutation UpdateFraudInvestigation($investigationId: ID!, $status: String!, $notes: String) {
    updateFraudInvestigation(investigationId: $investigationId, status: $status, notes: $notes) {
      id status investigationNotes
    }
  }
`;

// ===== Dividends (Legacy) =====
export const GET_DIVIDEND_RUNS = gql`
  query GetDividendRuns {
    dividendRuns {
      id year method rate totalAmount membersPaid distributionMethod
      profitFigure totalInterestPoints status processedBy createdAt
    }
  }
`;

export const CALCULATE_DIVIDENDS = gql`
  mutation CalculateDividends($year: Int!, $method: String!, $rate: Decimal!) {
    calculateDividends(year: $year, method: $method, rate: $rate) {
      id year method rate totalAmount membersPaid status
    }
  }
`;

export const POST_DIVIDENDS = gql`
  mutation PostDividends($dividendRunId: ID!) {
    postDividends(dividendRunId: $dividendRunId) {
      id status totalAmount membersPaid
    }
  }
`;

// ===== Two-Factor Authentication =====
export const SETUP_2FA = gql`
  mutation Setup2FA {
    setup2FA {
      secret
      otpAuthUri
    }
  }
`;

export const VERIFY_2FA = gql`
  mutation Verify2FA($code: String!) {
    verify2FA(code: $code)
  }
`;

export const DISABLE_2FA = gql`
  mutation Disable2FA {
    disable2FA
  }
`;

// ===== Guarantor Consent =====
// NOTE: There is no dedicated backend query for fetching a member's guarantee requests.
// A dedicated endpoint (e.g., essGuaranteeRequests) should be added to the backend.
// For now, this query uses essLoanAccounts which includes guarantor data on each loan.
export const GET_MY_GUARANTEE_REQUESTS = gql`
  query GetMyGuaranteeRequests {
    essLoanAccounts {
      id
      loanNumber
      principalAmount
      purpose
      status
      member {
        id
        firstName
        lastName
        memberNumber
      }
      guarantors {
        id
        guarantorName
        guarantorPhone
        guarantorNationalId
        guaranteedAmount
        relationship
        status
        consentDate
        consentNotes
        createdAt
        guarantorMember {
          id
        }
      }
    }
  }
`;

export const ACCEPT_GUARANTEE = gql`
  mutation AcceptGuarantee($guarantorId: ID!, $notes: String) {
    acceptGuarantee(guarantorId: $guarantorId, notes: $notes) {
      id status consentGiven consentDate
    }
  }
`;

export const DECLINE_GUARANTEE = gql`
  mutation DeclineGuarantee($guarantorId: ID!, $reason: String) {
    declineGuarantee(guarantorId: $guarantorId, reason: $reason) {
      id status consentGiven
    }
  }
`;

// ===== Share Netting =====
export const NET_SHARES_AND_DEPOSITS = gql`
  mutation NetSharesAndDeposits($loanId: ID!) {
    netSharesAndDeposits(loanId: $loanId) {
      id loanNumber outstandingBalance status
    }
  }
`;

// ===== Retry Expired Payments =====
export const RETRY_EXPIRED_PAYMENTS = gql`
  mutation RetryExpiredPayments {
    retryExpiredPayments
  }
`;

// ===== Generate Missing Repayment Schedules =====
export const GENERATE_MISSING_REPAYMENT_SCHEDULES = gql`
  mutation GenerateMissingRepaymentSchedules {
    generateMissingRepaymentSchedules
  }
`;

// ===== Send Notification =====
export const SEND_NOTIFICATION = gql`
  mutation SendNotification($phoneNumber: String, $email: String, $message: String!, $subject: String) {
    sendNotification(phoneNumber: $phoneNumber, email: $email, message: $message, subject: $subject)
  }
`;

// ===== Loan Group Members =====
export const GET_LOAN_GROUP_MEMBERS = gql`
  query GetLoanGroupMembers($groupId: ID!) {
    loanGroupMembers(groupId: $groupId) {
      id liabilityShare roleInGroup joinedAt
      member { id memberNumber firstName lastName phoneNumber }
    }
  }
`;

// ===== Additional filter queries =====
export const GET_ACTIVE_CURRENCIES = gql`
  query GetActiveCurrencies {
    activeCurrencies {
      id currencyCode currencyName symbol decimalPlaces isActive isBaseCurrency
    }
  }
`;

export const GET_BASE_CURRENCY = gql`
  query GetBaseCurrency {
    baseCurrency {
      id currencyCode currencyName symbol decimalPlaces
    }
  }
`;

export const GET_MEMBER_JOINT_ACCOUNTS = gql`
  query GetMemberJointAccounts($memberId: ID!) {
    memberJointAccounts(memberId: $memberId) {
      id relationship canTransact canClose
      savingsAccount { id accountNumber balance status }
      member { id memberNumber firstName lastName }
    }
  }
`;

export const GET_LOAN_MATURITY_SCHEDULE = gql`
  query GetLoanMaturitySchedule($date: Date!, $branchId: ID) {
    loanMaturitySchedule(date: $date, branchId: $branchId) {
      bucket totalAmount count
    }
  }
`;

export const GET_DEPOSIT_MATURITY_SCHEDULE = gql`
  query GetDepositMaturitySchedule($date: Date!, $branchId: ID) {
    depositMaturitySchedule(date: $date, branchId: $branchId) {
      bucket totalAmount count
    }
  }
`;

// ===== Loan Overdue Reminders =====
export const GET_OVERDUE_LOANS = gql`
  query GetOverdueLoans($page: Int, $size: Int) {
    overdueLoans(page: $page, size: $size) {
      content {
        id loanNumber principalAmount outstandingPrincipal outstandingInterest
        outstandingPenalties outstandingFees daysInArrears status nextPaymentDate
        member { id memberNumber firstName lastName phoneNumber }
        product { id productName }
        branch { id branchName }
      }
      totalElements totalPages
    }
  }
`;

export const GET_LOAN_ESCALATION_SUMMARY = gql`
  query GetLoanEscalationSummary {
    loanEscalationSummary {
      totalOverdue remindersToday guarantorNoticesToday defaultedThisMonth upcomingPayments
    }
  }
`;

export const GET_LOAN_REMINDER_LOGS = gql`
  query GetLoanReminderLogs($loanId: ID!, $page: Int, $size: Int) {
    loanReminderLogs(loanId: $loanId, page: $page, size: $size) {
      content {
        id reminderType escalationLevel channel recipientPhone recipientEmail
        message sentAt daysInArrearsAtSend
        member { id firstName lastName }
      }
      totalElements totalPages
    }
  }
`;

export const SEND_MANUAL_REMINDER = gql`
  mutation SendManualReminder($loanId: ID!, $message: String) {
    sendManualReminder(loanId: $loanId, message: $message) {
      id reminderType channel message sentAt
    }
  }
`;

export const RUN_OVERDUE_REMINDERS = gql`
  mutation RunOverdueReminders {
    runOverdueReminders
  }
`;

