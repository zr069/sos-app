import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  HiOutlinePencilAlt,
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
} from 'react-icons/hi'

const services = [
  {
    icon: HiOutlinePencilAlt,
    title: 'Gartenplanung',
    text: 'Individuelle Konzepte und Entwürfe für Ihren Traumgarten – von der Idee bis zum fertigen Plan.',
  },
  {
    icon: HiOutlineCube,
    title: 'Pflasterarbeiten',
    text: 'Terrassen, Wege und Einfahrten aus hochwertigen Naturstein- und Betonmaterialien.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Bepflanzung',
    text: 'Professionelle Bepflanzungskonzepte mit saisonalen und mehrjährigen Pflanzen.',
  },
  {
    icon: HiOutlineSun,
    title: 'Rasenpflege',
    text: 'Vom Rollrasen bis zur Rasensanierung – für ein sattgrünes, gesundes Ergebnis.',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Teichbau',
    text: 'Natürliche Teichanlagen und Wasserspiele, die Ihrem Garten Leben einhauchen.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Zaunbau',
    text: 'Stabile und ästhetische Zäune und Sichtschutzlösungen für Privatsphäre und Sicherheit.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Services() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 })

  return (
    <section id="leistungen" className="py-24 lg:py-36 section-padding" style={{ backgroundColor: '#faf8f5' }}>
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-forest-600 font-semibold text-sm tracking-[0.15em] uppercase"
          >
            Unsere Leistungen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-earth-900 leading-[1.1]"
          >
            Alles aus einer Hand
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 text-earth-500 text-lg"
          >
            Von der Planung bis zur Umsetzung bieten wir Ihnen ein umfassendes
            Leistungsspektrum für Ihren perfekten Außenbereich.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group bg-white rounded-2xl p-8 hover:shadow-lg hover:shadow-earth-900/5 transition-all duration-500 border border-earth-100"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600 group-hover:bg-forest-600 group-hover:text-white transition-all duration-300">
                <service.icon size={24} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-earth-900">
                {service.title}
              </h3>
              <p className="mt-2.5 text-earth-500 leading-relaxed">
                {service.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
