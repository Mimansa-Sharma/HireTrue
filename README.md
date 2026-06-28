# LensHR — HR Document Intelligence for India

AI-powered analysis for job descriptions, offer letters, agreements, HR policies, and resumes — built specifically for India's workplace laws and hiring culture.

## Key Features

- **Premium Navy & White Design:** Crisp, clean, trust-evoking light theme layout designed for modern HR workflows.
- **Client-Side Drag-and-Drop Dropbox:** Directly drag & drop your PDF, DOCX, or TXT files (Max 5MB) into any panel. Text is securely extracted 100% on the client side via `pdf.js` and `mammoth.js` (files never leave your browser).
- **JD Auditor:** Analyzes job descriptions for bias, gender-coded language, candidate appeal, and unrealistic expectations (like IIT/NIT elitism).
- **Offer & Agreement Decoder:** Flags concerning clauses, non-compete enforceability (under Section 27 of the Indian Contract Act), intellectual property rights, and negotiation angles for NDAs and employment contracts.
- **Policy Gap Finder:** Checks compliance with the POSH Act 2013, consolidated Labour Codes, Maternity Benefit Act, and other Indian statutes.
- **Resume ATS Checker:** Reviews ATS compatibility and suggests improvements specifically for Indian job portals like Naukri and LinkedIn India.

## Project Structure

```
LensHR/
├── api/
│   └── analyze.js       ← Vercel serverless function (Anthropic Claude API integration)
├── index.html           ← Landing page & marketing site
├── style.css            ← Main stylesheet (Navy and White theme)
├── auth.js              ← REST-based Supabase authentication (no external SDK dependency)
├── config.js            ← Environment-safe configuration
├── dashboard.html       ← User workspace for document analysis (with File Dropzones)
├── dashboard.css        ← Styles specific to the dashboard interface
├── dashboard.js         ← Core frontend logic, drag-and-drop parsing, and API caller
├── pricing.html         ← Dynamic tiered pricing details
└── README.md            ← Project documentation
```

## Setup & Deployment on Vercel

### 1. Configure Supabase Auth
Ensure you have a Supabase project set up. The REST authentication in `auth.js` points to your project instance:
- `SB_URL` is set to your Supabase project URL.
- `SB_KEY` is your Supabase Anon public key.

### 2. Vercel Environment Variables
Add your Anthropic API Key as an environment variable in Vercel to secure it from exposure:
- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-api03-...`

### 3. Deploy
Install the Vercel CLI or deploy via GitHub integration:
```bash
vercel deploy
```
Vercel will automatically route traffic to the serverless function `/api/analyze` based on the file placement in the `api/` directory.

## Technology Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework overhead)
- **External Libraries:** `pdf.js` (for PDF text extraction) and `mammoth.js` (for Word document text extraction) via secure CDNs
- **Database / Auth:** Supabase Auth (via direct REST API endpoint)
- **AI Core:** Anthropic Claude (via `claude-sonnet-4-20250514` serverless integration)
- **Hosting:** Vercel

## Disclaimer

LensHR provides AI-powered analysis for informational and educational purposes only. It does not constitute legal advice. For formal compliance and legal decisions, consult a qualified Indian labour law practitioner.
