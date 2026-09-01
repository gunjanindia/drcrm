# DIGITAL RANCHI OS — STAFF & CLIENT PORTAL TRAINING MANUAL

This document provides complete instructions, operational workflows, and account credentials for all internal agency staff roles and external client portal accounts.

---

## 🔐 1. System Access & Login Endpoints

* **Login URL (Production)**: `https://your-domain.vercel.app/login`
* **Login URL (Local Dev)**: `http://localhost:3000/login`
* **Internal Agency CRM**: `/app` *(Requires Staff Role)*
* **Client Self-Service Portal**: `/portal` *(Requires Client Role)*

> **Security Note**: All accounts are secured with signed JWT session tokens (`dr_auth_token`) and password hashing (Bcrypt cost factor 12). Route access is guarded by Next.js edge middleware.

---

## 👥 2. Staff Roles & Login Credentials

All staff accounts use the default initialization password: `Password@123`

| Staff Member | Department | Role | Login Email | Default Password | Accessible Modules & Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gunjan Sharma** | Executive | `SUPER_ADMIN` | `gunjan@digitalranchi.in` | `Password@123` | Full access across all CRM workflows, Master Data CRUD, Finance, Tax Settings, and AI Agent. |
| **Pooja Verma** | Operations | `BUSINESS_ADMIN` | `pooja@digitalranchi.in` | `Password@123` | Team workload management, client onboarding, recurring retainers, delivery SLA tracking. |
| **Rahul Kumar** | Sales | `SALES_MANAGER` | `rahul.k@digitalranchi.in` | `Password@123` | Sales Pipeline oversight, Deal stage management, Lead conversions, Audit pitches. |
| **Amit Singh** | Sales | `SALES_EXECUTIVE` | `amit.s@digitalranchi.in` | `Password@123` | Lead logging, WhatsApp/Email pitch dispatcher, Audit report sharing. |
| **Siddharth Roy** | Delivery | `OPERATIONS_MANAGER`| `siddharth@digitalranchi.in`| `Password@123` | Task allocation, Quality audits, Delivery bottleneck resolution, SLA alerts. |
| **Neha Pandey** | Client Success | `ACCOUNT_MANAGER` | `neha.p@digitalranchi.in` | `Password@123` | Client 360 health monitor, Support tickets, Client deliverables, Onboarding check-ins. |
| **Vikram Mehta** | Client Success | `ACCOUNT_MANAGER` | `vikram.m@digitalranchi.in` | `Password@123` | Client renewals, Monthly report dispatch, Client portal reviews. |
| **Rohan Gupta** | Delivery | `DELIVERY_EXECUTIVE` | `rohan.g@digitalranchi.in` | `Password@123` | GBP setup & optimization, Geotagging, QR Code acrylic stand designs, Mini websites. |
| **Anjali Kumari** | Delivery | `DELIVERY_EXECUTIVE` | `anjali.k@digitalranchi.in` | `Password@123` | Social media creative design, Local SEO content, Festival & offer announcements. |
| **Manish Tiwari** | Finance | `FINANCE` | `manish.t@digitalranchi.in`| `Password@123` | Billing & Invoicing, Razorpay payment captures, GST vs Non-GST mode toggle. |

---

## 🏥 3. Client Portal Accounts (Client Self-Service)

Clients log in at the same `/login` screen and are automatically redirected to their dedicated `/portal`.

| Client Business Name | Contact Person | Login Email | Default Password | Linked Package |
| :--- | :--- | :--- | :--- | :--- |
| **Ranchi Dental Care & Implant Center** | Dr. Alok Srivastava | `client@ranchidental.com` | `Password@123` | Growth Accelerate (₹999/mo) |
| **Converted Lead Accounts** | Lead Owner / Business Contact | *(Registered Business Email)* | `Password@123` | *(Selected Starting Package)* |

---

## 📖 4. Core Workflow Step-by-Step Guide

### Workflow A: Ingesting & Converting a Lead
1. **Capturing Leads**: Inquiries arrive automatically from the **Free Presence Audit Scanner** (`/audit`), WhatsApp, or manual entry in **Leads & Inquiries** (`/app/leads`).
2. **Reviewing Audit Score**: Check the local search visibility score (0-100), missing NAP info, and GBP category readiness.
3. **1-Click Pitch Dispatch**: Click **Pitch Report** $\rightarrow$ Choose **WhatsApp Script** or **Formal Email Proposal** $\rightarrow$ 1-click sends tailored pitch with pricing.
4. **Converting to Active Client**:
   - Click **Convert** on the lead card $\rightarrow$ Select package (Starter ₹499, Growth ₹999, or Scale ₹1,999).
   - Click **Confirm Conversion**.
   - **Automated Actions**: Lead moves to `WON`, Client 360 profile is created, 7-Day Onboarding Project is generated, 7 Kickoff Tasks are scheduled, and the initial billing invoice is issued.

---

### Workflow B: Managing Delivery & Team Tasks
1. Navigate to **Task Board** (`/app/tasks`).
2. Filter tasks by **Status**, **Priority**, or **Assignee**.
3. **Reassigning Tasks**: Use the assignee dropdown on any task card to reassign between team members in 1 click.
4. **Advancing Task Status**: Move tasks through `BACKLOG` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `CLIENT_APPROVAL` $\rightarrow$ `COMPLETED`.

---

### Workflow C: Client Portal Experience
When a client logs in to `/portal`:
* **Overview**: Real-time GBP Score, Google Star Rating, and Next Retainer Renewal Date.
* **Approvals & Creatives**: Client can review draft social creatives and 1-click **Approve** or **Request Changes**.
* **Live Service Tasks**: Full transparency into all tasks being completed for their business.
* **Invoices & Receipts**: View and download bills of supply / tax invoices.
* **Direct Support**: 1-click WhatsApp button to reach their assigned Account Manager.

---

### Workflow D: Billing & GST Compliance
1. Navigate to **Billing & Invoices** (`/app/billing`).
2. View financial KPIs: **Total Billed**, **Total Collected**, and **Outstanding Due**.
3. **Toggle Tax Mode**: Click **Mode: Non-GST / GST Active** to switch between *Non-GST Bill of Supply* (0% tax) and *GST Tax Invoice* (9% CGST + 9% SGST with GSTIN `20ABCDE1234F1Z5`).
