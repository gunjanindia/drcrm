# Digital Ranchi CRM — Complete Team User Manual & Operational SOP

Welcome to the official **Digital Ranchi CRM & Local Growth Engine** training manual. This manual serves as the standard operating procedure (SOP) to onboard and train team members across Sales, Operations, Account Management, Delivery, and Leadership.

---

## Table of Contents
1. [Platform Overview & Core Philosophy](#1-platform-overview--core-philosophy)
2. [Role-Wise Scope of Work (SOW) & Daily Responsibilities](#2-role-wise-scope-of-work-sow--daily-responsibilities)
3. [Module-by-Module Navigation & Feature Guide](#3-module-by-module-navigation--feature-guide)
   * [3.1 Public Digital Presence Scanner (`/audit`)](#31-public-digital-presence-scanner-audit)
   * [3.2 Lead Ingestion & Pitch Dispatcher (`/app/leads`)](#32-lead-ingestion--pitch-dispatcher-appleads)
   * [3.3 Sales & Deal Pipeline Kanban (`/app/pipeline`)](#33-sales--deal-pipeline-kanban-apppipeline)
   * [3.4 Client Directory & 360° Account Hub (`/app/clients`)](#34-client-directory--360-account-hub-appclients)
   * [3.5 Google Business Profile (GBP) & Local SEO Center (`/app/gbp`)](#35-google-business-profile-gbp--local-seo-center-appgbp)
   * [3.6 Work Management & Team Task Allocation (`/app/tasks`)](#36-work-management--team-task-allocation-apptasks)
   * [3.7 Recurring Service Engine & Automation (`/app/recurring`)](#37-recurring-service-engine--automation-apprecurring)
   * [3.8 Billing, Non-GST / GST & Invoicing (`/app/billing`)](#38-billing-non-gst--gst--invoicing-appbilling)
   * [3.9 Gemini AI Operations & Report Generator (`/app/ai`)](#39-gemini-ai-operations--report-generator-appai)
   * [3.10 Client Self-Service Portal (`/portal`)](#310-client-self-service-portal-portal)
4. [Step-by-Step Standard Operating Procedures (SOPs)](#4-step-by-step-standard-operating-procedures-sops)
   * [SOP 1: Qualifying & Pitching a New Lead](#sop-1-qualifying--pitching-a-new-lead)
   * [SOP 2: Converting a Lead to an Active Client](#sop-2-converting-a-lead-to-an-active-client)
   * [SOP 3: Assigning & Executing Deliverable Tasks](#sop-3-assigning--executing-deliverable-tasks)
   * [SOP 4: Generating Monthly Performance Reports via Gemini](#sop-4-generating-monthly-performance-reports-via-gemini)
5. [Service Packages & Pricing Matrix](#5-service-packages--pricing-matrix)
6. [Best Practices, Pro-Tips & Anti-Abuse Guidelines](#6-best-practices-pro-tips--anti-abuse-guidelines)

---

## 1. Platform Overview & Core Philosophy

**Digital Ranchi** is purpose-built for the local business ecosystem of Jharkhand (Ranchi, Jamshedpur, Dhanbad, Bokaro). It bridges the gap between high-intent local customer search on Google Maps and small-and-medium businesses (clinics, salons, restaurants, retail shops, coaching centers, auto workshops).

### Core Pillars:
1. **Live Google Places Verification Engine**: Evaluates Google Maps presence with zero fake fallback data.
2. **Grounded AI Intelligence**: Gemini AI generates pitches and monthly client reports using verified metrics without hallucination.
3. **1-Click Sales Outreach**: Pre-filled WhatsApp and formal email proposals tailored to specific business gaps.
4. **Strict SLA & Task Routing**: Automatically distributes 7-day onboarding deliverables to design and content specialists.

---

## 2. Role-Wise Scope of Work (SOW) & Daily Responsibilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN / LEADERSHIP                        │
│            • Strategic Growth • Revenue Monitoring • Team Allocations  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   SALES TEAM     │       │ OPERATIONS TEAM  │       │  ACCOUNT MGMT    │
│ • Lead Audits    │       │ • Task Execution │       │ • Client Health  │
│ • WhatsApp Pitch │       │ • Design & Posts │       │ • Renewals & QA  │
│ • Deal Closing   │       │ • Review Stand QR│       │ • Gemini Reports │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### 2.1 Managing Director & Super Admin (`SUPER_ADMIN`)
* **Primary Scope**: Strategic oversight, revenue monitoring, team utilization, pricing, and system integrity.
* **Daily Checklist**:
  1. Review the executive metrics on the main dashboard (`/app`).
  2. Inspect Monthly Recurring Revenue (MRR), collection rates, and pipeline value.
  3. Ensure task SLAs across delivery executives are under 24 hours.

### 2.2 Sales Manager & Sales Executives (`SALES_MANAGER`, `SALES_EXECUTIVE`)
* **Primary Scope**: Inbound/outbound lead qualification, audit generation, WhatsApp/Email pitch dispatch, and pipeline progression.
* **Daily Checklist**:
  1. Open `/app/leads` and filter by **`NEW`** or **`AUDIT`**.
  2. For every newly scanned inquiry, click **`Pitch Report`**.
  3. Dispatch the personalized **WhatsApp Script** or **Formal Email Proposal** in 1 click.
  4. Advance qualified inquiries across the Kanban Pipeline (`/app/pipeline`).
  5. When payment is confirmed, click **`Convert to Client`** to instantly instantiate the 7-day onboarding project.

### 2.3 Operations Manager & Delivery Executives (`OPERATIONS_MANAGER`, `DELIVERY_EXECUTIVE`)
* **Primary Scope**: Task fulfillment, Google Business Profile optimization, Review QR Stand printing/delivery, and weekly geotagged photo uploads.
* **Daily Checklist**:
  1. Open `/app/tasks` and filter by your name using the **"All Team Members"** dropdown.
  2. Prioritize tasks tagged with **`URGENT`** or **`HIGH`** priority.
  3. Upon completing a task (e.g. creating a festive GBP banner), upload proof and click **`Mark Done`**.
  4. If client feedback is required, move status to **`CLIENT_APPROVAL`**.

### 2.4 Account Managers (`ACCOUNT_MANAGER`)
* **Primary Scope**: Client success, monthly performance reports, escalation resolution, and retention.
* **Daily Checklist**:
  1. Review Client Health Scores on `/app/clients` (pay urgent attention to **`RED`** or **`YELLOW`** accounts).
  2. Open `/app/ai` and generate monthly performance reports using the Gemini AI Engine.
  3. Answer support tickets raised in the Client Portal (`/portal/tickets`).

### 2.5 Finance & Billing (`FINANCE`)
* **Primary Scope**: Bill of Supply generation, Non-GST / GST tax management, Razorpay payment verification, and renewal tracking.
* **Daily Checklist**:
  1. Check `/app/billing` for invoices in **`ISSUED`** status due for renewal.
  2. Reconcile captured Razorpay payment webhooks against issued invoices.

---

## 3. Module-by-Module Navigation & Feature Guide

### 3.1 Public Digital Presence Scanner (`/audit`)
* **Purpose**: Customer-facing lead acquisition tool that analyzes local Google Maps indexability in real time.
* **Key Capabilities**:
  * **Lead-Gated Form**: Requires Business Name, Owner/Contact Name, and WhatsApp Phone Number.
  * **Multi-Branch Disambiguation**: If multiple stores match the name (e.g. *Glow Heaven Ladies Beauty Parlour* with multiple branches), an interactive branch selector lets the user pick their exact street address and rating.
  * **"Profile Not Found" Diagnosis**: If unindexed, explains why local customers cannot find them and recommends the **Starter Verification Package (₹499)**.
  * **Anti-Abuse Protection**: Automatically rate-limited to max 5 audits per IP/hour.

---

### 3.2 Lead Ingestion & Pitch Dispatcher (`/app/leads`)
* **Purpose**: Centralized inbox of every business inquiry captured via website audits, WhatsApp, or field sales.
* **Key Capabilities**:
  * **1-Click "Pitch Report" Button**: Opens an AI-powered sales pitch modal.
  * **Recommended Package Justification**: Automatically pairs the business score with the ideal package (*Starter ₹499*, *Growth ₹999*, or *Retainer ₹2,499*).
  * **WhatsApp Dispatch**: Launches `https://wa.me/{phone}` pre-filled with the audit summary and 1-page action plan.
  * **Email Proposal**: Formats a professional business proposal email with pre-filled subject and deliverables.
  * **Convert Lead to Client**: Instantly creates the Client 360 profile and kicks off the 7-day onboarding project.

---

### 3.3 Sales & Deal Pipeline Kanban (`/app/pipeline`)
* **Purpose**: Visual Kanban pipeline showing deals moving across stages.
* **Stages**:
  1. `NEW` (Initial inquiry)
  2. `CONTACTED` (WhatsApp / Email pitch dispatched)
  3. `QUALIFIED` (Owner showed interest)
  4. `AUDIT` (1-Page Audit review session scheduled)
  5. `PROPOSAL` (Package proposal shared)
  6. `NEGOTIATION` (Payment terms / custom requests)
  7. `WON` (Converted to active client)
  8. `LOST` (Not interested / Closed)
* **Quick Advance Button**: Advance any lead to the next stage with a single click.

---

### 3.4 Client Directory & 360° Account Hub (`/app/clients` & `/app/clients/[id]`)
* **Purpose**: Complete relationship management for every active business client.
* **Key Capabilities**:
  * **Client Health Monitor**: Visual flags (**GREEN**, **YELLOW**, **RED**) indicating renewal risk, unresolved reviews, or SLA delays.
  * **Add Client Account**: Directly onboard new clients and assign their package.
  * **Client 360° Hub Tabs**:
    * *Overview*: Quick contact info, package, monthly revenue, GBP score.
    * *Services & Package*: Included deliverables and renewal dates.
    * *Tasks*: Active operational deliverables.
    * *Approvals*: Creatives/post proofs awaiting client sign-off.
    * *Invoices*: Billing history and Razorpay payment links.
    * *Tickets*: Support and change requests.
    * *AI & Upsell*: Grounded upsell recommendations generated by Gemini.

---

### 3.5 Google Business Profile (GBP) & Local SEO Center (`/app/gbp`)
* **Purpose**: Track live Google Maps keyword rankings, review momentum, and profile health scores.
* **Key Metrics**:
  * Top-3 Map Pack keyword positions (e.g. *"best salon in ranchi"*, *"dentist near me"*).
  * 30-Day review growth velocity.
  * Photo gallery count and geotagged uploads.
  * Category and NAP (Name-Address-Phone) consistency checker.

---

### 3.6 Work Management & Team Task Allocation (`/app/tasks`)
* **Purpose**: Internal operations board for deliverable fulfillment.
* **Key Capabilities**:
  * **Interactive Assignee Dropdown**: Reassign any task to any team member inline.
  * **"Assign New Task" Modal**: Allocate deliverables to actual client accounts or pipeline leads, set priority (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), and choose due dates.
  * **Filter by Team Member**: Filter the entire task board by a single team member to balance workloads.
  * **Quick "Mark Done"**: Instantly mark deliverables complete with timestamp logging.

---

### 3.7 Recurring Service Engine & Automation (`/app/recurring`)
* **Purpose**: Automates recurring monthly deliverables for retainer clients.
* **Standard Recurring Deliverables**:
  * Monthly Google Maps geotagged photo uploads (10–20 photos).
  * Monthly citation building on local directories (15+ portals).
  * Bi-weekly review response audits.
  * Monthly performance report drafting.

---

### 3.8 Billing, Non-GST / GST & Invoicing (`/app/billing`)
* **Purpose**: Complete financial invoicing compliant with Indian tax laws.
* **Tax Modes**:
  * **Bill of Supply (Non-GST)**: SAC Code `998313` with 0% GST (for turnover under ₹20 Lakhs).
  * **Tax Invoice (GST)**: CGST 9% + SGST 9% (Intra-state Jharkhand) or IGST 18% (Inter-state).
* **Payment Gateways**: Integrated with Razorpay UPI, NetBanking, and Cards.

---

### 3.9 Gemini AI Operations & Report Generator (`/app/ai`)
* **Purpose**: Grounded AI engine that drafts executive performance reports.
* **Output Sections**:
  1. *Executive Summary*: Professional overview of monthly Google Maps visibility gains.
  2. *Key Accomplishments*: Review count gains, top keyword rankings, and geotagged photo uploads.
  3. *Next Month Roadmap*: Action plan to maintain Top-3 Map Pack dominance.

---

### 3.10 Client Self-Service Portal (`/portal`)
* **Purpose**: Client-facing portal where business owners log in to review deliverables, approve designs, download invoices, and raise support tickets.
* **Subpages**:
  * `/portal/deliverables`: Review and approve social creatives and NFC Review QR stand proofs.
  * `/portal/invoices`: Download PDF Bills of Supply and pay 1-click Razorpay renewals.
  * `/portal/reports`: View monthly performance and review analytics.
  * `/portal/tasks`: Check live progress on their service deliverables.
  * `/portal/tickets`: Submit service change requests (e.g. updating Sunday hours).

---

## 4. Step-by-Step Standard Operating Procedures (SOPs)

### SOP 1: Qualifying & Pitching a New Lead
1. Open **`/audit`** (or receive inbound scan).
2. If multiple Google locations are found, select the exact branch address.
3. Review the **Presence Score** (e.g. `73/100`).
4. Navigate to **`/app/leads`** and find the business at the top of the table.
5. Click **`Pitch Report`**.
6. Switch between **WhatsApp Script** and **Email Proposal**.
7. Click **`Send on WhatsApp`** or **`Send Email`** — the lead status automatically updates to **`CONTACTED`**.

---

### SOP 2: Converting a Lead to an Active Client
1. When the business owner agrees to start, go to **`/app/leads`** or **`/app/pipeline`**.
2. Click **`Convert to Client`**.
3. Select the starting package (*Starter ₹499*, *Growth ₹999*, or *Premium Retainer ₹2,499/mo*).
4. Click **`Confirm Conversion`**.
5. The CRM will automatically:
   * Create the Client 360 profile.
   * Spawn a 7-day onboarding project.
   * Assign Account Manager **Neha Pandey**.
   * Schedule initial setup tasks in `/app/tasks`.

---

### SOP 3: Assigning & Executing Deliverable Tasks
1. Go to **`/app/tasks`**.
2. Click **`Assign New Task`**.
3. Select the target **Client / Business Account** from the dropdown.
4. Select the responsible team member (e.g. **Rohan Gupta** for Design/GBP, **Anjali Kumari** for Content).
5. Set priority to **`HIGH`** or **`URGENT`** and pick the deadline.
6. Click **`Assign Task`**.
7. The assigned team member executes the work, uploads proof, and clicks **`Mark Done`**.

---

### SOP 4: Generating Monthly Performance Reports via Gemini
1. Open **`/app/ai`**.
2. Select the client account from the dropdown.
3. Click **`Draft Monthly Report via Gemini`**.
4. Review the generated Executive Summary, Achievements, and Next Month Roadmap.
5. Click **`Publish to Client Portal`** so the business owner can view it inside their portal.

---

## 5. Service Packages & Pricing Matrix

| Package Name | Price | Billing | Target Business | Key Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Starter Verification** | **₹499** | One-Time | Unlisted / Unverified Clinics & Shops | Google Maps claim & postcard verification, address correction, category setup |
| **Growth Setup** | **₹999** | Monthly | Established local businesses needing walk-ins | Review QR Stand (Printable/Acrylic), 1-page mobile mini-site, local citations, Map Pack keyword optimization |
| **Premium Retainer** | **₹2,499** | Monthly | High-value clinics, hotels, salons & retail | Complete GBP management, 4 weekly geotagged showcase posts, 100% review response SLA, monthly Gemini report |

---

## 6. Best Practices, Pro-Tips & Anti-Abuse Guidelines

### 💡 Pro-Tips for Sales Reps:
* **The "Top 3 Competitor" Opening**: When calling a lead, open with: *"When customers in Ranchi search for '[Category] near me', your competitors appear in the Top 3 Map Pack. Our free 1-page audit shows how you can rank above them."*
* **The Review QR Stand Anchor**: The physical counter stand is our highest-converting physical deliverable. Always show photo proofs of the QR stand during the pitch.

### ⚠️ Quality & Security Guidelines:
* **Never use mock or placeholder data** in customer reports. Every score is grounded in live Google Places metrics.
* **Rate Limits**: The public audit API enforces 5 scans per IP/hour to prevent competitor scraping. If a client needs a re-scan, trigger it from inside the CRM.
* **GST & Tax Compliance**: Ensure all invoices specify SAC Code `998313` and reflect appropriate Non-GST or GST tax breakdowns.
