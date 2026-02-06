import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'Über uns', href: '#ueber-uns' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Warum wir', href: '#warum-traumerde' },
  { label: 'Kontakt', href: '#kontakt' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white ${
        scrolled
          ? 'shadow-md shadow-earth-900/8'
          : 'shadow-sm shadow-earth-900/5'
      }`}
    >
      <div className="section-padding">
        <div className="section-container flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Traumerde Logo"
              className="h-9 lg:h-11 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div
              className="hidden items-center justify-center h-9 lg:h-11 w-9 lg:w-11 rounded-full bg-forest-600 text-white font-display font-bold text-base"
              style={{ display: 'none' }}
            >
              T
            </div>
            <span className="font-display text-xl lg:text-2xl font-semibold text-earth-900">
              Traumerde
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[15px] font-medium text-earth-600 hover:text-earth-900 transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-forest-600 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <a
              href="#kontakt"
              className="ml-2 px-7 py-2.5 bg-earth-900 text-white text-sm font-semibold rounded-full hover:bg-earth-800 transition-all duration-300"
            >
              Beratung anfragen
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-earth-800"
            aria-label="Menü"
          >
            {mobileOpen ? <HiX size={26} /> : <HiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-white border-t border-earth-100 overflow-hidden"
          >
            <div className="section-padding py-6 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-earth-700 hover:text-earth-900 font-medium py-3 px-3 rounded-lg hover:bg-earth-50 transition-all"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#kontakt"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-3 px-6 py-3 bg-earth-900 text-white text-center font-semibold rounded-full"
              >
                Beratung anfragen
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
