import { ContactModal }    from '@/components/layout/ContactModal'
import { NewsletterForm }  from '@/components/layout/NewsletterForm'
import '@/app/homepage.css'

export function HomepageFooter() {
  return (
    <div className="hp">
      <footer id="footer">
        <div className="foot-inner">
          {/* Col 1: Brand */}
          <div>
            <div className="foot-logo">
              <span className="logo-mark">
                <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                  <rect width="30" height="30" rx="8.5" fill="#1d4ed8" />
                  <path
                    d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15"
                    stroke="white" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" fill="none"
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
              <div className="foot-newsletter-sub">
                Have a question, a partnership idea, or just want to say hi? We&apos;d love to hear from you.
              </div>
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
  )
}
