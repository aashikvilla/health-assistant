"use client";

import Link from 'next/link'
import { ContactModal } from '@/components/layout/ContactModal'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import './homepage.css'

/**
 * Homepage  ported from preview-homepage.html (Palette D).
 * Uses dedicated homepage.css with all animations/styles scoped under .hp
 * Self-contained nav + footer (does not use the layout's PageHeader/PageFooter).
 */

export default function HomePage() {
  return (
    <div className="hp">
     

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="logo">
          <span className="logo-mark">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              aria-hidden="true"
            >
              <rect width="30" height="30" rx="8.5" fill="#1d4ed8" />
              <path
                d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          <span>Vitae</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#footer">Get in touch</a>
        </div>
        <div className="nav-cta">
          <Link href="/auth?mode=signin" className="btn-nav-signin">Sign in</Link>
          <Link href="/auth?mode=signup" className="btn-nav">Sign up</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="hero-text">
          <div className="eyebrow fi1">
            <div className="eyebrow-dot" />
            <span>AI-Powered Health Intelligence</span>
          </div>
          <h1 className="hero-h1 fi2">
            Your health records,
            <br />
            <em>finally</em> understood.
          </h1>
          <p className="hero-p fi3">
            Upload any prescription or lab report and get a plain-language
            explanation of every medication, dosage and test result instantly.
          </p>
          <div className="hero-actions fi4">
            <Link href="/upload" className="btn-cta">Start for Free →</Link>
            <Link href="/auth" className="btn-outline">Sign up</Link>
          </div>
          <p className="cta-sub fi4">
            Already have an account? <Link href="/auth">Sign in</Link>
          </p>
          <div className="badges fi5">
            <div className="badge">
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="#1d4ed8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              End-to-end encrypted
            </div>
            <div className="badge">
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="#1d4ed8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Data never sold
            </div>
            <div className="badge">
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="#1d4ed8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              No credit card needed
            </div>
          </div>
        </div>

        {/* Mobile-only simplified hero visual */}
        <div className="hero-visual-mobile fi3">
          <div className="scan-card-mobile">
            <div className="mini-scan-line" />
            <div className="sc-clinic">City Health Clinic</div>
            <div className="sc-addr">Dr. A. Sharma, MBBS MD</div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div className="rxl d" style={{ width: "75%" }} />
              <div className="rxl f" style={{ height: 7 }} />
              <div className="rxl h" />
            </div>
            <div className="mobile-chips">
              <div className="mobile-chip">
                <span>💊</span> Metformin
              </div>
              <div className="mobile-chip">
                <span>⚗️</span> 500mg
              </div>
              <div className="mobile-chip">
                <span>🕐</span> 2× daily
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual fi3">
          {/* Floating docs */}
          <div className="float-doc doc-a">
            <div className="fdh">Prescription</div>
            <div className="fdl d" style={{ width: "75%" }} />
            <div className="fdl" style={{ width: "100%" }} />
            <div className="fdl" style={{ width: "55%" }} />
            <div className="fdl d" style={{ width: "80%", marginTop: 4 }} />
            <div className="fdl" style={{ width: "60%" }} />
          </div>
          <div className="float-doc doc-b">
            <div className="fdh">Lab Report</div>
            <div className="fdl d" style={{ width: "90%" }} />
            <div className="fdl" style={{ width: "70%" }} />
            <div className="fdl" style={{ width: "100%" }} />
            <div className="fdl d" style={{ width: "60%", marginTop: 4 }} />
          </div>
          <div className="float-doc doc-c">
            <div className="fdh">Blood Test</div>
            <div className="fdl d" style={{ width: "85%" }} />
            <div className="fdl" style={{ width: "65%" }} />
            <div className="fdl" style={{ width: "90%" }} />
          </div>

          {/* Scan card */}
          <div className="scan-wrap">
            <div className="scan-depth-2" />
            <div className="scan-depth-1" />
            <div className="scan-card">
              <div className="scan-line" />
              <div className="scan-glow" />
              <div className="sc-hdr">
                <div>
                  <div className="sc-clinic">City Health Clinic</div>
                  <div className="sc-addr">
                    Dr. A. Sharma, MBBS MD
                    <br />
                    Reg. No. MH-84271
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--text-m)",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  marginBottom: 12,
                }}
              >
                Prescription
              </div>
              <div className="rxlines">
                <div className="rxl d q" />
                <div className="rxl f" style={{ height: 8 }} />
                <div className="rxl h" />
              </div>
              <div className="rxs">
                <div className="rxs-lbl">Rx</div>
                <div className="rxlines">
                  <div className="rxl d f" />
                  <div className="rxl q" />
                  <div style={{ height: 10 }} />
                  <div className="rxl d f" />
                  <div className="rxl t" />
                  <div style={{ height: 10 }} />
                  <div className="rxl d q" />
                  <div className="rxl h" />
                </div>
              </div>
              <div className="sig-area">
                <div>
                  <div className="sig-line" />
                  <div className="sig-lbl">Doctor&apos;s Signature</div>
                </div>
                <div className="stamp">
                  <div className="stamp-txt">
                    CLINIC
                    <br />
                    STAMP
                  </div>
                </div>
              </div>
            </div>
            {/* Chips */}
            <div className="chip chip-a">
              <div
                className="chip-ico"
                style={{ background: "var(--violet-s)" }}
              >
                💊
              </div>
              <div>
                <div className="chip-lbl">Medicine</div>
                <div className="chip-val">Metformin</div>
              </div>
            </div>
            <div className="chip chip-b">
              <div className="chip-ico" style={{ background: "var(--blue-s)" }}>
                ⚗️
              </div>
              <div>
                <div className="chip-lbl">Dosage</div>
                <div className="chip-val">500mg</div>
              </div>
            </div>
            <div className="chip chip-c">
              <div className="chip-ico" style={{ background: "var(--pink-s)" }}>
                🕐
              </div>
              <div>
                <div className="chip-lbl">Frequency</div>
                <div className="chip-val">Twice daily</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[
            "Prescriptions decoded in seconds",
            "Lab reports in plain language",
            "Family health hub",
            "End-to-end encrypted",
            "Handwritten prescriptions supported",
            "No medical jargon · ever",
            "Share records with your doctor",
            "Track health changes over time",
            "Prescriptions decoded in seconds",
            "Lab reports in plain language",
            "Family health hub",
            "End-to-end encrypted",
            "Handwritten prescriptions supported",
            "No medical jargon · ever",
            "Share records with your doctor",
            "Track health changes over time",
          ].map((t, i) => (
            <div key={i} className="ticker-item">
              <div className="ticker-dot" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="feat-section" id="features">
        <div className="feat-aurora feat-aurora-1" />
        <div className="feat-aurora feat-aurora-2" />
        <div className="feat-aurora feat-aurora-3" />
        <div className="wrap">
          <div className="tc">
            <p className="s-eye">Features</p>
            <h2 className="s-h2">
              Built around how you actually
              <br />
              use your <em className="hl">health records</em>
            </h2>
            <p className="s-sub" style={{ maxWidth: 480, margin: "0 auto" }}>
              Not just extraction, but real understanding. Every feature is designed
              around a real moment of confusion.
            </p>
          </div>

          <div className="feat-grid">
            {/* 1: Plain-Language Explanations */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="fc-title">Plain-Language Explanations</div>
                <div className="fc-desc">
                  Every medication explained : dosage, purpose and side effects
                  all in under 30 seconds.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Prescription analysed</div>
                  <div className="med-row r1">
                    <div
                      className="med-dot"
                      style={{ background: "var(--blue)" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" />
                      <div className="med-line" style={{ width: "65%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{
                        background: "var(--blue-s)",
                        color: "var(--blue)",
                      }}
                    >
                      ✓ Safe
                    </div>
                  </div>
                  <div className="med-row r2">
                    <div
                      className="med-dot"
                      style={{ background: "var(--violet)" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" style={{ width: "80%" }} />
                      <div className="med-line" style={{ width: "55%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{
                        background: "var(--violet-s)",
                        color: "var(--violet)",
                      }}
                    >
                      1× daily
                    </div>
                  </div>
                  <div className="med-row r3">
                    <div
                      className="med-dot"
                      style={{ background: "var(--pink)" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" style={{ width: "70%" }} />
                      <div className="med-line" style={{ width: "48%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{
                        background: "var(--pink-s)",
                        color: "var(--pink)",
                      }}
                    >
                      ⚠ Note
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2: Privacy */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="fc-title">Your Data Stays Yours</div>
                <div className="fc-desc">
                  Your medical records are as private as a sealed envelope. Only
                  you can see them, nobody else.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Privacy guarantee</div>
                  <div className="check-item c1">
                    <div className="check-tick">✓</div>Only you can see your
                    records
                  </div>
                  <div className="check-item c2">
                    <div className="check-tick">✓</div>Never shared or sold,
                    ever
                  </div>
                  <div className="check-item c3">
                    <div className="check-tick">✓</div>Delete everything, any
                    time
                  </div>
                </div>
              </div>
            </div>

            {/* 3: Any Format */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="fc-title">Reads Any Format</div>
                <div className="fc-desc">
                  Handwritten, printed, blurry photo, multi-page PDF. If your
                  doctor wrote it, we can read it.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Reading document…</div>
                  <div className="mini-doc">
                    <div className="mini-scan-line" />
                    <div className="mini-doc-line d" style={{ width: "85%" }} />
                    <div className="mini-doc-line" style={{ width: "100%" }} />
                    <div className="mini-doc-line d" style={{ width: "70%" }} />
                    <div className="mini-doc-line" style={{ width: "90%" }} />
                  </div>
                  <div className="format-tags" style={{ marginTop: 8 }}>
                    <span className="fmt-tag t1">JPG / PNG</span>
                    <span className="fmt-tag t2">PDF</span>
                    <span className="fmt-tag t3">Handwritten</span>
                    <span className="fmt-tag t4">Scanned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4: Family Hub */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="fc-title">Your Whole Family, One Place</div>
                <div className="fc-desc">
                  One account for your parents, spouse and children.
                  Everyone&apos;s health history always accessible.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Family hub · 3 profiles</div>
                  <div className="fam-row m1">
                    <div
                      className="fam-av"
                      style={{
                        background: "var(--blue-s)",
                        color: "var(--blue)",
                      }}
                    >
                      RS
                    </div>
                    <div className="fam-info">
                      <div className="fam-name">Robert (You)</div>
                      <div className="fam-sub">3 prescriptions</div>
                    </div>
                    <div
                      className="fam-tag"
                      style={{
                        background: "var(--blue-s)",
                        color: "var(--blue)",
                      }}
                    >
                      Active
                    </div>
                  </div>
                  <div className="fam-row m2">
                    <div
                      className="fam-av"
                      style={{
                        background: "var(--violet-s)",
                        color: "var(--violet)",
                      }}
                    >
                      MR
                    </div>
                    <div className="fam-info">
                      <div className="fam-name">Mum</div>
                      <div className="fam-sub">5 records · 2 new</div>
                    </div>
                    <div
                      className="fam-tag pulse"
                      style={{
                        background: "var(--violet-s)",
                        color: "var(--violet)",
                      }}
                    >
                      2 new
                    </div>
                  </div>
                  <div className="fam-row m3">
                    <div
                      className="fam-av"
                      style={{
                        background: "var(--pink-s)",
                        color: "var(--pink)",
                      }}
                    >
                      VP
                    </div>
                    <div className="fam-info">
                      <div className="fam-name">Dad</div>
                      <div className="fam-sub">1 lab report</div>
                    </div>
                    <div
                      className="fam-tag"
                      style={{
                        background: "var(--pink-s)",
                        color: "var(--pink)",
                      }}
                    >
                      Review
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5: Lab Report Analysis */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="fc-title">Lab Report Analysis</div>
                <div className="fc-desc">
                  Upload any blood test or pathology report. Get a
                  plain-language summary of every result with context on
                  what&apos;s normal.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Blood test results</div>
                  <div className="med-row r1">
                    <div
                      className="med-dot"
                      style={{ background: "#16a34a" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" />
                      <div className="med-line" style={{ width: "60%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{ background: "#dcfce7", color: "#16a34a" }}
                    >
                      Normal
                    </div>
                  </div>
                  <div className="med-row r2">
                    <div
                      className="med-dot"
                      style={{ background: "var(--pink)" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" style={{ width: "55%" }} />
                      <div className="med-line" style={{ width: "40%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{
                        background: "var(--pink-s)",
                        color: "var(--pink)",
                      }}
                    >
                      Low ↓
                    </div>
                  </div>
                  <div className="med-row r3">
                    <div
                      className="med-dot"
                      style={{ background: "var(--violet)" }}
                    />
                    <div className="med-lines">
                      <div className="med-line d" style={{ width: "75%" }} />
                      <div className="med-line" style={{ width: "50%" }} />
                    </div>
                    <div
                      className="med-badge"
                      style={{
                        background: "var(--violet-s)",
                        color: "var(--violet)",
                      }}
                    >
                      Review
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6: Share */}
            <div className="fc">
              <div className="fc-head">
                <div className="fc-icon-sm">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z"
                    />
                  </svg>
                </div>
                <div className="fc-title">Share with Your Doctor</div>
                <div className="fc-desc">
                  Generate a secure link or PDF summary to share any record
                  directly with your healthcare provider.
                </div>
              </div>
              <div className="fc-vis">
                <div className="fc-vis-box">
                  <div className="fc-vis-lbl">Share options</div>
                  <div className="share-row s1">
                    <div
                      className="share-icon"
                      style={{ background: "var(--blue-s)" }}
                    >
                      🔗
                    </div>
                    <div className="share-info">
                      <div className="share-name">Secure link</div>
                      <div className="share-sub">Expires in 7 days</div>
                    </div>
                    <div
                      className="share-btn"
                      style={{
                        background: "var(--blue-s)",
                        color: "var(--blue)",
                      }}
                    >
                      Copy
                    </div>
                  </div>
                  <div className="share-row s2">
                    <div
                      className="share-icon"
                      style={{ background: "var(--violet-s)" }}
                    >
                      📄
                    </div>
                    <div className="share-info">
                      <div className="share-name">PDF summary</div>
                      <div className="share-sub">Ready to download</div>
                    </div>
                    <div
                      className="share-btn"
                      style={{
                        background: "var(--violet-s)",
                        color: "var(--violet)",
                      }}
                    >
                      Export
                    </div>
                  </div>
                  <div className="share-row s3">
                    <div
                      className="share-icon"
                      style={{ background: "var(--pink-s)" }}
                    >
                      💬
                    </div>
                    <div className="share-info">
                      <div className="share-name">WhatsApp</div>
                      <div className="share-sub">Share instantly</div>
                    </div>
                    <div
                      className="share-btn"
                      style={{
                        background: "var(--pink-s)",
                        color: "var(--pink)",
                      }}
                    >
                      Send
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-section">
        <div className="wrap">
          <div className="tc">
            <p className="s-eye">How It Works</p>
            <h2 className="s-h2">
              From confusing document
              <br />
              to clear answers in <em className="hl">60 seconds</em>
            </h2>
          </div>
          <div className="steps-path">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-title">Take a photo or upload</div>
              <div className="step-p">
                Any prescription or lab report. Messy handwriting included.
                Photos, PDFs, scans all work.
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-title">We read it for you</div>
              <div className="step-p">
                Our AI extracts every medication, dosage, and test result even
                from unclear handwriting.
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-title">Get a plain-language breakdown</div>
              <div className="step-p">
                Every medication in plain English. What it treats, how to take
                it, what to watch for.
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <div className="step-title">Save to your health history</div>
              <div className="step-p">
                Every record saved. Full family timeline. Never lose track of a
                diagnosis or prescription again.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi-section" id="testimonials">
        <div className="testi-head">
          <p className="s-eye">What people are saying</p>
          <h2 className="s-h2">
            Real moments of <em className="hl">clarity</em>
          </h2>
        </div>
        <div className="testi-grid">
          <div className="tcard">
            <p className="tcard-text">
              &ldquo;My father was on 7 medications after his surgery and nobody
              explained what they were for. I uploaded his prescription and
              finally understood everything in under 2 minutes. I cried a
              little.&rdquo;
            </p>
            <div className="tcard-author">
              <div className="tcard-av">RS</div>
              <div>
                <div className="tcard-name">Rashmi S.</div>
                <div className="tcard-role">Caregiver · Bangalore</div>
              </div>
            </div>
          </div>
          <div className="tcard">
            <p className="tcard-text">
              &ldquo;I was newly diagnosed with Type 2 diabetes and given 3
              prescriptions I&apos;d never heard of. Vitae explained each one in
              plain English what it does, how to take it, what to avoid. I
              felt in control for the first time.&rdquo;
            </p>
            <div className="tcard-author">
              <div
                className="tcard-av"
                style={{ background: "rgba(29,78,216,.1)" }}
              >
                AK
              </div>
              <div>
                <div className="tcard-name">Amit K.</div>
                <div className="tcard-role">Patient · Mumbai</div>
              </div>
            </div>
          </div>
          <div className="tcard">
            <p className="tcard-text">
              &ldquo;My son has asthma and every appointment ends with a new
              inhaler or tablet. I used to nod along without really
              understanding. Now I upload straight from the clinic and always
              know exactly what he&apos;s been prescribed.&rdquo;
            </p>
            <div className="tcard-author">
              <div
                className="tcard-av"
                style={{ background: "rgba(29,78,216,.1)" }}
              >
                MT
              </div>
              <div>
                <div className="tcard-name">Meera T.</div>
                <div className="tcard-role">Parent · Delhi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <div className="cta-section">
        <div className="cta-box">
          <h2>
            Stop Googling your medications.
            <br />
            Get the real explanation.
          </h2>
          <p>
            No credit card. No commitment.
            <br />
            Plain-language explanation in under 60 seconds.
          </p>
          <div className="cta-btns">
            <Link href="/upload" className="cta-btn-w">Start for Free →</Link>
            <Link href="/auth" className="cta-btn-o">Create Account</Link>
          </div>
          <p className="cta-fine">
            No account needed to try · End-to-end encrypted · Takes 60 seconds
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer id="footer">
        <div className="foot-inner">
          {/* Col 1: Brand */}
          <div>
            <div className="foot-logo">
              <span className="logo-mark">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 30 30"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="30" height="30" rx="8.5" fill="#1d4ed8" />
                  <path
                    d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              Vitae
            </div>
            <p className="foot-tag">Built by people who got confused by medical jargon too.</p>
          </div>
          {/* Col 2: Newsletter */}
          <div>
            <NewsletterForm />
          </div>
          {/* Col 3: Get in touch */}
          <div>
            <div className="foot-newsletter-head">Get in Touch</div>
            <div className="foot-touch-row">
              <div className="foot-newsletter-sub">Have a question, a partnership idea, or just want to say hi? We&apos;d love to hear from you.</div>
              <ContactModal />
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Vitae. All rights reserved.</span>
          <span>
            <a href="#">Privacy Policy</a> · <a href="#">Terms</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
