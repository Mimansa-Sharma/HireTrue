# HireTrue — HR Document Intelligence for India

AI-powered analysis for job descriptions, offer letters, and HR policies — built specifically for India's workplace laws and hiring culture.

**Live at:** `hiretrue.vercel.app` *(after you deploy)*

---

## What it does

| Module | What it analyzes |
|---|---|
| JD Auditor | Bias, gender language, candidate appeal, IIT elitism, realism |
| Offer Decoder | Red-flag clauses, non-competes, IP risks, negotiation angles |
| Policy Gap Finder | POSH Act, Labour Codes, Maternity Benefit Act compliance |

---

## Deploy in 4 Steps (Free, No Coding Experience Needed)

### Step 1 — Get your free Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for a free account
3. Click **API Keys** in the left sidebar
4. Click **Create Key** — copy and save it somewhere safe

---

### Step 2 — Add your API key to the project

Open the file called `config.js` and replace `YOUR_API_KEY_HERE` with your actual key:

```js
window.HIRETRUE_API_KEY = 'sk-ant-api03-xxxxxxxxxxxxxxxx';
```

Save the file.

---

### Step 3 — Upload to GitHub

1. Go to [github.com](https://github.com) and create a free account
2. Click the **+** icon → **New repository**
3. Name it `hiretrue`, set it to **Public**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Drag and drop all 4 files: `index.html`, `style.css`, `app.js`, `config.js`
6. Click **Commit changes**

---

### Step 4 — Deploy on Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `hiretrue` repository
4. Click **Deploy** — that's it!
5. Vercel gives you a free URL like `hiretrue.vercel.app`

**Your site is live. Share the link.**

---

## Project Structure

```
hiretrue/
├── index.html    ← The full website (layout + content)
├── style.css     ← All visual design and styling
├── app.js        ← Tool logic, API calls, interactivity
└── config.js     ← Your API key goes here
```

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **AI Engine:** Claude claude-sonnet-4-20250514 via Anthropic API
- **Hosting:** Vercel (free tier)
- **Fonts:** DM Sans + Instrument Serif (Google Fonts)

---

## Built by

Final year BBA-MBA (HR) student as a portfolio project addressing real gaps in India's HR document practices.

**India-specific coverage:**
- Sexual Harassment of Women at Workplace (POSH) Act, 2013
- Indian Labour Codes (2019–2020)
- Maternity Benefit (Amendment) Act, 2017
- Indian Contract Act, 1872 (Section 27 — non-compete enforceability)
- Occupational Safety, Health and Working Conditions Code, 2020
- Digital Personal Data Protection Act, 2023

---

## Disclaimer

HireTrue provides AI-powered analysis for informational and educational purposes. It does not constitute legal advice. For compliance decisions, consult a qualified Indian labour law practitioner.
