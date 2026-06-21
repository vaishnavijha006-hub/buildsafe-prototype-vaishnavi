# BuildSafe

> **BuildSafe uses QR attendance, blockchain records, and automated UPI payments to eliminate wage theft for construction workers.**

## The Problem
Wage theft in India's informal construction sector is a widespread issue. Workers face unreliable income due to the absence of formal contracts, lack of verifiable attendance proof, untraceable cash payments, and absolutely no legal recourse. 

## Solution / Key Features
BuildSafe tackles these systemic issues with a transparent, decentralized, and verifiable wage protection platform:
- **QR-based Attendance:** Simple, trackable, and undisputed check-ins for site workers.
- **Hash-chained Ledger:** A tamper-detection mechanism ensuring that attendance and wage records are immutable.
- **ArmorPay Policy-Gated Payouts:** Smart-contract-style rules that enforce wage bounds and validate attendance before allowing payments.
- **Digital Worker Identity:** Every worker gets a verifiable work history and credentials.
- **Dispute Resolution:** In-built flows for workers to challenge discrepancies in attendance or pay.
- **Role Hierarchy:** Dedicated interfaces for Builders, Contractors, and Workers.
- **Multilingual Support:** Fully accessible in English, Hindi (हिंदी), Tamil (தமிழ்), and Bengali (বাংলা).
- **ArmorIQ Biometric Onboarding:** Simulated biometric verification steps for secure worker enrollment.

## Live Demo
Check out the live prototype here: **[https://buildsafe-prototype.vercel.app](https://buildsafe-prototype.vercel.app)**

## Tech Stack
This project represents a functioning frontend prototype. The table below outlines the current built architecture vs. the production targets for a full deployment:

| Component | Built (Current Prototype) | Production Target |
| :--- | :--- | :--- |
| **Frontend UI** | React + Vite, Tailwind CSS | React Native (Mobile), Next.js (Web) |
| **Persistence** | Browser `localStorage` sync | Node.js backend + PostgreSQL |
| **Ledger / Blockchain** | Client-side cryptographic hash-chaining | Hyperledger Fabric |
| **Payments** | Simulated UI confirmations | Razorpay / UPI API Integration |

## Getting Started

### Local Setup
To run the prototype locally on your machine:
```bash
# Clone the repository
git clone https://github.com/sapnajha757/buildsafe-prototype.git

# Navigate to the project directory
cd buildsafe

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Demo Accounts
You can test the different role interfaces using the following quick-login accounts (password for all accounts is `demo123`):

- **Builder**: `builder@buildsafe.in` (Amit Verma - Metro Operations)
- **Contractor**: `contractor@buildsafe.in` (Rajesh Sharma - Sector-21 Metro)
- **Worker (Mason)**: `ramesh@buildsafe.in` (Ramesh Kumar)
- **Worker (Helper)**: `sunita@buildsafe.in` (Sunita Devi)

## Project Structure
A brief overview of the key directories in the repository:
- `src/components/` - Reusable UI components and the main dashboards (`BuilderView.jsx`, `ContractorView.jsx`, `WorkerView.jsx`).
- `src/lib/` - Core logic including the cryptographic ledger functions (`ledger.js`), initial seed data (`seedData.js`), and the local storage sync mechanism (`syncStore.js`).
- `src/pages/` - Top-level page routes like `Login.jsx`, `Signup.jsx`, `Dashboard.jsx`, and `Landing.jsx`.

## Team
**Team Name:** Tech Chaos  
**Members:** Sapna Jha and Vaishnavi

---
*Note: This is a hackathon prototype demonstrating the core UX and cryptographic mechanisms of the BuildSafe platform.*
