import Link from 'next/link'
import { MobileNav } from '@/components/layout/MobileNav'
import './homepage.css'

/**
 * Homepage — ported verbatim from preview-homepage.html (Palette D).
 * Uses dedicated homepage.css with all animations/styles scoped under .hp
 * Self-contained nav + footer (does not use the layout's PageHeader/PageFooter).
 */

export default function HomePage() {
  return (
    <div className="hp">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="logo"><div className="logo-dot" /><span>Vitae</span></div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">For Families</a>
          <a href="#">Privacy</a>
        </div>
        <div className="nav-cta">
          <Link href="/auth" className="btn-ghost">Sign in</Link>
          <Link href="/upload" className="btn-nav">Open App</Link>
        </div>
        <MobileNav />
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

        <div className="hero-text">
          <div className="eyebrow fi1"><div className="eyebrow-dot" /><span>AI-Powered Health Intelligence</span></div>
          <h1 className="hero-h1 fi2">Your health records,<br /><em>finally</em> understood.</h1>
          <p className="hero-p fi3">Upload any prescription or lab report. Vitae reads it — even messy handwriting — and gives you a plain-language explanation of every medication and what it means for you.</p>
          <div className="hero-actions fi4">
            <Link href="/upload" className="btn-cta"><span className="hp-cta-full">Get Plain-Language Explanation — Free</span><span className="hp-cta-short">Explain My Prescription — Free</span></Link>
            <a href="#how-it-works" className="btn-outline">See how it works</a>
          </div>
          <p className="cta-sub fi4">Already have an account? <Link href="/auth">Sign in</Link></p>
          <div className="trust-row fi5">
            <div className="avatars">
              <div className="av">G</div><div className="av">P</div><div className="av">R</div>
              <div className="av" style={{background:'var(--pink-s)',color:'var(--pink)'}}>+</div>
            </div>
            <p className="trust-txt"><strong>14,200+ prescriptions</strong> explained this month</p>
          </div>
          <div className="badges fi5">
            <div className="badge"><svg width="13" height="13" fill="none" stroke="#a855f7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>End-to-end encrypted</div>
            <div className="badge"><svg width="13" height="13" fill="none" stroke="#a855f7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Data never sold</div>
            <div className="badge"><svg width="13" height="13" fill="none" stroke="#ec4899" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>No credit card needed</div>
          </div>
        </div>

        {/* Mobile-only simplified hero visual */}
        <div className="hero-visual-mobile fi3">
          <div className="scan-card-mobile">
            <div className="mini-scan-line" />
            <div className="sc-clinic">City Health Clinic</div>
            <div className="sc-addr">Dr. A. Sharma, MBBS MD</div>
            <div style={{marginTop:12,display:'flex',flexDirection:'column',gap:6}}>
              <div className="rxl d" style={{width:'75%'}} /><div className="rxl f" style={{height:7}} /><div className="rxl h" />
            </div>
            <div className="mobile-chips">
              <div className="mobile-chip"><span>💊</span> Metformin</div>
              <div className="mobile-chip"><span>⚗️</span> 500mg</div>
              <div className="mobile-chip"><span>🕐</span> 2× daily</div>
            </div>
          </div>
        </div>

        <div className="hero-visual fi3">
          {/* Floating docs */}
          <div className="float-doc doc-a"><div className="fdh">Prescription</div><div className="fdl d" style={{width:'75%'}} /><div className="fdl" style={{width:'100%'}} /><div className="fdl" style={{width:'55%'}} /><div className="fdl d" style={{width:'80%',marginTop:4}} /><div className="fdl" style={{width:'60%'}} /></div>
          <div className="float-doc doc-b"><div className="fdh">Lab Report</div><div className="fdl d" style={{width:'90%'}} /><div className="fdl" style={{width:'70%'}} /><div className="fdl" style={{width:'100%'}} /><div className="fdl d" style={{width:'60%',marginTop:4}} /></div>
          <div className="float-doc doc-c"><div className="fdh">Blood Test</div><div className="fdl d" style={{width:'85%'}} /><div className="fdl" style={{width:'65%'}} /><div className="fdl" style={{width:'90%'}} /></div>

          {/* Scan card */}
          <div className="scan-wrap">
            <div className="scan-depth-2" /><div className="scan-depth-1" />
            <div className="scan-card">
              <div className="scan-line" /><div className="scan-glow" />
              <div className="sc-hdr"><div><div className="sc-clinic">City Health Clinic</div><div className="sc-addr">Dr. A. Sharma, MBBS MD<br />Reg. No. MH-84271</div></div></div>
              <div style={{fontSize:9,color:'var(--text-m)',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase' as const,marginBottom:12}}>Prescription</div>
              <div className="rxlines"><div className="rxl d q" /><div className="rxl f" style={{height:8}} /><div className="rxl h" /></div>
              <div className="rxs"><div className="rxs-lbl">Rx</div><div className="rxlines"><div className="rxl d f" /><div className="rxl q" /><div style={{height:10}} /><div className="rxl d f" /><div className="rxl t" /><div style={{height:10}} /><div className="rxl d q" /><div className="rxl h" /></div></div>
              <div className="sig-area"><div><div className="sig-line" /><div className="sig-lbl">Doctor&apos;s Signature</div></div><div className="stamp"><div className="stamp-txt">CLINIC<br />STAMP</div></div></div>
            </div>
            {/* Chips */}
            <div className="chip chip-a"><div className="chip-ico" style={{background:'var(--violet-s)'}}>💊</div><div><div className="chip-lbl">Medicine</div><div className="chip-val">Metformin</div></div></div>
            <div className="chip chip-b"><div className="chip-ico" style={{background:'var(--blue-s)'}}>⚗️</div><div><div className="chip-lbl">Dosage</div><div className="chip-val">500mg</div></div></div>
            <div className="chip chip-c"><div className="chip-ico" style={{background:'var(--pink-s)'}}>🕐</div><div><div className="chip-lbl">Frequency</div><div className="chip-val">Twice daily</div></div></div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {['Prescriptions decoded in seconds','Lab reports in plain language','Family health hub','End-to-end encrypted','Handwritten prescriptions supported','No medical jargon · ever',
            'Prescriptions decoded in seconds','Lab reports in plain language','Family health hub','End-to-end encrypted','Handwritten prescriptions supported','No medical jargon · ever',
          ].map((t, i) => (
            <div key={i} className="ticker-item"><div className="ticker-dot" />{t}</div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{background:'var(--bg)'}}>
        <div className="wrap">
          <div className="tc">
            <p className="s-eye">Features</p>
            <h2 className="s-h2">Built around how you actually<br />use your health records</h2>
            <p className="s-sub" style={{maxWidth:480,margin:'0 auto'}}>Not just extraction — understanding. Every feature is designed around a real moment of confusion.</p>
          </div>

          <div className="feat-grid">
            {/* 1: AI Explanation */}
            <div className="fc">
              <div className="fc-icon" style={{background:'var(--blue-s)'}}>💡</div>
              <div className="fc-title">Plain-Language Explanations</div>
              <div className="fc-desc">Every medication explained — dosage, purpose, side effects — in under 30 seconds.</div>
              <div className="fc-vis">
                <div style={{fontSize:9,fontWeight:700,color:'var(--text-m)',textTransform:'uppercase' as const,letterSpacing:'.09em',marginBottom:10}}>Prescription analysed</div>
                <div className="med-row r1"><div className="med-dot" style={{background:'var(--blue)'}} /><div className="med-lines"><div className="med-line d" /><div className="med-line" style={{width:'65%'}} /></div><div className="med-badge" style={{background:'var(--blue-s)',color:'var(--blue)'}}>✓ Safe</div></div>
                <div className="med-row r2"><div className="med-dot" style={{background:'var(--violet)'}} /><div className="med-lines"><div className="med-line d" style={{width:'80%'}} /><div className="med-line" style={{width:'55%'}} /></div><div className="med-badge" style={{background:'var(--violet-s)',color:'var(--violet)'}}>1× daily</div></div>
                <div className="med-row r3"><div className="med-dot" style={{background:'var(--pink)'}} /><div className="med-lines"><div className="med-line d" style={{width:'70%'}} /><div className="med-line" style={{width:'48%'}} /></div><div className="med-badge" style={{background:'var(--pink-s)',color:'var(--pink)'}}>⚠ Note</div></div>
              </div>
            </div>

            {/* 2: Privacy */}
            <div className="fc">
              <div className="shield-icon">🔒</div>
              <div className="fc-title">Your Data Stays Yours</div>
              <div className="fc-desc">End-to-end encrypted. Never sold. Never used for ads. Your most private records, protected.</div>
              <div className="check-list">
                <div className="check-item c1"><div className="check-tick">✓</div>AES-256 encryption at rest</div>
                <div className="check-item c2"><div className="check-tick">✓</div>TLS 1.3 in transit</div>
                <div className="check-item c3"><div className="check-tick">✓</div>Zero third-party data sharing</div>
              </div>
            </div>

            {/* 3: Any Format */}
            <div className="fc">
              <div className="fc-icon" style={{background:'var(--pink-s)'}}>📷</div>
              <div className="fc-title">Reads Any Format</div>
              <div className="fc-desc">Handwritten, printed, blurry photo, multi-page PDF. If your doctor wrote it, we can read it.</div>
              <div className="fc-vis">
                <div className="mini-doc">
                  <div className="mini-scan-line" />
                  <div className="mini-doc-line d" style={{width:'85%'}} /><div className="mini-doc-line" style={{width:'100%'}} />
                  <div className="mini-doc-line d" style={{width:'70%'}} /><div className="mini-doc-line" style={{width:'90%'}} />
                  <div className="mini-doc-line" style={{width:'60%'}} />
                </div>
                <div className="format-tags">
                  <span className="fmt-tag t1">JPG / PNG</span><span className="fmt-tag t2">PDF</span>
                  <span className="fmt-tag t3">Handwritten</span><span className="fmt-tag t4">Scanned</span>
                </div>
              </div>
            </div>

            {/* 4: Family Hub */}
            <div className="fc">
              <div className="fc-icon" style={{background:'var(--violet-s)'}}>👨‍👩‍👧‍👦</div>
              <div className="fc-title">Your Whole Family, One Place</div>
              <div className="fc-desc">One account for your parents, spouse, children. Everyone&apos;s health history always accessible.</div>
              <div className="fc-vis">
                <div style={{fontSize:9,fontWeight:700,color:'var(--text-m)',textTransform:'uppercase' as const,letterSpacing:'.09em',marginBottom:10}}>Family hub · 3 profiles</div>
                <div className="fam-row m1"><div className="fam-av" style={{background:'var(--blue-s)',color:'var(--blue)'}}>RS</div><div className="fam-info"><div className="fam-name">Robert (You)</div><div className="fam-sub">3 prescriptions</div></div><div className="fam-tag" style={{background:'var(--blue-s)',color:'var(--blue)'}}>Active</div></div>
                <div className="fam-row m2"><div className="fam-av" style={{background:'var(--violet-s)',color:'var(--violet)'}}>MR</div><div className="fam-info"><div className="fam-name">Mum</div><div className="fam-sub">5 records · 2 new</div></div><div className="fam-tag pulse" style={{background:'var(--violet-s)',color:'var(--violet)'}}>2 new</div></div>
                <div className="fam-row m3"><div className="fam-av" style={{background:'var(--pink-s)',color:'var(--pink)'}}>VP</div><div className="fam-info"><div className="fam-name">Dad</div><div className="fam-sub">1 lab report</div></div><div className="fam-tag" style={{background:'var(--pink-s)',color:'var(--pink)'}}>Review</div></div>
              </div>
            </div>

            {/* 5: Track */}
            <div className="fc">
              <div className="fc-icon" style={{background:'var(--blue-s)'}}>📊</div>
              <div className="fc-title">Track Changes Over Time</div>
              <div className="fc-desc">Spot trends across visits. See how your values shift prescription by prescription, test by test.</div>
              <div className="fc-vis">
                <div style={{fontSize:9,fontWeight:700,color:'var(--text-m)',textTransform:'uppercase' as const,letterSpacing:'.09em',marginBottom:12}}>Latest lab results</div>
                <div className="track-row"><div className="track-label">HbA1c</div><div className="track-bar-bg"><div className="track-bar-fill b1" /></div><div className="track-val">6.8% <span style={{color:'#16a34a',fontSize:9}}>↓</span></div></div>
                <div className="track-row"><div className="track-label">Vit D</div><div className="track-bar-bg"><div className="track-bar-fill b2" /></div><div className="track-val">22 ng/mL <span style={{color:'var(--pink)',fontSize:9}}>↑</span></div></div>
                <div className="track-row"><div className="track-label">BP</div><div className="track-bar-bg"><div className="track-bar-fill b3" /></div><div className="track-val">128/84 <span style={{color:'var(--violet)',fontSize:9}}>→</span></div></div>
              </div>
            </div>

            {/* 6: Share */}
            <div className="fc">
              <div className="fc-icon" style={{background:'var(--pink-s)'}}>🔗</div>
              <div className="fc-title">Share with Your Doctor</div>
              <div className="fc-desc">Generate a secure link or PDF summary to share any record directly with your healthcare provider.</div>
              <div className="fc-vis">
                <div style={{fontSize:9,fontWeight:700,color:'var(--text-m)',textTransform:'uppercase' as const,letterSpacing:'.09em',marginBottom:10}}>Share options</div>
                <div className="share-row s1"><div className="share-icon" style={{background:'var(--blue-s)'}}>🔗</div><div className="share-info"><div className="share-name">Secure link</div><div className="share-sub">Expires in 7 days</div></div><div className="share-btn" style={{background:'var(--blue-s)',color:'var(--blue)'}}>Copy</div></div>
                <div className="share-row s2"><div className="share-icon" style={{background:'var(--violet-s)'}}>📄</div><div className="share-info"><div className="share-name">PDF summary</div><div className="share-sub">Ready to download</div></div><div className="share-btn" style={{background:'var(--violet-s)',color:'var(--violet)'}}>Export</div></div>
                <div className="share-row s3"><div className="share-icon" style={{background:'var(--pink-s)'}}>💬</div><div className="share-info"><div className="share-name">WhatsApp</div><div className="share-sub">Share instantly</div></div><div className="share-btn" style={{background:'var(--pink-s)',color:'var(--pink)'}}>Send</div></div>
                <div className="share-link-anim" />
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
            <h2 className="s-h2">From confusing document<br />to clear answers in 60 seconds</h2>
          </div>
          <div className="steps-path">
            <div className="step-card"><div className="step-num">1</div><div className="step-title">Take a photo or upload</div><div className="step-p">Any prescription or lab report. Messy handwriting included. Photos, PDFs, scans — all work.</div><div className="step-vis"><div className="sv-row"><div className="svi">📁</div><div className="svl d" /></div><div className="sv-row"><div className="svi">📷</div><div className="svl" /></div></div></div>
            <div className="step-card"><div className="step-num">2</div><div className="step-title">We read it for you</div><div className="step-p">Our AI extracts every medication, dosage, and test result — even from unclear handwriting.</div><div className="step-vis"><div className="sv-row"><div className="svi">🔍</div><div className="svl d" style={{background:'linear-gradient(90deg,var(--blue),var(--violet))',height:6,borderRadius:3}} /></div><div className="sv-row"><div className="svi">⚙️</div><div className="svl" /></div></div></div>
            <div className="step-card"><div className="step-num">3</div><div className="step-title">Get a plain-language breakdown</div><div className="step-p">Every medication in plain English. What it treats, how to take it, what to watch for.</div><div className="step-vis"><div className="sv-row"><div className="svi">💊</div><div className="svl d" /><span style={{fontSize:9,fontWeight:700,padding:'2px 6px',background:'var(--violet-s)',color:'var(--violet)',borderRadius:4,whiteSpace:'nowrap' as const}}>✓ Explained</span></div><div className="sv-row"><div className="svi">📋</div><div className="svl" /></div></div></div>
            <div className="step-card"><div className="step-num">4</div><div className="step-title">Save to your health history</div><div className="step-p">Every record saved. Full family timeline. Never lose track of a diagnosis or prescription again.</div><div className="step-vis"><div className="sv-row"><div className="svi">👤</div><div className="svl d" /></div><div className="sv-row"><div className="svi">🗂️</div><div className="svl" /></div></div></div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item stat-quote-item"><p className="stat-quote">&ldquo;I finally understood my father&apos;s medication after 3 years of confusion.&rdquo;</p><p className="stat-quote-sub">— Rashmi S., Caregiver · Bangalore</p></div>
          <div className="stat-item"><div className="stat-num">14<span>K+</span></div><div className="stat-lbl">Prescriptions explained this month</div></div>
          <div className="stat-item"><div className="stat-num">2<span>,400+</span></div><div className="stat-lbl">Families using Vitae</div></div>
          <div className="stat-item"><div className="stat-num">&lt;<span>60s</span></div><div className="stat-lbl">Average time to plain-language result</div></div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <div className="testimonial-wrap">
        <div className="testimonial-inner">
          <div className="stars">★★★★★</div>
          <div className="q-mark">&ldquo;</div>
          <p className="q-text">My father was on 7 medications after his surgery and no one explained what they were for. I uploaded his prescription and finally understood — in 2 minutes.</p>
          <div className="q-author"><div className="q-av">RS</div><div><div className="q-name">Rashmi S.</div><div className="q-role">Caregiver · Bangalore</div></div></div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="cta-section">
        <div className="cta-box">
          <h2>Stop Googling your medications.<br />Get the real explanation.</h2>
          <p>No credit card. No commitment.<br />Plain-language explanation in under 60 seconds.</p>
          <div className="cta-btns">
            <Link href="/upload" className="cta-btn-w">Upload My First Prescription →</Link>
            <Link href="/auth" className="cta-btn-o">Create Free Account</Link>
          </div>
          <p className="cta-fine">No account needed to try · End-to-end encrypted · Takes 60 seconds</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="foot-inner">
          <div><div className="foot-logo"><div className="logo-dot" />Vitae</div><p className="foot-tag">Built by people who got confused<br />by medical jargon too.</p></div>
          <div className="foot-col"><h4>Product</h4><a href="#features">Features</a><a href="#how-it-works">How it works</a><Link href="/upload">Try Upload</Link></div>
          <div className="foot-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Contact</a></div>
          <div className="foot-col"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms</a><a href="#">Data Protection</a></div>
          <div>
            <p className="nl-lbl">Stay Updated</p><p className="nl-sub">Health tips + new features. No spam.</p>
            <form className="nl-form" action="#"><input className="nl-input" type="email" placeholder="your@email.com" /><button className="nl-btn" type="submit">Go</button></form>
          </div>
        </div>
        <div className="foot-bottom"><span>© 2026 Vitae. All rights reserved.</span><span>Made by people who got confused by medical jargon too.</span></div>
      </footer>

    </div>
  )
}
