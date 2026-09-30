// Mock data for documents, tracking events, recipients — used by the demo UI
// All names, emails, and events are fictional sample data for the Vaultsign demo.

export interface RecipientInfo {
  name: string
  email: string
  role: "SIGNER" | "CC" | "APPROVER" | "VIEWER"
  status: "PENDING" | "SENT" | "DELIVERED" | "VIEWED" | "SIGNED" | "DECLINED" | "BOUNCED"
  viewedAt?: string
  signedAt?: string
  ipAddress?: string
  geolocation?: string
  device?: string
}

export interface TrackingEvent {
  id: string
  type:
    | "EMAIL_QUEUED"
    | "EMAIL_SENT"
    | "EMAIL_DELIVERED"
    | "EMAIL_OPENED"
    | "EMAIL_CLICKED"
    | "EMAIL_BOUNCED"
    | "DOC_VIEWED"
    | "PAGE_VIEWED"
    | "FIELD_FILLED"
    | "SIGNED"
    | "DECLINED"
    | "COMPLETED"
    | "REMINDER_SENT"
  label: string
  description: string
  timestamp: string
  actor: string
  meta?: Record<string, string>
}

export interface DocumentItem {
  id: string
  name: string
  templateName: string
  category: string
  status: "DRAFT" | "SENT" | "DELIVERED" | "VIEWED" | "SIGNED" | "COMPLETED" | "DECLINED" | "EXPIRED" | "VOIDED"
  owner: string
  ownerAvatar: string
  recipients: RecipientInfo[]
  createdAt: string
  updatedAt: string
  expiresAt: string
  pageCount: number
  progress: number // 0-100
  events: TrackingEvent[]
  brevoMessageId?: string
  brevoStatus?: "delivered" | "opened" | "clicked" | "bounced" | "blocked" | "queued"
}

export const DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-001",
    name: "Q4 Vendor MSA — Acme Corp",
    templateName: "Master Service Agreement",
    category: "Legal",
    status: "VIEWED",
    owner: "Priya Nair",
    ownerAvatar: "PN",
    createdAt: "2026-09-28T09:14:00Z",
    updatedAt: "2026-09-30T07:42:00Z",
    expiresAt: "2026-10-12T23:59:00Z",
    pageCount: 12,
    progress: 60,
    brevoMessageId: "msg_brevo_8a4f2c",
    brevoStatus: "opened",
    recipients: [
      { name: "Rahul Verma", email: "rahul.verma@acmecorp.example", role: "SIGNER", status: "VIEWED", viewedAt: "2026-09-30T07:42:00Z", ipAddress: "203.0.113.42", geolocation: "Bengaluru, IN", device: "MacBook · Chrome" },
      { name: "Sarah Mitchell", email: "sarah.m@acmecorp.example", role: "SIGNER", status: "SENT", ipAddress: "", geolocation: "", device: "" },
      { name: "legal-ops@vaultsign.io", email: "legal-ops@vaultsign.io", role: "CC", status: "DELIVERED", ipAddress: "", geolocation: "", device: "" },
    ],
    events: [
      { id: "e1", type: "EMAIL_QUEUED", label: "Email queued", description: "Envelope queued in Brevo for delivery", timestamp: "2026-09-28T09:14:12Z", actor: "System", meta: { messageId: "msg_brevo_8a4f2c" } },
      { id: "e2", type: "EMAIL_SENT", label: "Email sent", description: "Brevo accepted the message for delivery", timestamp: "2026-09-28T09:14:18Z", actor: "Brevo", meta: { messageId: "msg_brevo_8a4f2c" } },
      { id: "e3", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered to recipient inbox", timestamp: "2026-09-28T09:16:42Z", actor: "Brevo", meta: { recipient: "rahul.verma@acmecorp.example" } },
      { id: "e4", type: "EMAIL_OPENED", label: "Email opened", description: "Recipient opened the notification email", timestamp: "2026-09-29T11:08:03Z", actor: "Rahul Verma", meta: { client: "Apple Mail", geo: "Bengaluru, IN" } },
      { id: "e5", type: "DOC_VIEWED", label: "Document viewed", description: "Recipient opened the signing link", timestamp: "2026-09-30T07:42:21Z", actor: "Rahul Verma", meta: { ip: "203.0.113.42", geo: "Bengaluru, IN", device: "MacBook · Chrome" } },
      { id: "e6", type: "PAGE_VIEWED", label: "Page 3 viewed", description: "Recipient spent 2m 14s on page 3", timestamp: "2026-09-30T07:44:35Z", actor: "Rahul Verma", meta: { page: "3", duration: "2m 14s" } },
    ],
  },
  {
    id: "doc-002",
    name: "Offer Letter — Software Engineer II",
    templateName: "Employment Offer Letter",
    category: "HR",
    status: "COMPLETED",
    owner: "Ananya Iyer",
    ownerAvatar: "AI",
    createdAt: "2026-09-24T14:20:00Z",
    updatedAt: "2026-09-26T10:15:00Z",
    expiresAt: "2026-10-08T23:59:00Z",
    pageCount: 3,
    progress: 100,
    brevoMessageId: "msg_brevo_3b9c11",
    brevoStatus: "opened",
    recipients: [
      { name: "Karthik Rao", email: "karthik.rao@example.com", role: "SIGNER", status: "SIGNED", viewedAt: "2026-09-25T08:00:00Z", signedAt: "2026-09-26T10:15:00Z", ipAddress: "198.51.100.7", geolocation: "Hyderabad, IN", device: "iPhone · Safari" },
    ],
    events: [
      { id: "e1", type: "EMAIL_QUEUED", label: "Email queued", description: "Envelope queued in Brevo", timestamp: "2026-09-24T14:20:00Z", actor: "System" },
      { id: "e2", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered to recipient inbox", timestamp: "2026-09-24T14:22:10Z", actor: "Brevo" },
      { id: "e3", type: "EMAIL_OPENED", label: "Email opened", description: "Recipient opened the email", timestamp: "2026-09-25T08:00:00Z", actor: "Karthik Rao" },
      { id: "e4", type: "DOC_VIEWED", label: "Document viewed", description: "Recipient opened signing link", timestamp: "2026-09-25T08:01:00Z", actor: "Karthik Rao" },
      { id: "e5", type: "SIGNED", label: "Signed", description: "Recipient applied signature", timestamp: "2026-09-26T10:15:00Z", actor: "Karthik Rao", meta: { ip: "198.51.100.7", geo: "Hyderabad, IN" } },
      { id: "e6", type: "COMPLETED", label: "Completed", description: "Envelope marked complete", timestamp: "2026-09-26T10:15:12Z", actor: "System" },
    ],
  },
  {
    id: "doc-003",
    name: "Lease — 4BHK Indiranagar",
    templateName: "Residential Lease Agreement",
    category: "Real Estate",
    status: "SENT",
    owner: "Vikram Shah",
    ownerAvatar: "VS",
    createdAt: "2026-09-29T16:30:00Z",
    updatedAt: "2026-09-29T16:30:00Z",
    expiresAt: "2026-10-13T23:59:00Z",
    pageCount: 9,
    progress: 20,
    brevoMessageId: "msg_brevo_5d2e88",
    brevoStatus: "delivered",
    recipients: [
      { name: "Meera Joshi", email: "meera.j@example.com", role: "SIGNER", status: "DELIVERED" },
      { name: "Arjun Patel", email: "arjun.p@example.com", role: "SIGNER", status: "SENT" },
    ],
    events: [
      { id: "e1", type: "EMAIL_QUEUED", label: "Email queued", description: "Queued in Brevo", timestamp: "2026-09-29T16:30:00Z", actor: "System" },
      { id: "e2", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered to first recipient", timestamp: "2026-09-29T16:32:15Z", actor: "Brevo" },
    ],
  },
  {
    id: "doc-004",
    name: "SOW — Mobile App Redesign Phase 2",
    templateName: "Statement of Work (SOW)",
    category: "Legal",
    status: "SIGNED",
    owner: "Priya Nair",
    ownerAvatar: "PN",
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-09-27T15:45:00Z",
    expiresAt: "2026-10-04T23:59:00Z",
    pageCount: 6,
    progress: 90,
    brevoMessageId: "msg_brevo_7f1a03",
    brevoStatus: "opened",
    recipients: [
      { name: "Daniel Cooper", email: "d.cooper@northpeak.example", role: "SIGNER", status: "SIGNED", signedAt: "2026-09-27T15:45:00Z", ipAddress: "192.0.2.88", geolocation: "Austin, US", device: "Windows · Edge" },
      { name: "Aisha Khan", email: "aisha.k@vaultsign.io", role: "APPROVER", status: "SIGNED", signedAt: "2026-09-27T16:02:00Z", ipAddress: "203.0.113.10", geolocation: "Mumbai, IN", device: "MacBook · Chrome" },
    ],
    events: [
      { id: "e1", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered to inbox", timestamp: "2026-09-20T11:02:00Z", actor: "Brevo" },
      { id: "e2", type: "SIGNED", label: "Signed", description: "Daniel Cooper signed", timestamp: "2026-09-27T15:45:00Z", actor: "Daniel Cooper" },
      { id: "e3", type: "SIGNED", label: "Approved", description: "Aisha Khan approved", timestamp: "2026-09-27T16:02:00Z", actor: "Aisha Khan" },
    ],
  },
  {
    id: "doc-005",
    name: "Q3 Invoice — Globex Inc",
    templateName: "Commercial Invoice",
    category: "Finance",
    status: "DECLINED",
    owner: "Riya Menon",
    ownerAvatar: "RM",
    createdAt: "2026-09-18T10:00:00Z",
    updatedAt: "2026-09-22T14:20:00Z",
    expiresAt: "2026-10-02T23:59:00Z",
    pageCount: 2,
    progress: 40,
    brevoMessageId: "msg_brevo_2c8b44",
    brevoStatus: "opened",
    recipients: [
      { name: "Globex AP", email: "ap@globex.example", role: "SIGNER", status: "DECLINED", viewedAt: "2026-09-22T14:00:00Z", ipAddress: "198.51.100.55", geolocation: "Denver, US", device: "Windows · Chrome" },
    ],
    events: [
      { id: "e1", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered", timestamp: "2026-09-18T10:02:00Z", actor: "Brevo" },
      { id: "e2", type: "EMAIL_OPENED", label: "Opened", description: "Opened by recipient", timestamp: "2026-09-22T14:00:00Z", actor: "Globex AP" },
      { id: "e3", type: "DECLINED", label: "Declined", description: "Recipient declined to sign — discrepancy in line items", timestamp: "2026-09-22T14:20:00Z", actor: "Globex AP", meta: { reason: "Line item discrepancy" } },
    ],
  },
  {
    id: "doc-006",
    name: "HIPAA Consent — Patient #8842",
    templateName: "HIPAA Consent Form",
    category: "Healthcare",
    status: "COMPLETED",
    owner: "Dr. Sanjay Rao",
    ownerAvatar: "SR",
    createdAt: "2026-09-26T09:00:00Z",
    updatedAt: "2026-09-26T09:18:00Z",
    expiresAt: "2026-10-10T23:59:00Z",
    pageCount: 4,
    progress: 100,
    brevoMessageId: "msg_brevo_9e4d77",
    brevoStatus: "opened",
    recipients: [
      { name: "Lakshmi Iyer", email: "lakshmi.i@example.com", role: "SIGNER", status: "SIGNED", signedAt: "2026-09-26T09:18:00Z", ipAddress: "203.0.113.99", geolocation: "Chennai, IN", device: "Android · Chrome" },
    ],
    events: [
      { id: "e1", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered", timestamp: "2026-09-26T09:01:00Z", actor: "Brevo" },
      { id: "e2", type: "DOC_VIEWED", label: "Viewed", description: "Patient viewed", timestamp: "2026-09-26T09:15:00Z", actor: "Lakshmi Iyer" },
      { id: "e3", type: "SIGNED", label: "Signed", description: "Patient signed", timestamp: "2026-09-26T09:18:00Z", actor: "Lakshmi Iyer" },
      { id: "e4", type: "COMPLETED", label: "Completed", description: "Envelope completed", timestamp: "2026-09-26T09:18:30Z", actor: "System" },
    ],
  },
  {
    id: "doc-007",
    name: "Sales Proposal — Northwind Retail",
    templateName: "Sales Proposal",
    category: "Sales",
    status: "DRAFT",
    owner: "Vikram Shah",
    ownerAvatar: "VS",
    createdAt: "2026-09-30T05:00:00Z",
    updatedAt: "2026-09-30T05:00:00Z",
    expiresAt: "2026-10-14T23:59:00Z",
    pageCount: 12,
    progress: 0,
    recipients: [],
    events: [
      { id: "e1", type: "EMAIL_QUEUED", label: "Draft saved", description: "Document created from template", timestamp: "2026-09-30T05:00:00Z", actor: "Vikram Shah" },
    ],
  },
  {
    id: "doc-008",
    name: "Subscription Agreement — Vaultsign Business",
    templateName: "Subscription Agreement",
    category: "Sales",
    status: "EXPIRED",
    owner: "Ananya Iyer",
    ownerAvatar: "AI",
    createdAt: "2026-08-15T12:00:00Z",
    updatedAt: "2026-08-29T23:59:00Z",
    expiresAt: "2026-08-29T23:59:00Z",
    pageCount: 6,
    progress: 50,
    brevoMessageId: "msg_brevo_1a2b33",
    brevoStatus: "delivered",
    recipients: [
      { name: "ops@clientco.example", email: "ops@clientco.example", role: "SIGNER", status: "VIEWED", viewedAt: "2026-08-20T10:00:00Z" },
    ],
    events: [
      { id: "e1", type: "EMAIL_DELIVERED", label: "Delivered", description: "Delivered", timestamp: "2026-08-15T12:02:00Z", actor: "Brevo" },
      { id: "e2", type: "DOC_VIEWED", label: "Viewed", description: "Viewed but not signed", timestamp: "2026-08-20T10:00:00Z", actor: "ops@clientco.example" },
      { id: "e3", type: "REMINDER_SENT", label: "Reminder sent", description: "Auto-reminder dispatched", timestamp: "2026-08-23T09:00:00Z", actor: "System" },
      { id: "e4", type: "REMINDER_SENT", label: "Reminder sent", description: "Final reminder dispatched", timestamp: "2026-08-27T09:00:00Z", actor: "System" },
    ],
  },
]

// ============ Analytics aggregates ============

export const ANALYTICS = {
  totalEnvelopes: 1284,
  completed: 1043,
  inProgress: 142,
  declined: 38,
  expired: 61,
  avgTimeToSignHours: 6.4,
  completionRate: 81.2,
  deliveryRate: 99.4,
  openRate: 76.8,
  // Last 14 days envelope volume (for sparkline / bar chart)
  volumeTrend: [42, 38, 51, 47, 62, 58, 71, 65, 78, 73, 89, 82, 95, 91],
  // Category breakdown
  byCategory: [
    { label: "HR", value: 412 },
    { label: "Legal", value: 318 },
    { label: "Sales", value: 224 },
    { label: "Real Estate", value: 156 },
    { label: "Finance", value: 98 },
    { label: "Healthcare", value: 47 },
    { label: "Education", value: 19 },
    { label: "Government", value: 10 },
  ],
  // Team performance leaderboard
  teamPerformance: [
    { name: "Priya Nair", avatar: "PN", sent: 184, completionRate: 92, avgHours: 4.2 },
    { name: "Ananya Iyer", avatar: "AI", sent: 156, completionRate: 88, avgHours: 5.1 },
    { name: "Vikram Shah", avatar: "VS", sent: 142, completionRate: 85, avgHours: 6.8 },
    { name: "Riya Menon", avatar: "RM", sent: 128, completionRate: 79, avgHours: 7.4 },
    { name: "Dr. Sanjay Rao", avatar: "SR", sent: 96, completionRate: 94, avgHours: 3.2 },
  ],
}

// ============ Team members ============

export const TEAM = [
  { id: "u1", name: "Aisha Khan", email: "aisha.k@vaultsign.io", role: "ORG_ADMIN", avatar: "AK", status: "ACTIVE", lastActive: "2 min ago" },
  { id: "u2", name: "Priya Nair", email: "priya.n@vaultsign.io", role: "MANAGER", avatar: "PN", status: "ACTIVE", lastActive: "12 min ago" },
  { id: "u3", name: "Ananya Iyer", email: "ananya.i@vaultsign.io", role: "USER", avatar: "AI", status: "ACTIVE", lastActive: "1 hr ago" },
  { id: "u4", name: "Vikram Shah", email: "vikram.s@vaultsign.io", role: "USER", avatar: "VS", status: "ACTIVE", lastActive: "3 hr ago" },
  { id: "u5", name: "Riya Menon", email: "riya.m@vaultsign.io", role: "USER", avatar: "RM", status: "ACTIVE", lastActive: "Yesterday" },
  { id: "u6", name: "Dr. Sanjay Rao", email: "sanjay.r@vaultsign.io", role: "USER", avatar: "SR", status: "ACTIVE", lastActive: "Yesterday" },
  { id: "u7", name: "Rohit Desai", email: "rohit.d@vaultsign.io", role: "VIEWER", avatar: "RD", status: "INVITED", lastActive: "—" },
  { id: "u8", name: "Neha Gupta", email: "neha.g@vaultsign.io", role: "USER", avatar: "NG", status: "DISABLED", lastActive: "2 weeks ago" },
]

// ============ API keys ============

export const API_KEYS = [
  { id: "k1", name: "Production Server", prefix: "vsk_live_8a4f", scopes: ["documents:write", "documents:read", "templates:read"], created: "2026-08-12", lastUsed: "2 min ago", rateLimit: 600 },
  { id: "k2", name: "Staging Webhooks", prefix: "vsk_test_3b9c", scopes: ["webhooks:write", "documents:read"], created: "2026-09-01", lastUsed: "5 hr ago", rateLimit: 60 },
  { id: "k3", name: "Mobile App (iOS)", prefix: "vsk_live_5d2e", scopes: ["documents:write", "signatures:write"], created: "2026-09-14", lastUsed: "Yesterday", rateLimit: 120 },
]

// ============ Integrations ============

export const INTEGRATIONS = [
  { id: "i1", provider: "BREVO", name: "Brevo", description: "Transactional email & delivery tracking", connected: true, status: "Active", lastSync: "2 min ago", icon: "mail" },
  { id: "i2", provider: "SLACK", name: "Slack", description: "Real-time signing notifications in channels", connected: true, status: "Active", lastSync: "8 min ago", icon: "message-square" },
  { id: "i3", provider: "HUBSPOT", name: "HubSpot CRM", description: "Sync signed documents to deal records", connected: true, status: "Active", lastSync: "1 hr ago", icon: "database" },
  { id: "i4", provider: "SALESFORCE", name: "Salesforce", description: "Attach signed envelopes to opportunities", connected: false, status: "Not connected", lastSync: "—", icon: "cloud" },
  { id: "i5", provider: "GOOGLE_DRIVE", name: "Google Drive", description: "Archive signed PDFs to a Drive folder", connected: true, status: "Active", lastSync: "12 min ago", icon: "hard-drive" },
  { id: "i6", provider: "STRIPE", name: "Stripe", description: "Billing & subscription management", connected: true, status: "Active", lastSync: "30 min ago", icon: "credit-card" },
]

// ============ Recent activity feed ============

export const RECENT_ACTIVITY = [
  { id: "a1", actor: "Karthik Rao", action: "signed", target: "Offer Letter — Software Engineer II", time: "5 min ago", type: "signed" },
  { id: "a2", actor: "Rahul Verma", action: "viewed", target: "Q4 Vendor MSA — Acme Corp", time: "18 min ago", type: "viewed" },
  { id: "a3", actor: "Daniel Cooper", action: "signed", target: "SOW — Mobile App Redesign Phase 2", time: "2 hr ago", type: "signed" },
  { id: "a4", actor: "Brevo", action: "delivered", target: "Lease — 4BHK Indiranagar", time: "3 hr ago", type: "delivered" },
  { id: "a5", actor: "Globex AP", action: "declined", target: "Q3 Invoice — Globex Inc", time: "Yesterday", type: "declined" },
  { id: "a6", actor: "Priya Nair", action: "sent", target: "Sales Proposal — Northwind Retail", time: "Yesterday", type: "sent" },
  { id: "a7", actor: "Lakshmi Iyer", action: "signed", target: "HIPAA Consent — Patient #8842", time: "Yesterday", type: "signed" },
]
