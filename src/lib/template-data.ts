// Vaultsign Template Library — 100+ categorized templates
// Each template is original content authored for the Vaultsign platform demo.

export type TemplateCategory =
  | "HR"
  | "Legal"
  | "Real Estate"
  | "Sales"
  | "Finance"
  | "Healthcare"
  | "Education"
  | "Government"

export interface TemplateItem {
  id: string
  name: string
  category: TemplateCategory
  description: string
  pages: number
  popularity: number // 0-100
  isPopular?: boolean
  isNew?: boolean
  tags: string[]
}

export const CATEGORIES: { name: TemplateCategory; icon: string; description: string; count: number }[] = [
  { name: "HR", icon: "users", description: "Onboarding, offer letters, NDAs, exit forms", count: 22 },
  { name: "Legal", icon: "scale", description: "Contracts, MOUs, vendor & partnership agreements", count: 18 },
  { name: "Real Estate", icon: "home", description: "Lease, purchase, rental, disclosure forms", count: 14 },
  { name: "Sales", icon: "trending-up", description: "Proposals, quotes, SOWs, order forms", count: 16 },
  { name: "Finance", icon: "wallet", description: "Invoices, loan agreements, purchase orders", count: 11 },
  { name: "Healthcare", icon: "heart-pulse", description: "HIPAA consent, patient intake, treatment auth", count: 9 },
  { name: "Education", icon: "graduation-cap", description: "Enrollment, parent consent, scholarship", count: 8 },
  { name: "Government", icon: "landmark", description: "RFPs, compliance forms, applications", count: 5 },
]

export const TEMPLATES: TemplateItem[] = [
  // ============ HR (22) ============
  { id: "hr-001", name: "Employment Offer Letter", category: "HR", pages: 3, popularity: 98, isPopular: true, tags: ["onboarding", "offer"], description: "Formal offer letter with compensation, start date, and benefits summary." },
  { id: "hr-002", name: "Mutual Non-Disclosure Agreement", category: "HR", pages: 4, popularity: 96, isPopular: true, tags: ["confidentiality", "nda"], description: "Two-way NDA protecting confidential information shared between parties." },
  { id: "hr-003", name: "Employee Handbook Acknowledgment", category: "HR", pages: 2, popularity: 88, tags: ["policy"], description: "Acknowledgment receipt for the employee handbook and code of conduct." },
  { id: "hr-004", name: "Independent Contractor Agreement", category: "HR", pages: 6, popularity: 91, isPopular: true, tags: ["contractor", "1099"], description: "Agreement engaging a 1099 contractor with scope, payment, IP terms." },
  { id: "hr-005", name: "Internship Agreement", category: "HR", pages: 4, popularity: 72, tags: ["intern", "student"], description: "Internship engagement with learning objectives, duration, and stipend." },
  { id: "hr-006", name: "Non-Compete Agreement", category: "HR", pages: 5, popularity: 84, tags: ["non-compete"], description: "Restrictive covenant limiting post-employment competitive activities." },
  { id: "hr-007", name: "Exit Interview Form", category: "HR", pages: 3, popularity: 65, tags: ["offboarding"], description: "Structured exit interview capturing feedback and return of assets." },
  { id: "hr-008", name: "Performance Review Form", category: "HR", pages: 4, popularity: 79, tags: ["review", "appraisal"], description: "Annual performance review with goals, ratings, and development plan." },
  { id: "hr-009", name: "Promotion Letter", category: "HR", pages: 2, popularity: 71, tags: ["promotion"], description: "Internal promotion letter with new role, compensation, and effective date." },
  { id: "hr-010", name: "Termination Notice", category: "HR", pages: 3, popularity: 58, tags: ["offboarding", "termination"], description: "Formal notice of employment termination with final settlement details." },
  { id: "hr-011", name: "Remote Work Agreement", category: "HR", pages: 4, popularity: 82, isNew: true, tags: ["remote", "wfh"], description: "Work-from-home arrangement covering equipment, hours, and security." },
  { id: "hr-012", name: "Confidentiality Agreement (Employee)", category: "HR", pages: 3, popularity: 77, tags: ["confidentiality"], description: "Employee confidentiality and IP assignment agreement." },
  { id: "hr-013", name: "PTO Request Form", category: "HR", pages: 1, popularity: 69, tags: ["leave", "pto"], description: "Paid time off request with manager approval workflow." },
  { id: "hr-014", name: "Expense Reimbursement Form", category: "HR", pages: 2, popularity: 74, tags: ["expense"], description: "Employee expense reimbursement with itemized entries and receipts." },
  { id: "hr-015", name: "Benefits Enrollment Form", category: "HR", pages: 5, popularity: 76, tags: ["benefits"], description: "Annual benefits enrollment covering health, dental, vision, 401(k)." },
  { id: "hr-016", name: "Background Check Authorization", category: "HR", pages: 3, popularity: 80, tags: ["screening"], description: "FCRA-compliant background check consent and disclosure." },
  { id: "hr-017", name: "Reference Check Form", category: "HR", pages: 2, popularity: 55, tags: ["hiring"], description: "Reference verification with structured questions and consent." },
  { id: "hr-018", name: "Training Completion Certificate", category: "HR", pages: 1, popularity: 62, tags: ["training"], description: "Certificate acknowledging completion of mandatory training." },
  { id: "hr-019", name: "Employee Equipment Agreement", category: "HR", pages: 2, popularity: 67, tags: ["equipment"], description: "Laptop and equipment checkout with return conditions." },
  { id: "hr-020", name: "Grievance Form", category: "HR", pages: 3, popularity: 48, tags: ["grievance"], description: "Employee grievance submission with HR investigation workflow." },
  { id: "hr-021", name: "Stock Option Grant Letter", category: "HR", pages: 5, popularity: 73, isNew: true, tags: ["equity", "options"], description: "ESOP grant letter with vesting schedule and exercise terms." },
  { id: "hr-022", name: "Volunteer Agreement", category: "HR", pages: 3, popularity: 51, tags: ["volunteer"], description: "Volunteer engagement agreement with waiver and liability terms." },

  // ============ Legal (18) ============
  { id: "lg-001", name: "Master Service Agreement", category: "Legal", pages: 12, popularity: 95, isPopular: true, tags: ["msa", "b2b"], description: "Master service agreement governing ongoing B2B engagements." },
  { id: "lg-002", name: "Statement of Work (SOW)", category: "Legal", pages: 6, popularity: 90, isPopular: true, tags: ["sow", "b2b"], description: "Project-specific SOW with deliverables, milestones, and pricing." },
  { id: "lg-003", name: "Vendor Agreement", category: "Legal", pages: 8, popularity: 85, tags: ["vendor"], description: "Vendor onboarding agreement with SLAs and compliance terms." },
  { id: "lg-004", name: "Partnership Agreement", category: "Legal", pages: 10, popularity: 78, tags: ["partnership"], description: "Business partnership agreement covering profit sharing and governance." },
  { id: "lg-005", name: "Joint Venture Agreement", category: "Legal", pages: 11, popularity: 64, tags: ["jv"], description: "Joint venture formation with contributions and profit distribution." },
  { id: "lg-006", name: "IP Assignment Agreement", category: "Legal", pages: 5, popularity: 81, tags: ["ip"], description: "Transfer of intellectual property rights from creator to company." },
  { id: "lg-007", name: "Software License Agreement", category: "Legal", pages: 9, popularity: 88, isPopular: true, tags: ["license", "software"], description: "End-user software license with usage restrictions and warranties." },
  { id: "lg-008", name: "Reseller Agreement", category: "Legal", pages: 7, popularity: 66, tags: ["reseller"], description: "Authorized reseller terms with territory and pricing." },
  { id: "lg-009", name: "Settlement Agreement", category: "Legal", pages: 6, popularity: 70, tags: ["settlement"], description: "Dispute settlement with release of claims and confidentiality." },
  { id: "lg-010", name: "Letter of Intent (LOI)", category: "Legal", pages: 4, popularity: 75, tags: ["loi"], description: "Non-binding letter of intent outlining proposed transaction terms." },
  { id: "lg-011", name: "Memorandum of Understanding", category: "Legal", pages: 5, popularity: 72, tags: ["mou"], description: "MOU for inter-organizational collaboration and intent." },
  { id: "lg-012", name: "Power of Attorney", category: "Legal", pages: 3, popularity: 68, tags: ["poa"], description: "Durable power of attorney authorizing an agent to act on behalf." },
  { id: "lg-013", name: "Indemnity Agreement", category: "Legal", pages: 4, popularity: 60, tags: ["indemnity"], description: "Hold-harmless agreement shifting liability between parties." },
  { id: "lg-014", name: "Subcontractor Agreement", category: "Legal", pages: 7, popularity: 67, tags: ["subcontractor"], description: "Subcontractor engagement under a prime contract with flow-downs." },
  { id: "lg-015", name: "Data Processing Agreement", category: "Legal", pages: 8, popularity: 84, isNew: true, tags: ["gdpr", "dpa"], description: "GDPR-compliant DPA defining processor and controller obligations." },
  { id: "lg-016", name: "Terms of Service", category: "Legal", pages: 9, popularity: 86, tags: ["tos"], description: "Website and product terms of service with usage rules and disclaimers." },
  { id: "lg-017", name: "Privacy Policy", category: "Legal", pages: 7, popularity: 89, tags: ["privacy"], description: "Privacy policy covering data collection, use, and user rights." },
  { id: "lg-018", name: "Non-Binding Term Sheet", category: "Legal", pages: 4, popularity: 73, tags: ["termsheet"], description: "Investment term sheet outlining valuation, round, and key terms." },

  // ============ Real Estate (14) ============
  { id: "re-001", name: "Residential Lease Agreement", category: "Real Estate", pages: 9, popularity: 94, isPopular: true, tags: ["lease", "residential"], description: "Residential lease with rent, term, deposit, and house rules." },
  { id: "re-002", name: "Commercial Lease Agreement", category: "Real Estate", pages: 14, popularity: 80, tags: ["lease", "commercial"], description: "Commercial property lease with CAM, escalation, and renewal terms." },
  { id: "re-003", name: "Purchase Agreement", category: "Real Estate", pages: 11, popularity: 87, isPopular: true, tags: ["purchase"], description: "Real estate purchase agreement with contingencies and closing terms." },
  { id: "re-004", name: "Rental Application", category: "Real Estate", pages: 4, popularity: 76, tags: ["rental"], description: "Tenant rental application with consent for screening." },
  { id: "re-005", name: "Property Disclosure Statement", category: "Real Estate", pages: 6, popularity: 70, tags: ["disclosure"], description: "Seller's disclosure of known material defects and conditions." },
  { id: "re-006", name: "Move-In Inspection Checklist", category: "Real Estate", pages: 5, popularity: 65, tags: ["inspection"], description: "Condition inspection documenting property state at move-in." },
  { id: "re-007", name: "Lease Termination Notice", category: "Real Estate", pages: 2, popularity: 58, tags: ["termination"], description: "Notice of lease termination with vacate date and conditions." },
  { id: "re-008", name: "Sublease Agreement", category: "Real Estate", pages: 7, popularity: 62, tags: ["sublease"], description: "Sublease between original tenant and new subtenant." },
  { id: "re-009", name: "Option to Purchase", category: "Real Estate", pages: 5, popularity: 55, tags: ["option"], description: "Option granting the right to purchase property within a defined period." },
  { id: "re-010", name: "Property Management Agreement", category: "Real Estate", pages: 8, popularity: 68, tags: ["management"], description: "Engagement of a property manager with duties and fees." },
  { id: "re-011", name: "Escrow Instructions", category: "Real Estate", pages: 4, popularity: 52, tags: ["escrow"], description: "Instructions to escrow agent for handling transaction funds." },
  { id: "re-012", name: "Mortgage Application", category: "Real Estate", pages: 10, popularity: 74, tags: ["mortgage"], description: "Residential mortgage application with financial disclosures." },
  { id: "re-013", name: "Lease Renewal Form", category: "Real Estate", pages: 3, popularity: 60, tags: ["renewal"], description: "Lease renewal with updated rent and term." },
  { id: "re-014", name: "Co-Ownership Agreement", category: "Real Estate", pages: 7, popularity: 50, isNew: true, tags: ["co-ownership"], description: "Co-ownership terms for shared real property interests." },

  // ============ Sales (16) ============
  { id: "sl-001", name: "Sales Proposal", category: "Sales", pages: 12, popularity: 92, isPopular: true, tags: ["proposal"], description: "Sales proposal with scope, pricing, timeline, and case studies." },
  { id: "sl-002", name: "Price Quote", category: "Sales", pages: 3, popularity: 88, isPopular: true, tags: ["quote"], description: "Itemized price quote with validity and payment terms." },
  { id: "sl-003", name: "Sales Order", category: "Sales", pages: 4, popularity: 85, tags: ["order"], description: "Sales order confirming items, quantities, and delivery." },
  { id: "sl-004", name: "Purchase Order", category: "Sales", pages: 3, popularity: 83, tags: ["po"], description: "Buyer-issued purchase order with authorization and terms." },
  { id: "sl-005", name: "Sales Contract", category: "Sales", pages: 8, popularity: 79, tags: ["contract"], description: "Sales contract governing goods or services delivery and payment." },
  { id: "sl-006", name: "Channel Partner Agreement", category: "Sales", pages: 9, popularity: 64, tags: ["partner"], description: "Channel partner engagement with margins and territory." },
  { id: "sl-007", name: "Referral Agreement", category: "Sales", pages: 4, popularity: 71, tags: ["referral"], description: "Referral fee arrangement for introduced business." },
  { id: "sl-008", name: "Dealer Agreement", category: "Sales", pages: 7, popularity: 60, tags: ["dealer"], description: "Authorized dealer appointment with performance targets." },
  { id: "sl-009", name: "Distributor Agreement", category: "Sales", pages: 8, popularity: 66, tags: ["distributor"], description: "Distribution rights with exclusivity and minimum volumes." },
  { id: "sl-010", name: "Quote Approval Form", category: "Sales", pages: 2, popularity: 73, tags: ["approval"], description: "Internal quote approval workflow with discount authorization." },
  { id: "sl-011", name: "Customer Onboarding Form", category: "Sales", pages: 5, popularity: 78, isNew: true, tags: ["onboarding"], description: "New customer onboarding with account setup and preferences." },
  { id: "sl-012", name: "Subscription Agreement", category: "Sales", pages: 6, popularity: 86, isPopular: true, tags: ["subscription", "saas"], description: "SaaS subscription agreement with term, auto-renewal, and SLAs." },
  { id: "sl-013", name: "Change Order Form", category: "Sales", pages: 3, popularity: 69, tags: ["change"], description: "Change order modifying scope, price, or timeline of a project." },
  { id: "sl-014", name: "Lost Deal Analysis", category: "Sales", pages: 2, popularity: 45, tags: ["analysis"], description: "Post-mortem on a lost opportunity with learnings." },
  { id: "sl-015", name: "Sales Commission Statement", category: "Sales", pages: 3, popularity: 57, tags: ["commission"], description: "Sales rep commission statement with deals and payouts." },
  { id: "sl-016", name: "Customer Satisfaction Survey", category: "Sales", pages: 4, popularity: 62, tags: ["survey"], description: "Post-purchase CSAT survey with NPS scoring." },

  // ============ Finance (11) ============
  { id: "fn-001", name: "Commercial Invoice", category: "Finance", pages: 2, popularity: 90, isPopular: true, tags: ["invoice"], description: "Commercial invoice with line items, tax, and payment terms." },
  { id: "fn-002", name: "Loan Agreement", category: "Finance", pages: 8, popularity: 82, tags: ["loan"], description: "Term loan agreement with amortization and default provisions." },
  { id: "fn-003", name: "Promissory Note", category: "Finance", pages: 3, popularity: 75, tags: ["note"], description: "Unconditional promise to pay a specified sum on demand or at a date." },
  { id: "fn-004", name: "Line of Credit Agreement", category: "Finance", pages: 7, popularity: 68, tags: ["credit"], description: "Revolving line of credit with draw and repayment terms." },
  { id: "fn-005", name: "Purchase Order Financing", category: "Finance", pages: 6, popularity: 55, tags: ["financing"], description: "Short-term financing of purchase orders with repayment terms." },
  { id: "fn-006", name: "Equity Financing Term Sheet", category: "Finance", pages: 5, popularity: 72, isNew: true, tags: ["equity"], description: "Equity round term sheet with valuation and investor rights." },
  { id: "fn-007", name: "Convertible Note Agreement", category: "Finance", pages: 6, popularity: 70, tags: ["convertible"], description: "Convertible note with discount, cap, and maturity." },
  { id: "fn-008", name: "Financial Disclosure Form", category: "Finance", pages: 7, popularity: 63, tags: ["disclosure"], description: "Financial disclosures for credit or investment underwriting." },
  { id: "fn-009", name: "Budget Approval Form", category: "Finance", pages: 3, popularity: 67, tags: ["budget"], description: "Departmental budget approval with line-item authorization." },
  { id: "fn-010", name: "Tax Withholding Form (W-4)", category: "Finance", pages: 2, popularity: 80, tags: ["tax"], description: "Employee tax withholding certificate with allowances." },
  { id: "fn-011", name: "Vendor Payment Authorization", category: "Finance", pages: 2, popularity: 58, tags: ["payment"], description: "Authorization to release payment to a vendor against an invoice." },

  // ============ Healthcare (9) ============
  { id: "hc-001", name: "HIPAA Consent Form", category: "Healthcare", pages: 4, popularity: 88, isPopular: true, tags: ["hipaa", "consent"], description: "HIPAA-compliant authorization for use and disclosure of PHI." },
  { id: "hc-002", name: "Patient Intake Form", category: "Healthcare", pages: 6, popularity: 84, isPopular: true, tags: ["intake"], description: "Patient intake capturing demographics, history, and insurance." },
  { id: "hc-003", name: "Treatment Authorization", category: "Healthcare", pages: 3, popularity: 79, tags: ["treatment"], description: "Informed consent authorizing a specified treatment plan." },
  { id: "hc-004", name: "Medical Records Release", category: "Healthcare", pages: 4, popularity: 76, tags: ["records"], description: "Authorization to release medical records to a designated party." },
  { id: "hc-005", name: "Telemedicine Consent", category: "Healthcare", pages: 3, popularity: 73, isNew: true, tags: ["telehealth"], description: "Consent for telehealth consultation with risk acknowledgments." },
  { id: "hc-006", name: "Advance Directive", category: "Healthcare", pages: 6, popularity: 64, tags: ["directive"], description: "Advance healthcare directive with living will and proxy." },
  { id: "hc-007", name: "Insurance Claim Form", category: "Healthcare", pages: 5, popularity: 70, tags: ["insurance"], description: "Health insurance claim with diagnosis and procedure codes." },
  { id: "hc-008", name: "Caregiver Authorization", category: "Healthcare", pages: 3, popularity: 58, tags: ["caregiver"], description: "Authorization for a non-parent caregiver to make decisions." },
  { id: "hc-009", name: "Clinical Trial Consent", category: "Healthcare", pages: 8, popularity: 55, tags: ["trial"], description: "IRB-approved informed consent for participation in a clinical trial." },

  // ============ Education (8) ============
  { id: "ed-001", name: "Student Enrollment Form", category: "Education", pages: 5, popularity: 82, isPopular: true, tags: ["enrollment"], description: "Student enrollment with program, payment, and emergency contacts." },
  { id: "ed-002", name: "Parental Consent Form", category: "Education", pages: 2, popularity: 78, tags: ["consent"], description: "Parental consent for activities, media use, and field trips." },
  { id: "ed-003", name: "Scholarship Application", category: "Education", pages: 4, popularity: 74, tags: ["scholarship"], description: "Scholarship application with essay prompt and references." },
  { id: "ed-004", name: "Field Trip Permission Slip", category: "Education", pages: 2, popularity: 70, tags: ["field-trip"], description: "Permission slip and liability waiver for off-campus activities." },
  { id: "ed-005", name: "Code of Conduct Acknowledgment", category: "Education", pages: 4, popularity: 68, tags: ["conduct"], description: "Student acknowledgment of the institutional code of conduct." },
  { id: "ed-006", name: "Transfer Certificate", category: "Education", pages: 2, popularity: 60, tags: ["transfer"], description: "Academic transfer certificate with credits and standing." },
  { id: "ed-007", name: "Internship Offer Letter", category: "Education", pages: 3, popularity: 65, isNew: true, tags: ["internship"], description: "Internship offer from an institution to a student." },
  { id: "ed-008", name: "Grade Appeal Form", category: "Education", pages: 3, popularity: 50, tags: ["appeal"], description: "Formal grade appeal with supporting rationale and evidence." },

  // ============ Government (5) ============
  { id: "gv-001", name: "Request for Proposal (RFP)", category: "Government", pages: 15, popularity: 80, isPopular: true, tags: ["rfp"], description: "Formal RFP with scope, evaluation criteria, and submission rules." },
  { id: "gv-002", name: "Request for Quotation (RFQ)", category: "Government", pages: 8, popularity: 72, tags: ["rfq"], description: "RFQ seeking priced quotes for specified goods or services." },
  { id: "gv-003", name: "Grant Application", category: "Government", pages: 12, popularity: 76, tags: ["grant"], description: "Grant application with budget, narrative, and compliance." },
  { id: "gv-004", name: "Permit Application", category: "Government", pages: 5, popularity: 64, tags: ["permit"], description: "Permit application with site details and certifications." },
  { id: "gv-005", name: "Compliance Certification", category: "Government", pages: 4, popularity: 58, isNew: true, tags: ["compliance"], description: "Self-certification of regulatory compliance with attestations." },
]

// Helper: total template count
export const TOTAL_TEMPLATES = TEMPLATES.length
