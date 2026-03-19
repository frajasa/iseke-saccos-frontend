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
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  DISBURSED = "DISBURSED",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  DEFAULTED = "DEFAULTED",
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
  TERM_DEPOSIT = "TERM_DEPOSIT",
  COMPULSORY_DEPOSIT = "COMPULSORY_DEPOSIT",
  DEMAND_DEPOSIT = "DEMAND_DEPOSIT",
  OVERDRAFT = "OVERDRAFT",
  PASSBOOK = "PASSBOOK",
}

export enum InterestCalculationMethod {
  DAILY_BALANCE = "DAILY_BALANCE",
  MINIMUM_DAILY_BALANCE = "MINIMUM_DAILY_BALANCE",
  MINIMUM_MONTHLY_BALANCE = "MINIMUM_MONTHLY_BALANCE",
  MINIMUM_QUARTERLY_BALANCE = "MINIMUM_QUARTERLY_BALANCE",
  AVERAGE_DAILY_BALANCE = "AVERAGE_DAILY_BALANCE",
  AVERAGE_MONTHLY_BALANCE = "AVERAGE_MONTHLY_BALANCE",
  THIRTY_360 = "THIRTY_360",
  FIFTY_TWO_WEEKS = "FIFTY_TWO_WEEKS",
}

export enum InterestPaymentFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BI_WEEKLY = "BI_WEEKLY",
  EVERY_FOUR_WEEKS = "EVERY_FOUR_WEEKS",
  SEMI_MONTHLY = "SEMI_MONTHLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMI_ANNUAL = "SEMI_ANNUAL",
  ANNUAL = "ANNUAL",
  AT_MATURITY = "AT_MATURITY",
}

export enum AccountSubType {
  PASSBOOK = "PASSBOOK",
  NON_PASSBOOK = "NON_PASSBOOK",
}

export enum CheckStatus {
  ISSUED = "ISSUED",
  CLEARED = "CLEARED",
  STOPPED = "STOPPED",
  VOIDED = "VOIDED",
  RETURNED = "RETURNED",
}

export enum GroupAccountType {
  ON_BOOK = "ON_BOOK",
  OFF_BOOK = "OFF_BOOK",
}

export enum TermDepositMaturityAction {
  AUTO_ROLLOVER_PRINCIPAL = "AUTO_ROLLOVER_PRINCIPAL",
  AUTO_ROLLOVER_PRINCIPAL_AND_INTEREST = "AUTO_ROLLOVER_PRINCIPAL_AND_INTEREST",
  TRANSFER_TO_SAVINGS = "TRANSFER_TO_SAVINGS",
  CLOSE = "CLOSE",
}

export enum InterestMethod {
  FLAT = "FLAT",
  DECLINING_BALANCE = "DECLINING_BALANCE",
  REDUCING_BALANCE = "REDUCING_BALANCE",
  DISCOUNTED = "DISCOUNTED",
  STEPPED = "STEPPED",
  CAPITALIZED = "CAPITALIZED",
}

export enum LoanScheduleType {
  STANDARD = "STANDARD",
  BALLOON = "BALLOON",
  FREE_FORM = "FREE_FORM",
}

export enum GroupLoanType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP_SHARED = "GROUP_SHARED",
  SOLIDARITY = "SOLIDARITY",
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
  DEFERRED = "DEFERRED",
}

export enum GuarantorStatus {
  PENDING_CONSENT = "PENDING_CONSENT",
  ACTIVE = "ACTIVE",
  DECLINED = "DECLINED",
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
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  createdAt?: string;
}

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
  roleEntity?: Role;
  permissions?: string[];
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
  shares?: number;
  tinNumber?: string;
  taxExempt?: boolean;
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
  withdrawalAmountLimit?: number;
  withdrawalAmountLimitMonthly?: number;
  excessWithdrawalFee?: number;
  prematureWithdrawalPenaltyRate?: number;
  prematureWithdrawalInterestReduction?: number;
  maturityAction?: TermDepositMaturityAction;
  postMaturityInterestRate?: number;
  termDays?: number;
  autoRenewAtCurrentRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  useBaseRate?: boolean;
  hasSteppedRates?: boolean;
  taxExemptProduct?: boolean;
  overdraftLimit?: number;
  overdraftFeeFlat?: number;
  overdraftInterestRate?: number;
  accountSubType?: AccountSubType;
  groupInsuranceFeeRate?: number;
  groupInsuranceFeeFlat?: number;
  interestCalcMethod?: InterestCalculationMethod;
  interestPayFrequency?: InterestPaymentFrequency;
  userDefinedPaymentDays?: number;
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
  overdraftLimit?: number;
  overdraftBalance?: number;
  termDepositAmount?: number;
  maturityAmount?: number;
  termDays?: number;
  maturityAction?: TermDepositMaturityAction;
  matured?: boolean;
  rolloverDate?: string;
  rolloverCount?: number;
  accountSubType?: AccountSubType;
  effectiveInterestRate?: number;
  interestRateEffectiveDate?: string;
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
  shareMultiplier?: number;
  requiredDocuments?: string;
  scheduleType?: LoanScheduleType;
  balloonPaymentPercentage?: number;
  allowsFreeSchedule?: boolean;
  capitalizeInterest?: boolean;
  hasSteppedRates?: boolean;
  allowsVariableRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  allowsDeferment?: boolean;
  maxDefermentMonths?: number;
  allowsPenaltySuspension?: boolean;
  allowsAdvanceRecalculation?: boolean;
  supportsGroupLending?: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Guarantor {
  id: string;
  loanAccount: LoanAccount;
  guarantorType?: string;
  employer?: Employer;
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
  effectiveInterestRate?: number;
  rateEffectiveDate?: string;
  penaltySuspended?: boolean;
  penaltySuspendedUntil?: string;
  defermentEndDate?: string;
  deferredInstallments?: number;
  firstPaymentDate?: string;
  paymentDayOfMonth?: number;
  scheduleType?: LoanScheduleType;
  groupLoanType?: GroupLoanType;
  loanGroup?: LoanGroup;
  approvalLevel?: number;
  autoApproved?: boolean;
  approvalHistory?: LoanApprovalHistory[];
  guarantors?: Guarantor[];
  collateral?: Collateral[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanApprovalHistory {
  id: string;
  approvalLevel: number;
  action: string;
  approvedBy?: { id: string; username: string; fullName: string };
  comments?: string;
  riskLevel?: string;
  creditScore?: number;
  createdAt: string;
}

export interface LoanGroup {
  id: string;
  groupNumber: string;
  groupName: string;
  description?: string;
  groupLoanType: GroupLoanType;
  branch?: Branch;
  maxGroupLoanAmount?: number;
  jointLiability: boolean;
  formationDate: string;
  isActive: boolean;
  members?: LoanGroupMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanGroupMember {
  id: string;
  loanGroup: LoanGroup;
  member: Member;
  liabilityShare?: number;
  roleInGroup?: string;
  joinDate: string;
  isActive: boolean;
}

export interface LoanFeeConfig {
  id: string;
  feeName: string;
  feeType: string;
  product?: LoanProduct;
  member?: Member;
  rate?: number;
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  isRefundable: boolean;
  chargeOn: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanDeferment {
  id: string;
  loanAccount: LoanAccount;
  defermentType: string;
  startDate: string;
  endDate: string;
  installmentsDeferred?: number;
  reason?: string;
  approvedBy?: string;
  createdAt?: string;
}

export interface LoanInterestRateTier {
  id: string;
  product: LoanProduct;
  fromAmount: number;
  toAmount: number;
  interestRate: number;
  sortOrder: number;
}

export interface SchedulePreviewRow {
  installmentNumber: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  remainingBalance: number;
  isBalloon?: boolean;
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
  tinNumber?: string;
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
  withdrawalAmountLimit?: number;
  withdrawalAmountLimitMonthly?: number;
  excessWithdrawalFee?: number;
  prematureWithdrawalPenaltyRate?: number;
  prematureWithdrawalInterestReduction?: number;
  maturityAction?: string;
  postMaturityInterestRate?: number;
  termDays?: number;
  autoRenewAtCurrentRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  useBaseRate?: boolean;
  hasSteppedRates?: boolean;
  taxExemptProduct?: boolean;
  overdraftLimit?: number;
  overdraftFeeFlat?: number;
  overdraftInterestRate?: number;
  accountSubType?: string;
  groupInsuranceFeeRate?: number;
  groupInsuranceFeeFlat?: number;
  interestCalcMethod?: string;
  interestPayFrequency?: string;
  userDefinedPaymentDays?: number;
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
  withdrawalAmountLimit?: number;
  withdrawalAmountLimitMonthly?: number;
  excessWithdrawalFee?: number;
  prematureWithdrawalPenaltyRate?: number;
  prematureWithdrawalInterestReduction?: number;
  maturityAction?: string;
  postMaturityInterestRate?: number;
  termDays?: number;
  autoRenewAtCurrentRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  useBaseRate?: boolean;
  hasSteppedRates?: boolean;
  taxExemptProduct?: boolean;
  overdraftLimit?: number;
  overdraftFeeFlat?: number;
  overdraftInterestRate?: number;
  accountSubType?: string;
  groupInsuranceFeeRate?: number;
  groupInsuranceFeeFlat?: number;
  interestCalcMethod?: string;
  interestPayFrequency?: string;
  userDefinedPaymentDays?: number;
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
  scheduleType?: string;
  balloonPaymentPercentage?: number;
  allowsFreeSchedule?: boolean;
  capitalizeInterest?: boolean;
  hasSteppedRates?: boolean;
  allowsVariableRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  allowsDeferment?: boolean;
  maxDefermentMonths?: number;
  allowsPenaltySuspension?: boolean;
  allowsAdvanceRecalculation?: boolean;
  supportsGroupLending?: boolean;
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
  scheduleType?: string;
  balloonPaymentPercentage?: number;
  allowsFreeSchedule?: boolean;
  capitalizeInterest?: boolean;
  hasSteppedRates?: boolean;
  allowsVariableRate?: boolean;
  interestRateGroup?: string;
  baseRateSpread?: number;
  allowsDeferment?: boolean;
  maxDefermentMonths?: number;
  allowsPenaltySuspension?: boolean;
  allowsAdvanceRecalculation?: boolean;
  supportsGroupLending?: boolean;
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
  minimumMonthlyContribution?: number;
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
  shares: number;
  shareValue: number;
  maxLoanByShares: number;
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

// Enhanced Credit Scoring
export interface EnhancedCreditScore {
  id: string;
  member: Member;
  score: number;
  rating: string;
  riskLevel: string;
  recommendation?: string;
  transactionBehaviorScore: number;
  savingsBehaviorScore: number;
  loanHistoryScore: number;
  financialStabilityScore: number;
  memberProfileScore: number;
  scoreBreakdown?: Record<string, unknown>;
  riskFlags?: string[];
  trend?: string;
  trendDelta?: number;
  previousScore?: number;
  scoringModelVersion?: string;
  calculatedAt?: string;
}

export interface ScoreHistoryEntry {
  score: number;
  rating: string;
  riskLevel?: string;
  calculatedAt: string;
}

export interface ScoreTrendAnalysis {
  currentScore: number;
  trend?: string;
  trendDelta?: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scores: ScoreHistoryEntry[];
}

export interface RiskAlert {
  id: string;
  member: Member;
  alertType: string;
  severity: string;
  alertCategory?: string;
  message: string;
  details?: Record<string, unknown>;
  relatedTransactionId?: string;
  relatedUserId?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface RiskAlertPage {
  content: RiskAlert[];
  totalElements: number;
  totalPages: number;
}

export interface LoanApprovalContext {
  creditScore: EnhancedCreditScore;
  eligible: boolean;
  maxLoanAmount?: number;
  activeAlerts: RiskAlert[];
  riskRecommendation?: string;
  requiresManualReview: boolean;
}

export interface RiskDashboard {
  totalMembers: number;
  scoredMembers: number;
  averageScore: number;
  riskDistribution: Record<string, number>;
  criticalAlerts: number;
  warningAlerts: number;
}

export interface ScoringWeightConfig {
  id: string;
  configName: string;
  weights: Record<string, unknown>;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dividends
export interface DividendRun {
  id: string;
  year: number;
  method: string;
  rate?: number;
  totalAmount?: number;
  membersPaid?: number;
  distributionMethod?: string;
  profitFigure?: number;
  totalInterestPoints?: number;
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

// ===== SACCOS Business Rules Types =====

export interface LoanEligibilityResult {
  eligible: boolean;
  maxLoanAmount: number;
  shareValue: number;
  maxByShares: number;
  monthlySalary: number;
  currentMonthlyDeductions: number;
  availableMonthlyCapacity: number;
  proposedMonthlyRepayment: number;
  reasons: string[];
}

export interface SaccosSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  entityType: string;
  entityId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  createdAt?: string;
}

export enum GuarantorType {
  MEMBER = "MEMBER",
  EMPLOYER = "EMPLOYER",
}

export enum DocumentType {
  PAYSLIP = "PAYSLIP",
  EMPLOYMENT_LETTER = "EMPLOYMENT_LETTER",
  ID_COPY = "ID_COPY",
  CHECK_OFF_LETTER = "CHECK_OFF_LETTER",
  BANK_STATEMENT = "BANK_STATEMENT",
  PASSPORT_PHOTO = "PASSPORT_PHOTO",
  UTILITY_BILL = "UTILITY_BILL",
  COLLATERAL_DOCUMENT = "COLLATERAL_DOCUMENT",
  LOAN_APPLICATION_FORM = "LOAN_APPLICATION_FORM",
  OTHER = "OTHER",
}

export enum AttachmentEntityType {
  MEMBER = "MEMBER",
  LOAN = "LOAN",
  SERVICE_REQUEST = "SERVICE_REQUEST",
}

// SRS Compliance Types
export interface AccountingPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedBy?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanOfficerPerformance {
  loanOfficer: string;
  totalLoans: number;
  activeLoans: number;
  delinquentLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  portfolioAtRisk: number;
  parPercentage: number;
}

// Multi-Currency Types
export interface Currency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol?: string;
  decimalPlaces: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  rate: number;
  effectiveDate: string;
  expiryDate?: string;
  source?: string;
  createdBy?: string;
  createdAt?: string;
}

// Transaction Limits
export interface TransactionLimit {
  id: string;
  role: string;
  transactionType: string;
  dailyLimit?: number;
  singleTransactionLimit?: number;
  monthlyLimit?: number;
  requiresApprovalAbove?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Session Restrictions
export interface SessionRestriction {
  id: string;
  role: string;
  maxConcurrentSessions?: number;
  allowedLoginStart?: string;
  allowedLoginEnd?: string;
  allowedDays?: string;
  sessionTimeoutMinutes?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Batch Import
export interface BatchImport {
  id: string;
  batchNumber: string;
  fileName: string;
  importType: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  totalAmount?: number;
  status: string;
  errorDetails?: string;
  uploadedBy?: string;
  processedBy?: string;
  uploadedAt?: string;
  processedAt?: string;
  createdAt?: string;
}

export interface BatchImportItem {
  id: string;
  rowNumber: number;
  accountNumber?: string;
  memberNumber?: string;
  amount?: number;
  transactionType?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  status: string;
  errorMessage?: string;
  transactionId?: string;
  createdAt?: string;
}

// ===== Savings Enhancement Types =====

export interface InterestRateTier {
  id: string;
  savingsProduct: SavingsProduct;
  fromAmount: number;
  toAmount: number;
  interestRate: number;
  bonusRate?: number;
  minimumDaysAtBalance?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterestRateGroup {
  id: string;
  groupName: string;
  description?: string;
  baseRate: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterestRateChangeLog {
  id: string;
  savingsProduct?: SavingsProduct;
  interestRateGroup?: InterestRateGroup;
  oldRate: number;
  newRate: number;
  effectiveDate: string;
  retroactiveFromDate?: string;
  retroactiveCorrectionAmount?: number;
  accountsAffected?: number;
  processedAt?: string;
  processedBy?: string;
  createdAt?: string;
}

export interface GroupSavingsAccount {
  id: string;
  accountNumber: string;
  groupName: string;
  description?: string;
  product: SavingsProduct;
  branch?: Branch;
  accountType: GroupAccountType;
  balance: number;
  accruedInterest: number;
  insuranceFeeBalance: number;
  status: AccountStatus;
  openingDate: string;
  members: GroupSavingsAccountMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupSavingsAccountMember {
  id: string;
  groupSavingsAccount: GroupSavingsAccount;
  member: Member;
  joinDate: string;
  sharePercentage?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CheckRegister {
  id: string;
  savingsAccount: SavingsAccount;
  checkNumber: string;
  issuedDate: string;
  amount?: number;
  payee?: string;
  status: CheckStatus;
  clearedDate?: string;
  stopDate?: string;
  stopReason?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DividendAllocation {
  id: string;
  dividendRun: DividendRun;
  member: Member;
  savingsAccount?: SavingsAccount;
  interestPoints?: number;
  allocationAmount: number;
  taxAmount: number;
  netAmount: number;
  posted: boolean;
  createdAt?: string;
}

// Cashier/Teller Sessions
export enum CashierSessionStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  RECONCILED = "RECONCILED",
}

export interface CashierSession {
  id: string;
  user: { id: string; username: string; fullName?: string };
  branch: { id: string; branchName: string };
  openingBalance: number;
  closingBalance?: number;
  cashInTotal: number;
  cashOutTotal: number;
  expectedBalance?: number;
  actualBalance?: number;
  discrepancy?: number;
  status: CashierSessionStatus;
  openedAt: string;
  closedAt?: string;
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface CashierSessionPage {
  content: CashierSession[];
  totalElements: number;
  totalPages: number;
}

export interface CashDrawerTransaction {
  id: string;
  session: { id: string };
  transaction?: { id: string; transactionNumber: string };
  cashDirection: string;
  amount: number;
  runningBalance: number;
  currencyCode?: string;
  description?: string;
  createdAt?: string;
}

// FX Positions
export interface FxPosition {
  id: string;
  currencyCode: string;
  positionAmount: number;
  averageRate?: number;
  unrealizedPnL?: number;
  lastUpdated?: string;
  branch?: { id: string; branchName: string };
}

export interface FxPositionHistory {
  id: string;
  currencyCode: string;
  positionBefore?: number;
  positionAfter?: number;
  changeAmount?: number;
  exchangeRate?: number;
  transaction?: { id: string; transactionNumber: string };
  branch?: { id: string; branchName: string };
  createdAt?: string;
}

// Branch Settlements
export interface BranchSettlement {
  id: string;
  fromBranch: { id: string; branchName: string };
  toBranch: { id: string; branchName: string };
  settlementDate: string;
  totalAmount: number;
  transactionCount: number;
  status: string;
  settledAt?: string;
  settledBy?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
}

// Fixed Assets
export interface FixedAsset {
  id: string;
  assetCode: string;
  assetName: string;
  description?: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLifeMonths: number;
  residualValue: number;
  depreciationMethod: string;
  depreciationRate?: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  location?: string;
  serialNumber?: string;
  supplier?: string;
  warrantyExpiry?: string;
  status: string;
  disposalDate?: string;
  disposalAmount?: number;
  branch: { id: string; name: string } | null;
  createdAt: string;
}

export interface FixedAssetDepreciation {
  id: string;
  periodDate: string;
  depreciationAmount: number;
  accumulatedAfter: number;
  netBookValueAfter: number;
  postedBy?: string;
  createdAt: string;
}

// Budget
export interface Budget {
  id: string;
  budgetName: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  branch?: { id: string; name: string } | null;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface BudgetLine {
  id: string;
  account: { id: string; accountCode: string; accountName: string };
  periodMonth: number;
  budgetedAmount: number;
  notes?: string;
}

// Cost Centers
export interface CostCenter {
  id: string;
  centerCode: string;
  centerName: string;
  description?: string;
  centerType: string;
  parentCenter?: { id: string; centerName: string } | null;
  branch?: { id: string; branchName: string } | null;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
}

// Joint Account Holders
export interface JointAccountHolder {
  id: string;
  savingsAccount: { id: string; accountNumber: string };
  member: { id: string; memberNumber: string; fullName: string };
  relationship: string;
  canTransact: boolean;
  canClose: boolean;
  addedDate: string;
  isActive: boolean;
}

// ALM Reports
export interface MaturityBucket {
  bucket: string;
  count: number;
  amount: number;
}

export interface ALMGap {
  bucket: string;
  loanAmount: number;
  depositAmount: number;
  gap: number;
  cumulativeGap: number;
}

export interface ALMReport {
  reportDate: string;
  loanMaturity: MaturityBucket[];
  depositMaturity: MaturityBucket[];
  gapAnalysis: ALMGap[];
  totalLoans: number;
  totalDeposits: number;
  netGap: number;
}

// Loan Insurance
export interface LoanInsurancePolicy {
  id: string;
  policyNumber: string;
  premiumAmount: number;
  maxInsuredAmount: number;
  coverageStartDate: string;
  coverageEndDate: string;
  status: string;
  claimStatus?: string | null;
  claimAmount?: number | null;
  claimDate?: string | null;
  claimReason?: string | null;
  claimProcessedDate?: string | null;
  claimProcessedBy?: string | null;
  createdAt: string;
}

// Member Custom Fields
export interface MemberCustomField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options?: string | null;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface MemberCustomFieldValue {
  id: string;
  field: MemberCustomField;
  fieldValue?: string | null;
}

// ===== Petty Cash =====
export interface PettyCashAccount {
  id: string;
  accountName: string;
  authorizedAmount: number;
  currentBalance: number;
  custodian: string;
  isActive: boolean;
  branch?: { id: string; branchName: string };
  glAccount?: { id: string; accountName: string; accountNumber: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface PettyCashTransaction {
  id: string;
  transactionDate: string;
  transactionType: string;
  amount: number;
  balanceAfter?: number;
  description?: string;
  receiptNumber?: string;
  category?: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt?: string;
  pettyCashAccount?: { id: string; accountName: string };
}

// ===== Board Members =====
export interface BoardMember {
  id: string;
  fullName: string;
  position: string;
  committee?: string;
  appointmentDate: string;
  expiryDate?: string;
  phoneNumber?: string;
  email?: string;
  nationalId?: string;
  isActive: boolean;
  notes?: string;
  member?: { id: string; memberNumber: string; firstName: string; lastName: string };
  createdAt?: string;
  updatedAt?: string;
}

// ===== TCDC Compliance =====
export interface TCDCComplianceReport {
  reportDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLoans: number;
  totalDeposits: number;
  totalMembers: number;
  totalBorrowers: number;
  capitalAdequacy: {
    coreCapital: number;
    riskWeightedAssets: number;
    capitalAdequacyRatio: number;
    minimumRequired: number;
    compliant: boolean;
  };
  liquidityRatio: {
    liquidAssets: number;
    shortTermLiabilities: number;
    liquidityRatio: number;
    minimumRequired: number;
    compliant: boolean;
  };
  sectorConcentration: {
    sector: string;
    loanCount: number;
    totalExposure: number;
    percentageOfPortfolio: number;
  }[];
  insiderLending: {
    memberName: string;
    position: string;
    loanAmount: number;
    outstandingBalance: number;
    percentageOfCoreCapital: number;
  }[];
}

// ===== Two-Factor Authentication =====
export interface TwoFactorSetup {
  secret: string;
  otpAuthUri: string;
}

// ===== Fraud Detection =====
export interface FraudInvestigation {
  id: string;
  riskAlert: RiskAlert;
  status: string;
  assignedTo?: { id: string; username: string; fullName: string };
  investigationNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FraudInvestigationPage {
  content: FraudInvestigation[];
  totalElements: number;
  totalPages: number;
}

export interface FraudDashboardStats {
  totalFraudAlerts: number;
  unresolvedFraudAlerts: number;
  openInvestigations: number;
  transactionAlerts: number;
  accountAlerts: number;
  internalAlerts: number;
}

// Loan Overdue Reminders
export interface LoanReminderLog {
  id: string;
  loanAccount?: LoanAccount;
  member?: { id: string; firstName: string; lastName: string };
  reminderType: string;
  escalationLevel: number;
  channel: string;
  recipientPhone?: string;
  recipientEmail?: string;
  message?: string;
  sentAt: string;
  daysInArrearsAtSend: number;
}

export interface LoanReminderLogPage {
  content: LoanReminderLog[];
  totalElements: number;
  totalPages: number;
}

export interface LoanEscalationSummary {
  totalOverdue: number;
  remindersToday: number;
  guarantorNoticesToday: number;
  defaultedThisMonth: number;
  upcomingPayments: number;
}
