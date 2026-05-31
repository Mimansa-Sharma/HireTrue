// ─── Sample Documents ───────────────────────────────────────────────────────

const SAMPLES = {
  jd: `Software Engineer — 3-5 years experience required

We are looking for a ninja rockstar developer who can hit the ground running. The ideal candidate must have:
- B.Tech/B.E. degree (IIT/NIT preferred)
- 3-5 years of experience in React, Node.js
- Must work in a fast-paced environment under pressure
- Aggressive problem solver with a go-getter attitude
- Available for immediate joining
Freshers need not apply. Only male candidates preferred for night shift requirements.`,

  offer: `Dear Candidate,
We are pleased to offer you the position of Software Engineer at TechCorp India Pvt. Ltd.
CTC: Rs. 8,00,000 per annum (Fixed: Rs. 6,40,000 + Variable: Rs. 1,60,000)
Notice Period: 90 days. During probation of 6 months, company may terminate with 24 hours notice.
Non-compete: Employee shall not work with any competitor for 2 years post-employment within India.
All IP created during or outside working hours belongs exclusively to the company.
Relocation: Employee may be transferred to any company location in India without additional compensation.
Working hours: 9 hours/day, 6 days a week. Overtime will not be compensated separately.`,

  policy: `Leave Policy:
- Annual Leave: 12 days per year
- Sick Leave: 7 days per year
- Maternity Leave: 12 weeks
- No paternity leave mentioned
- Casual Leave: 5 days

Working Hours: 9 hours per day, 48 hours per week.
Termination: Company may terminate with 30 days notice or payment in lieu.
Grievance: Employees can raise grievances with HR manager directly.

No mention of POSH committee, sexual harassment policy, or Internal Complaints Committee (ICC).`
};

// ─── System Prompts ─────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  jd: `You are HireTrue, an expert HR analyst specializing in the Indian job market and workplace law. Analyze job descriptions with deep knowledge of Indian hiring culture, DEI challenges, and labour law.

Respond in clean, well-structured plain text (no markdown symbols like ** or ##). Use clear section headings in CAPS followed by a colon. Be specific, direct, and actionable.

Structure your response exactly like this:

SCORES (out of 100):
- Bias Score (higher = less bias): X/100
- Clarity: X/100
- Candidate Appeal: X/100
- Realism: X/100

BIASED OR EXCLUSIONARY LANGUAGE FOUND:
List each problematic phrase with a brief explanation of why it is harmful.

ISSUES TO FIX:
List 3 to 5 specific, actionable problems with this JD.

WHAT IS WORKING:
List 2 to 3 things the JD does well.

SUGGESTED REWRITE:
Quote the worst offending line, then provide a better version.

INDIA MARKET INSIGHT:
One specific insight about how this JD would perform in the current Indian talent market.

Be honest, specific, and grounded in Indian hiring reality.`,

  offer: `You are HireTrue, an expert in Indian employment law and HR practices. Decode offer letters for candidates in India with deep knowledge of the Indian Contract Act, Labour Codes, and industry norms.

Respond in clean, well-structured plain text (no markdown symbols like ** or ##). Use clear section headings in CAPS. Be specific, direct, and protective of the candidate's interests.

Structure your response exactly like this:

OVERALL VERDICT: [GOOD / REVIEW / CAUTION]

PLAIN ENGLISH SUMMARY:
2 to 3 sentences explaining what this offer actually means in simple terms.

RED FLAG CLAUSES:
List each concerning clause with a clear explanation of the risk and relevant Indian law where applicable.

CLARIFY BEFORE SIGNING:
List 3 to 4 specific questions to ask the employer before accepting.

NEGOTIATION OPPORTUNITIES:
List 2 to 3 specific things that are negotiable in the Indian employment context, with suggested language.

INDIA INDUSTRY BENCHMARK:
Compare key terms of this offer against current Indian industry standards for similar roles.

Be direct and prioritize the candidate's legal and financial interests.`,

  policy: `You are HireTrue, an expert in Indian labour law and HR compliance. Analyze HR policies against India's legal requirements with deep knowledge of the Labour Codes 2019-2020, POSH Act 2013, Maternity Benefit Act, Payment of Gratuity Act, and other applicable statutes.

Respond in clean, well-structured plain text (no markdown symbols like ** or ##). Use clear section headings in CAPS. Be specific about which laws apply and what exactly needs to change.

Structure your response exactly like this:

COMPLIANCE SCORE: X/100

CRITICAL LEGAL GAPS:
List each serious compliance failure with the specific law being violated.

MISSING CLAUSES REQUIRED BY INDIAN LAW:
List each clause that is legally mandated but absent from this policy.

LAWS AND ACTS INVOLVED:
List the specific Indian laws relevant to the gaps found.

WHAT IS COMPLIANT:
List 2 to 3 things the policy does correctly.

PRIORITY FIX:
Identify the single most urgent compliance issue to fix first and explain why it must be addressed immediately.

Be specific about legal obligations and realistic about risk levels.`
};

// ─── Tab Switching ───────────────────────────────────────────────────────────

document.querySelectorAll('.tool-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + targetTab).classList.add('active');
    hideResults();
  });
});

// ─── Sample Loading ──────────────────────────────────────────────────────────

document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const sampleKey = btn.dataset.sample;
    document.getElementById(targetId).value = SAMPLES[sampleKey];
  });
});

// ─── Analysis ────────────────────────────────────────────────────────────────

document.querySelectorAll('.analyze-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const type = btn.dataset.type;
    const inputEl = document.getElementById(type + '-input');
    const text = inputEl.value.trim();

    if (!text) {
      showError('Please paste a document before analyzing.');
      return;
    }

    if (text.length < 50) {
      showError('The document seems too short. Please paste the full text.');
      return;
    }

    await runAnalysis(type, text, btn);
  });
});

async function runAnalysis(type, text, btn) {
  // Get API key from config
  const apiKey = window.HIRETRUE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    showError('API key not configured. Please add your Anthropic API key to config.js');
    return;
  }

  // Show loading
  btn.disabled = true;
  hideResults();
  showLoading(true);

  const titles = {
    jd: 'JD Audit Results',
    offer: 'Offer Decoder Results',
    policy: 'Policy Gap Finder Results'
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPTS[type],
        messages: [{ role: 'user', content: text }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'API request failed. Check your API key.');
    }

    const data = await response.json();
    const result = data.content.map(b => b.text || '').join('');

    showLoading(false);
    showResult(titles[type], result);

  } catch (err) {
    showLoading(false);
    showError(err.message || 'Something went wrong. Please try again.');
  }

  btn.disabled = false;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function showLoading(show) {
  document.getElementById('loading-area').style.display = show ? 'flex' : 'none';
}

function hideResults() {
  document.getElementById('result-area').style.display = 'none';
  document.getElementById('error-area').style.display = 'none';
  document.getElementById('loading-area').style.display = 'none';
}

function showResult(title, content) {
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-body').textContent = content;
  document.getElementById('result-area').style.display = 'block';
  document.getElementById('result-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
  document.getElementById('error-area').style.display = 'block';
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('result-body').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Results'; }, 2000);
  });
});
