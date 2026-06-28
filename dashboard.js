// Configure pdf.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ─── Sample Documents ────────────────────────────────────────────────────────

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
No mention of any sexual harassment policy or Internal Complaints Committee.`,

  resume: `Mimansa Sharma
mimansa@email.com | +91-XXXXXXXXXX | LinkedIn: linkedin.com/in/mimansa

EDUCATION
BBA-MBA (Integrated) | HR Specialisation | 2020-2025

EXPERIENCE
HR Intern | ABC Company | June 2024 - August 2024
- Assisted with recruitment
- Helped in onboarding

SKILLS
Communication, MS Office, HR Basics`
};

// ─── System Prompts ──────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  jd: `You are LensHR, an expert HR analyst specializing in the Indian job market. Analyze job descriptions for bias, clarity, candidate appeal, and realism.

Respond in clean plain text, no markdown symbols. Use CAPS for section headings.

SCORES (out of 100):
- Bias Score (higher = less bias): X/100
- Clarity: X/100
- Candidate Appeal: X/100
- Realism: X/100

BIASED OR EXCLUSIONARY LANGUAGE FOUND:
List each problematic phrase with a brief explanation.

ISSUES TO FIX:
List 3 to 5 specific, actionable problems.

WHAT IS WORKING:
List 2 to 3 things done well.

SUGGESTED REWRITE:
Quote the worst line, then provide a better version.

INDIA MARKET INSIGHT:
One specific insight about Indian talent market performance.`,

  offer: `You are LensHR, an expert in Indian employment law. Decode offer letters, employment agreements, or NDAs for candidates.

Respond in clean plain text, no markdown symbols. Use CAPS for section headings.

OVERALL VERDICT: [GOOD / REVIEW / CAUTION]

PLAIN ENGLISH SUMMARY:
2 to 3 sentences explaining the offer or agreement in simple terms.

RED FLAG CLAUSES:
List each concerning clause with risk explanation and relevant Indian law (e.g., Section 27 of the Indian Contract Act for non-competes, IP ownership, probation imbalances, etc.).

CLARIFY BEFORE SIGNING:
List 3 to 4 specific questions to ask the employer.

NEGOTIATION OPPORTUNITIES:
List 2 to 3 negotiable items in the Indian employment context.

INDIA INDUSTRY BENCHMARK:
Compare key terms against current Indian industry standards for similar roles.`,

  policy: `You are LensHR, an expert in Indian labour law. Analyze HR policies against India's consolidated Labour Codes and other applicable statutes.

Respond in clean plain text, no markdown symbols. Use CAPS for section headings.

COMPLIANCE SCORE: X/100

CRITICAL LEGAL GAPS:
List each serious compliance failure with the specific law violated (e.g. POSH Act 2013, consolidate Labour Codes).

MISSING CLAUSES REQUIRED BY INDIAN LAW:
List each legally mandated clause that is absent.

LAWS AND ACTS INVOLVED:
List specific Indian laws relevant to the gaps.

WHAT IS COMPLIANT:
List 2 to 3 things the policy does correctly.

PRIORITY FIX:
The single most urgent compliance issue and why.`,

  resume: `You are LensHR, an expert in ATS (Applicant Tracking Systems) and Indian recruitment practices. Analyze resumes for ATS compatibility and effectiveness in the Indian job market including platforms like Naukri, LinkedIn, and Workday.

Respond in clean plain text, no markdown symbols. Use CAPS for section headings.

ATS COMPATIBILITY SCORE: X/100

CRITICAL ATS ISSUES:
List formatting or content issues that will cause ATS rejection.

MISSING KEYWORDS AND SECTIONS:
List important keywords, skills, or sections that are absent.

FORMATTING PROBLEMS:
List specific formatting issues that confuse ATS systems.

WHAT IS WORKING:
List 2 to 3 things done well.

INDIA-SPECIFIC RECOMMENDATIONS:
Specific suggestions for Indian job platforms like Naukri and LinkedIn India.

PRIORITY FIX:
The single most important change to make immediately.`
};

// ─── Tool Headers ─────────────────────────────────────────────────────────────

const TOOL_META = {
  jd: {
    title: 'JD Auditor',
    subtitle: 'Upload or paste a job description to audit it for bias, exclusionary language, and candidate appeal.'
  },
  offer: {
    title: 'Offer & Agreement Decoder',
    subtitle: 'Upload or paste an offer letter or employment agreement to surface risky clauses, negotiation opportunities, and industry benchmarks.'
  },
  policy: {
    title: 'Policy Gap Finder',
    subtitle: 'Upload or paste your HR policy to check it against India\'s consolidated Labour Codes and compliance benchmarks.'
  },
  resume: {
    title: 'Resume ATS Checker',
    subtitle: 'Upload or paste your resume text to check ATS compatibility and get recommendations for Indian job platforms.'
  }
};

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    const tool = link.dataset.tool;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('panel-' + tool).classList.add('active');
    document.getElementById('dash-title').textContent = TOOL_META[tool].title;
    document.getElementById('dash-subtitle').textContent = TOOL_META[tool].subtitle;
    hideResults();
    if (typeof gtag !== 'undefined') {
      gtag('event', 'tool_switch', { event_category: 'navigation', event_label: tool });
    }
  });
});

// ─── Sample Loading ──────────────────────────────────────────────────────────

document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target).value = SAMPLES[btn.dataset.sample];
  });
});

// ─── Drag-and-Drop File Import Logic ─────────────────────────────────────────

document.querySelectorAll('.upload-dropzone').forEach(dz => {
  const fileInput = dz.querySelector('.file-input');
  
  // Click dropzone triggers the file input dialog
  dz.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0], dz.dataset.target, dz.id);
    }
  });

  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragover');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('dragover');
  });

  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0], dz.dataset.target, dz.id);
    }
  });
});

function handleFile(file, targetId, dropzoneId) {
  // Validate file size (Max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showDropzoneError(dropzoneId, "File exceeds the 5MB size limit.");
    return;
  }

  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const dz = document.getElementById(dropzoneId);
  dz.className = 'upload-dropzone';
  dz.querySelector('.dropzone-text').innerHTML = '<strong>Extracting text...</strong>';
  dz.querySelector('.dropzone-icon').textContent = '⏳';

  if (ext === '.txt') {
    const reader = new FileReader();
    reader.onload = (e) => {
      fillTextArea(targetId, e.target.result, dropzoneId);
    };
    reader.onerror = () => showDropzoneError(dropzoneId, "Failed to read text file.");
    reader.readAsText(file);
  } else if (ext === '.docx') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(result => {
          if (result.value.trim().length === 0) {
            showDropzoneError(dropzoneId, "Word document contains no readable text.");
          } else {
            fillTextArea(targetId, result.value, dropzoneId);
          }
        })
        .catch(() => showDropzoneError(dropzoneId, "Failed to parse DOCX file."));
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === '.pdf') {
    const reader = new FileReader();
    reader.onload = function(e) {
      const typedarray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument({ data: typedarray }).promise
        .then(pdf => {
          let maxPages = pdf.numPages;
          let countPromises = [];
          for (let j = 1; j <= maxPages; j++) {
            countPromises.push(
              pdf.getPage(j).then(page => {
                return page.getTextContent().then(textContent => {
                  return textContent.items.map(s => s.str).join(' ');
                });
              })
            );
          }
          Promise.all(countPromises)
            .then(pagesText => {
              const fullText = pagesText.join('\n\n');
              if (fullText.trim().length === 0) {
                showDropzoneError(dropzoneId, "No text extractable from PDF.");
              } else {
                fillTextArea(targetId, fullText, dropzoneId);
              }
            })
            .catch(() => showDropzoneError(dropzoneId, "Failed to parse PDF text pages."));
        })
        .catch(() => showDropzoneError(dropzoneId, "Invalid or corrupted PDF file."));
    };
    reader.readAsArrayBuffer(file);
  } else {
    showDropzoneError(dropzoneId, "Unsupported file format. Use PDF, DOCX, or TXT.");
  }
}

function fillTextArea(targetId, text, dropzoneId) {
  document.getElementById(targetId).value = text;
  const dz = document.getElementById(dropzoneId);
  dz.className = 'upload-dropzone success';
  dz.querySelector('.dropzone-text').innerHTML = '<strong>File loaded successfully!</strong>';
  dz.querySelector('.dropzone-icon').textContent = '✅';
  setTimeout(() => { resetDropzone(dropzoneId); }, 2500);
}

function showDropzoneError(dropzoneId, msg) {
  const dz = document.getElementById(dropzoneId);
  dz.className = 'upload-dropzone error';
  dz.querySelector('.dropzone-text').innerHTML = `<strong>Error:</strong> ${msg}`;
  dz.querySelector('.dropzone-icon').textContent = '❌';
  setTimeout(() => { resetDropzone(dropzoneId); }, 3500);
}

function resetDropzone(dropzoneId) {
  const dz = document.getElementById(dropzoneId);
  if (!dz) return;
  dz.className = 'upload-dropzone';
  dz.querySelector('.dropzone-icon').textContent = '📁';
  const type = dropzoneId.split('-')[1];
  const labels = {
    jd: 'Job Description',
    offer: 'Offer Letter or Agreement',
    policy: 'HR Policy file',
    resume: 'Resume'
  };
  dz.querySelector('.dropzone-text').innerHTML = `<strong>Drag & drop your ${labels[type]} here</strong> or <span class="browse-link">browse</span>`;
}

// ─── Analysis ────────────────────────────────────────────────────────────────

document.querySelectorAll('.analyze-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const type = btn.dataset.type;
    const inputEl = document.getElementById(type + '-input');
    const text = inputEl.value.trim();

    if (!text) { showError('Please paste or upload a document before analyzing.'); return; }
    if (text.length < 50) { showError('The document seems too short. Please provide the full text.'); return; }

    // For resume, optionally append JD for keyword matching
    let fullText = text;
    if (type === 'resume') {
      const jdText = document.getElementById('resume-jd')?.value?.trim();
      if (jdText) {
        fullText = `RESUME:\n${text}\n\nTARGET JOB DESCRIPTION (for keyword matching):\n${jdText}`;
      }
    }

    await runAnalysis(type, fullText, btn);
  });
});

async function runAnalysis(type, text, btn) {
  btn.disabled = true;
  hideResults();
  showLoading(true);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: SYSTEM_PROMPTS[type], text })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Analysis failed. Please try again.');
    }

    const data = await response.json();
    showLoading(false);
    showResult(TOOL_META[type].title + ' Results', data.result);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'analysis_completed', { event_category: 'tool_usage', event_label: type });
    }

  } catch (err) {
    showLoading(false);
    showError(err.message || 'Something went wrong. Please try again.');
  }

  btn.disabled = false;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

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
  document.getElementById('feedback-area').style.display = 'block';
  document.getElementById('feedback-thanks').style.display = 'none';
  document.querySelectorAll('.feedback-btn').forEach(b => b.style.display = 'inline-flex');
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

// ─── Feedback ────────────────────────────────────────────────────────────────

function submitFeedback(value) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'feedback', { event_category: 'engagement', event_label: value });
  }
  document.querySelectorAll('.feedback-btn').forEach(b => b.style.display = 'none');
  document.getElementById('feedback-thanks').style.display = 'block';
}
