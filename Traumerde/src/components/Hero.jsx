import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TextReveal } from './AnimatedSection'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.75])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background Image with parallax zoom */}
      <motion.div
        style={{ scale: imageScale }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=2000&q=85"
          alt="Professioneller Garten mit gepflegter Landschaft"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-earth-950"
      />

      {/* Subtle gradient from bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(26,18,16,0.7) 0%, rgba(26,18,16,0.1) 50%, rgba(26,18,16,0.3) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center section-padding">
        <div className="section-container w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block text-forest-300 font-semibold text-sm tracking-[0.2em] uppercase mb-6">
                Garten- & Landschaftsbau · Frankfurt am Main
              </span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-[1.08] tracking-tight">
              <TextReveal text="Wir gestalten Ihren" delay={0.3} />
              <br />
              <span className="text-forest-300">
                <TextReveal text="Traumgarten." delay={0.6} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="mt-7 text-lg sm:text-xl text-white/75 max-w-xl leading-relaxed"
            >
              Von der Planung bis zur Umsetzung – professioneller Garten- und
              Landschaftsbau mit Liebe zum Detail und handwerklicher Perfektion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.3 }}
              className="mt-10 flex flex-col sm:flex-row items-start gap-4"
            >
              <a
                href="#kontakt"
                className="px-9 py-4 bg-white text-earth-900 font-semibold rounded-full hover:bg-earth-50 transition-all duration-300 text-base"
              >
                Kostenlose Beratung anfragen
              </a>
              <a
                href="#leistungen"
                className="group px-8 py-4 text-white/80 hover:text-white font-medium transition-all duration-300 text-base flex items-center gap-2"
              >
                Unsere Leistungen
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
            </motion.div>
          </div>

          {/* Trust indicators at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6 }}
            className="absolute bottom-12 left-0 right-0 section-padding"
          >
            <div className="section-container">
              <div className="flex items-center gap-8 sm:gap-12">
                <div>
                  <span className="text-xl sm:text-2xl font-display font-bold text-white">Frankfurt</span>
                  <p className="text-sm text-white/50 mt-0.5">& Umgebung</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <span className="text-xl sm:text-2xl font-display font-bold text-white">Kostenlose</span>
                  <p className="text-sm text-white/50 mt-0.5">Erstberatung</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div className="hidden sm:block">
                  <span className="text-xl sm:text-2xl font-display font-bold text-white">100 %</span>
                  <p className="text-sm text-white/50 mt-0.5">Leidenschaft</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
