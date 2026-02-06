import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Impressum from './components/Impressum'
import Datenschutz from './components/Datenschutz'

export default function App() {
  const [activePage, setActivePage] = useState(null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <WhyUs />
      <Contact />
      <Footer onOpenImpressum={() => setActivePage('impressum')} onOpenDatenschutz={() => setActivePage('datenschutz')} />

      <AnimatePresence>
        {activePage === 'impressum' && (
          <Impressum onClose={() => setActivePage(null)} />
        )}
        {activePage === 'datenschutz' && (
          <Datenschutz onClose={() => setActivePage(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
