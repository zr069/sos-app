import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import AnimatedSection from './AnimatedSection'
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.3 })

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Bitte geben Sie Ihren Namen ein.'
    if (!form.email.trim()) {
      errs.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
    }
    if (!form.message.trim()) errs.message = 'Bitte geben Sie eine Nachricht ein.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      // TODO: Backend-Integration für Kontaktformular
      setSubmitted(true)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined })
    }
  }

  const inputClass = (field) =>
    `w-full px-5 py-3.5 bg-white border rounded-xl text-earth-800 placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all duration-300 ${
      errors[field] ? 'border-red-400' : 'border-earth-200'
    }`

  return (
    <section id="kontakt" className="py-24 lg:py-36 section-padding" style={{ backgroundColor: '#faf8f5' }}>
      <div className="section-container">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            className="text-forest-600 font-semibold text-sm tracking-[0.15em] uppercase"
          >
            Kontakt
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-earth-900 leading-[1.1]"
          >
            Lassen Sie uns sprechen
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 text-earth-500 text-lg"
          >
            Haben Sie ein Projekt im Sinn? Kontaktieren Sie uns für eine
            kostenlose und unverbindliche Beratung.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form */}
          <AnimatedSection className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center border border-earth-100"
              >
                <div className="w-14 h-14 mx-auto bg-forest-50 text-forest-600 rounded-xl flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-earth-900">Vielen Dank!</h3>
                <p className="mt-3 text-earth-500">
                  Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei Ihnen.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 lg:p-10 border border-earth-100">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-earth-700 mb-2">Name *</label>
                    <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ihr vollständiger Name" className={inputClass('name')} />
                    {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-earth-700 mb-2">E-Mail *</label>
                    <input type="email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="ihre@email.de" className={inputClass('email')} />
                    {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="phone" className="block text-sm font-medium text-earth-700 mb-2">Telefon (optional)</label>
                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Ihre Telefonnummer" className={inputClass('phone')} />
                </div>
                <div className="mt-5">
                  <label htmlFor="message" className="block text-sm font-medium text-earth-700 mb-2">Nachricht *</label>
                  <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Beschreiben Sie Ihr Projekt oder Ihre Wünsche..." className={inputClass('message') + ' resize-none'} />
                  {errors.message && <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full px-8 py-4 bg-earth-900 text-white font-semibold rounded-xl hover:bg-earth-800 transition-all duration-300 text-base"
                >
                  Nachricht senden
                </button>
                <p className="mt-4 text-xs text-earth-400 text-center">
                  Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
                </p>
              </form>
            )}
          </AnimatedSection>

          {/* Sidebar */}
          <AnimatedSection delay={0.2} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-earth-100 space-y-6">
              <h3 className="font-display text-xl font-semibold text-earth-900">Kontaktdaten</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center text-forest-600 flex-shrink-0">
                  <HiOutlinePhone size={18} />
                </div>
                <div>
                  <p className="text-sm text-earth-400">Telefon</p>
                  <a href="tel:+491629803805" className="text-earth-800 font-medium hover:text-forest-600 transition-colors">0162 9803805</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center text-forest-600 flex-shrink-0">
                  <HiOutlineMail size={18} />
                </div>
                <div>
                  <p className="text-sm text-earth-400">E-Mail</p>
                  <a href="mailto:info@traumerde.de" className="text-earth-800 font-medium hover:text-forest-600 transition-colors">info@traumerde.de</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center text-forest-600 flex-shrink-0">
                  <HiOutlineLocationMarker size={18} />
                </div>
                <div>
                  <p className="text-sm text-earth-400">Adresse</p>
                  <p className="text-earth-800 font-medium">Im Heidenfeld 37<br />60439 Frankfurt am Main</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-earth-100 aspect-[4/3]">
              <iframe
                title="Traumerde Standort Frankfurt am Main"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2556.5!2d8.6347!3d50.1617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd096f479f1b0b%3A0x3d249e4f1a3b8e0!2sIm+Heidenfeld+37%2C+60439+Frankfurt+am+Main!5e0!3m2!1sde!2sde!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
