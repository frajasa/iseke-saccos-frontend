// Dashboard
export interface DashboardStats {
  totalMembers: number;
  totalSavings: number;
  activeLoans: number;
  loanPortfolio: number;
  overdueLoans: number;
  pendingApplications: number;
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  memberName: string;
  transactionType: string;
  amount: number;
  date: string;
  status: string;
}

// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
  LOAN_OFFICER = "LOAN_OFFICER",
  ACCOUNTANT = "ACCOUNTANT",
  MEMBER = "MEMBER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DORMANT = "DORMANT",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DORMANT = "DORMANT",
  CLOSED = "CLOSED",
}

export enum LoanStatus {
  APPLIED = "APPLIED",
  APPROVED = "APPROVED",
  DISBURSED = "DISBURSED",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  WRITTEN_OFF = "WRITTEN_OFF",
  REJECTED = "REJECTED",
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  LOAN_DISBURSEMENT = "LOAN_DISBURSEMENT",
  LOAN_REPAYMENT = "LOAN_REPAYMENT",
  TRANSFER = "TRANSFER",
  FEE = "FEE",
  INTEREST = "INTEREST",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REVERSED = "REVERSED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_MONEY = "MOBILE_MONEY",
  CARD = "CARD",
  MPESA = "MPESA",
  TIGOPESA = "TIGOPESA",
  YAS = "YAS",
  NMB_BANK = "NMB_BANK",
}

export enum PaymentProvider {
  MPESA = "MPESA",
  TIGOPESA = "TIGOPESA",
  YAS = "YAS",
  NMB_BANK = "NMB_BANK",
  INTERNAL = "INTERNAL",
}

export enum PaymentDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export enum PaymentRequestStatus {
  INITIATED = "INITIATED",
  SENT = "SENT",
  CALLBACK_RECEIVED = "CALLBACK_RECEIVED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  REVERSED = "REVERSED",
}

export enum SavingsProductType {
  SAVINGS = "SAVINGS",
  FIXED_DEPOSIT = "FIXED_DEPOSIT",
  SHARES = "SHARES",
  CHECKING = "CHECKING",
  CURRENT = "CURRENT",
}

export enum InterestMethod {
  FLAT = "FLAT",
  DECLINING_BALANCE = "DECLINING_BALANCE",
  REDUCING_BALANCE = "REDUCING_BALANCE",
}

export enum BranchStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ScheduleStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum GuarantorStatus {
  ACTIVE = "ACTIVE",
  RELEASED = "RELEASED",
}

export enum CollateralStatus {
  PLEDGED = "PLEDGED",
  ACTIVE = "ACTIVE",
  RELEASED = "RELEASED",
  DISPOSED = "DISPOSED",
  VALUED = "VALUED",
  UNDER_EVALUATION = "UNDER_EVALUATION",
  LIQUIDATED = "LIQUIDATED",
}

export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum MemberStage {
  POTENTIAL = "POTENTIAL",
  APPLICANT = "APPLICANT",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DORMANT = "DORMANT",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum AccountCategory {
  // Assets
  CURRENT_ASSETS = "CURRENT_ASSETS",
  FIXED_ASSETS = "FIXED_ASSETS",
  CASH_AND_BANK = "CASH_AND_BANK",
  INVESTMENTS = "INVESTMENTS",
  // Liabilities
  CURRENT_LIABILITIES = "CURRENT_LIABILITIES",
  LONG_TERM_LIABILITIES = "LONG_TERM_LIABILITIES",
  // Equity
  CAPITAL = "CAPITAL",
  RETAINED_EARNINGS = "RETAINED_EARNINGS",
  // Income
  INTEREST_INCOME = "INTEREST_INCOME",
  FEE_INCOME = "FEE_INCOME",
  OTHER_INCOME = "OTHER_INCOME",
  // Expense
  OPERATING_EXPENSES = "OPERATING_EXPENSES",
  INTEREST_EXPENSE = "INTEREST_EXPENSE",
  ADMINISTRATIVE_EXPENSES = "ADMINISTRATIVE_EXPENSES",
}

export enum JournalEntryStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  REVERSED = "REVERSED",
}

export enum JournalEntryType {
  GENERAL = "GENERAL",
  ADJUSTING = "ADJUSTING",
  CLOSING = "CLOSING",
  OPENING = "OPENING",
  REVERSING = "REVERSING",
}

// Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  branch: Branch;
  passwordExpiresAt?: string;
  forcePasswordChange?: boolean;
  linkedMemberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
  forcePasswordChange?: boolean;
}

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  address: string;
  phoneNumber: string;
  email: string;
  managerName: string;
  openingDate: string;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  address: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  maritalStatus: MaritalStatus;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  membershipDate: string;
  status: MemberStatus;
  stage?: MemberStage;
  photoPath?: string;
  signaturePath?: string;
  fingerprintPath?: string;
  branch: Branch;
  savingsAccounts?: SavingsAccount[];
  loanAccounts?: LoanAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberPage {
  content: Member[];
  totalElements: number;
  totalPages: number;
}

export interface SavingsProduct {
  id: string;
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
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsAccount {
  id: string;
  accountNumber: string;
  member: Member;
  product: SavingsProduct;
  branch: Branch;
  openingDate: string;
  balance: number;
  availableBalance: number;
  accruedInterest: number;
  lastTransactionDate?: string;
  lastInterestDate?: string;
  status: AccountStatus;
  maturityDate?: string;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanProduct {
  id: string;
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
  requiresGuarantors?: boolean;
  minimumGuarantors?: number;
  requiresCollateral?: boolean;
  collateralPercentage?: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Guarantor {
  id: string;
  loanAccount: LoanAccount;
  guarantorMember?: Member;
  guarantorName: string;
  guarantorNationalId?: string;
  guarantorPhone?: string;
  guaranteedAmount: number;
  relationship?: string;
  status: GuarantorStatus;
  createdAt?: string;
}

export interface Collateral {
  id: string;
  loanAccount: LoanAccount;
  collateralType: string;
  description?: string;
  estimatedValue: number;
  registrationNumber?: string;
  location?: string;
  status: CollateralStatus;
  createdAt?: string;
}

export interface LoanAccount {
  id: string;
  loanNumber: string;
  member: Member;
  product: LoanProduct;
  branch: Branch;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  repaymentFrequency: string;
  outstandingPrincipal: number;
  outstandingInterest: number;
  outstandingFees: number;
  outstandingPenalties: number;
  totalPaid: number;
  nextPaymentDate?: string;
  maturityDate?: string;
  status: LoanStatus;
  loanOfficer?: string;
  purpose?: string;
  daysInArrears: number;
  writeOffReason?: string;
  writeOffDate?: string;
  writtenOffBy?: string;
  guarantors?: Guarantor[];
  collateral?: Collateral[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanAccountPage {
  content: LoanAccount[];
  totalElements: number;
  totalPages: number;
}

export interface RepaymentSchedule {
  id: string;
  loan?: LoanAccount;
  installmentNumber: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  principalPaid: number;
  interestPaid: number;
  feesPaid: number;
  penaltiesPaid: number;
  totalPaid: number;
  paymentDate?: string;
  status: ScheduleStatus;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  transactionTime: string;
  transactionType: TransactionType;
  member: Member;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceNumber?: string;
  paymentMethod: PaymentMethod;
  processedBy: string;
  branch: Branch;
  status: TransactionStatus;
  savingsAccount?: SavingsAccount;
  loanAccount?: LoanAccount;
  reversalOfId?: string;
  reversedById?: string;
  reversalReason?: string;
  createdAt: string;
}

// Input types
export interface CreateMemberInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string;
  phoneNumber: string;
  email?: string;
  address: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  maritalStatus?: MaritalStatus;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  branchId?: string;
  photoPath?: string;
  signaturePath?: string;
  fingerprintPath?: string;
  photo?: string;
  signature?: string;
  fingerprint?: string;
}

export interface UpdateMemberInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phoneNumber?: string;
  email?: string;
  address?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  maritalStatus?: MaritalStatus;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  branchId?: string;
  photoPath?: string;
  signaturePath?: string;
  fingerprintPath?: string;
  photo?: string;
  signature?: string;
  fingerprint?: string;
}

export interface CreateSavingsAccountInput {
  memberId: string;
  productId: string;
  branchId?: string;
  openingDeposit: number;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
}

export interface DepositInput {
  accountId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  description?: string;
}

export interface WithdrawInput {
  accountId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface LoanApplicationInput {
  memberId: string;
  productId: string;
  branchId?: string;
  requestedAmount: number;
  termMonths: number;
  purpose?: string;
  loanOfficer?: string;
}

export interface LoanRepaymentInput {
  loanId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
}

export interface AddGuarantorInput {
  loanId: string;
  guarantorMemberId?: string;
  guarantorName: string;
  guarantorNationalId?: string;
  guarantorPhone?: string;
  guaranteedAmount: number;
  relationship: string;
}

export interface AddCollateralInput {
  loanId: string;
  collateralType: string;
  description: string;
  estimatedValue: number;
  registrationNumber?: string;
  location?: string;
}

export interface CreateBranchInput {
  branchCode: string;
  branchName: string;
  address: string;
  phoneNumber: string;
  email: string;
  managerName: string;
  openingDate: string;
}

export interface UpdateBranchInput {
  branchName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  managerName?: string;
  status?: BranchStatus;
}

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
  productCode?: string;
  productName?: string;
  productType?: SavingsProductType;
  description?: string;
  interestRate?: number;
  interestCalculationMethod?: string;
  interestPaymentFrequency?: string;
  minimumBalance?: number;
  maximumBalance?: number;
  minimumOpeningBalance?: number;
  withdrawalLimit?: number;
  withdrawalFee?: number;
  monthlyFee?: number;
  taxWithholdingRate?: number;
  dormancyPeriodDays?: number;
  allowsOverdraft?: boolean;
  status?: ProductStatus;
}

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
  productCode?: string;
  productName?: string;
  description?: string;
  interestRate?: number;
  interestMethod?: InterestMethod;
  repaymentFrequency?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  minimumTermMonths?: number;
  maximumTermMonths?: number;
  processingFeeRate?: number;
  processingFeeFixed?: number;
  insuranceFeeRate?: number;
  latePaymentPenaltyRate?: number;
  gracePeriodDays?: number;
  requiresGuarantors?: boolean;
  minimumGuarantors?: number;
  requiresCollateral?: boolean;
  collateralPercentage?: number;
  status?: ProductStatus;
}

// Accounting Types
export interface ChartOfAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory: AccountCategory;
  parentAccount?: ChartOfAccount;
  description?: string;
  isActive: boolean;
  status?: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  entryType: JournalEntryType;
  description: string;
  referenceNumber?: string;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  branch: Branch;
  createdBy: string;
  postedBy?: string;
  postedDate?: string;
  reversedBy?: string;
  reversedDate?: string;
  reversalReason?: string;
  journalEntryLines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntry: JournalEntry;
  account: ChartOfAccount;
  description: string;
  debitAmount: number;
  creditAmount: number;
  referenceNumber?: string;
  createdAt: string;
}

export interface GeneralLedger {
  id: string;
  postingDate: string;
  account: ChartOfAccount;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  description: string;
  reference?: string;
  branch?: Branch;
  postedBy?: string;
  createdAt: string;
}

export interface TrialBalance {
  account: ChartOfAccount;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalanceReport {
  date: string;
  entries: TrialBalance[];
  totalDebits: number;
  totalCredits: number;
}

export interface BalanceSheet {
  asOfDate: string;
  branch?: Branch;
  assets: {
    currentAssets: BalanceSheetItem[];
    fixedAssets: BalanceSheetItem[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: BalanceSheetItem[];
    longTermLiabilities: BalanceSheetItem[];
    totalLiabilities: number;
  };
  equity: {
    capitalAccounts: BalanceSheetItem[];
    retainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface BalanceSheetItem {
  account: ChartOfAccount;
  amount: number;
}

export interface IncomeStatement {
  startDate: string;
  endDate: string;
  branch?: Branch;
  income: {
    interestIncome: IncomeStatementItem[];
    feeIncome: IncomeStatementItem[];
    otherIncome: IncomeStatementItem[];
    totalIncome: number;
  };
  expenses: {
    interestExpense: IncomeStatementItem[];
    operatingExpenses: IncomeStatementItem[];
    administrativeExpenses: IncomeStatementItem[];
    totalExpenses: number;
  };
  netIncome: number;
}

export interface IncomeStatementItem {
  account: ChartOfAccount;
  amount: number;
}

// Accounting Input Types
export interface CreateChartOfAccountInput {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory: AccountCategory;
  parentAccountId?: string;
  description?: string;
}

export interface UpdateChartOfAccountInput {
  accountName?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateJournalEntryInput {
  entryDate: string;
  entryType: JournalEntryType;
  description: string;
  referenceNumber?: string;
  branchId?: string;
  lines: CreateJournalEntryLineInput[];
}

export interface CreateJournalEntryLineInput {
  accountId: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  referenceNumber?: string;
}

export interface PostJournalEntryInput {
  entryId: string;
}

export interface ReverseJournalEntryInput {
  entryId: string;
  reversalDate: string;
  reversalReason: string;
}

// ===== SACCOS Compliance Types =====

export interface AuditLog {
  id: string;
  user?: { id: string; username: string; fullName: string };
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface JournalEntryResult {
  success: boolean;
  reference: string;
  entriesPosted: number;
  postingDate: string;
}

export interface CashFlowStatement {
  date: string;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  netCashFlow: number;
}

export interface CashFlowSection {
  name: string;
  items: CashFlowItem[];
  total: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
}

export interface LoanProvisionReport {
  date: string;
  classifications: LoanClassification[];
  totalOutstanding: number;
  totalProvision: number;
}

export interface LoanClassification {
  classification: string;
  count: number;
  outstandingAmount: number;
  provisionRate: number;
  provisionAmount: number;
}

export interface MemberStatement {
  member: { id: string; memberNumber: string; firstName: string; lastName: string; fullName: string };
  account?: { id: string; accountNumber: string; product: { productName: string } };
  transactions: Transaction[];
  openingBalance: number;
  closingBalance: number;
  period: string;
}

export interface DailyTransactionSummary {
  date: string;
  deposits: number;
  withdrawals: number;
  loanDisbursements: number;
  loanRepayments: number;
  totalCount: number;
}

export interface JournalEntryInput {
  postingDate?: string;
  description: string;
  reference?: string;
  branchId?: string;
  lines: JournalEntryLineInput[];
}

export interface JournalEntryLineInput {
  accountId: string;
  debitAmount?: number;
  creditAmount?: number;
}

// ===== Payment Integration Types =====

export interface PaymentRequest {
  id: string;
  requestNumber: string;
  provider: PaymentProvider;
  direction: PaymentDirection;
  status: PaymentRequestStatus;
  amount: number;
  currency: string;
  phoneNumber?: string;
  bankAccountNumber?: string;
  member?: Member;
  savingsAccount?: SavingsAccount;
  loanAccount?: LoanAccount;
  purpose?: string;
  providerReference?: string;
  providerConversationId?: string;
  providerResponseCode?: string;
  providerResponseMessage?: string;
  failureReason?: string;
  retryCount?: number;
  initiatedBy?: string;
  initiatedAt: string;
  sentAt?: string;
  callbackAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface PaymentRequestPage {
  content: PaymentRequest[];
  totalElements: number;
  totalPages: number;
}

export interface PaymentDashboard {
  totalPaymentsToday: number;
  completedPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalAmountToday: number;
  totalCollections: number;
  totalDisbursements: number;
  mpesaCount: number;
  tigopesaCount: number;
  nmbCount: number;
}

export interface MobileDepositInput {
  accountId: string;
  amount: number;
  provider: PaymentProvider;
  phoneNumber: string;
  description?: string;
}

export interface MobileLoanRepaymentInput {
  loanId: string;
  amount: number;
  provider: PaymentProvider;
  phoneNumber: string;
}

export interface MobileDisbursementInput {
  loanId: string;
  amount: number;
  provider: PaymentProvider;
  phoneNumber?: string;
  bankAccountNumber?: string;
}

// ===== ESS (Employee Self-Service) Types =====

export interface Employer {
  id: string;
  employerCode: string;
  employerName: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  tinNumber?: string;
  payrollCutoffDay?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollDeduction {
  id: string;
  member: Member;
  employer: Employer;
  deductionType: string;
  savingsAccount?: SavingsAccount;
  loanAccount?: LoanAccount;
  amount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
}

export interface PayrollDeductionBatch {
  id: string;
  batchNumber: string;
  employer: Employer;
  period: string;
  totalDeductions: number;
  successfulDeductions: number;
  failedDeductions: number;
  totalAmount: number;
  status: string;
  processedBy?: string;
  processedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface EssServiceRequest {
  id: string;
  requestNumber: string;
  member: Member;
  requestType: string;
  status: string;
  amount?: number;
  description?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EssDashboard {
  memberName: string;
  memberNumber: string;
  employerName?: string;
  totalSavings: number;
  totalLoanOutstanding: number;
  activeLoans: number;
  activeSavingsAccounts: number;
  monthlyDeductions: number;
  recentRequests: EssServiceRequest[];
}

// Credit Scoring
export interface CreditScoreResult {
  id: string;
  member: Member;
  score: number;
  rating: string;
  factors?: string;
  calculatedAt?: string;
}

// Dividends
export interface DividendRun {
  id: string;
  year: number;
  method: string;
  rate?: number;
  totalAmount?: number;
  membersPaid?: number;
  status: string;
  processedBy?: string;
  processedAt?: string;
  createdAt?: string;
}

// Transaction Approval
export interface TransactionApproval {
  id: string;
  transactionType: string;
  entityId?: string;
  amount?: number;
  requestData?: string;
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  status: ApprovalStatus;
  createdAt?: string;
  updatedAt?: string;
}
