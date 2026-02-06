import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { HiOutlineBadgeCheck, HiOutlineLocationMarker, HiOutlineChatAlt2, HiOutlineClock } from 'react-icons/hi'

const reasons = [
  {
    icon: HiOutlineBadgeCheck,
    title: 'Erfahrung & Kompetenz',
    text: 'Fundiertes Fachwissen im Garten- und Landschaftsbau, umgesetzt mit modernsten Techniken und Materialien.',
  },
  {
    icon: HiOutlineLocationMarker,
    title: 'Regional in Frankfurt',
    text: 'Als Frankfurter Unternehmen kennen wir die lokalen Böden, das Klima und die Besonderheiten der Region.',
  },
  {
    icon: HiOutlineChatAlt2,
    title: 'Kostenlose Beratung',
    text: 'Wir nehmen uns Zeit für Sie – im persönlichen Gespräch vor Ort, unverbindlich und kostenfrei.',
  },
  {
    icon: HiOutlineClock,
    title: 'Termingerecht & Fair',
    text: 'Transparente Angebote ohne versteckte Kosten und zuverlässige Einhaltung vereinbarter Termine.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function WhyUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="warum-traumerde" className="py-24 lg:py-36 section-padding bg-earth-900">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-forest-300 font-semibold text-sm tracking-[0.15em] uppercase"
          >
            Warum Traumerde
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1]"
          >
            Ihr Vertrauen ist unser Antrieb
          </motion.h2>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={itemVariants}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-white/10 flex items-center justify-center text-forest-300 mb-5">
                <reason.icon size={26} />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2.5">
                {reason.title}
              </h3>
              <p className="text-earth-300 leading-relaxed text-[15px]">
                {reason.text}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-14"
        >
          <a
            href="#kontakt"
            className="inline-flex px-8 py-4 bg-white text-earth-900 font-semibold rounded-full hover:bg-earth-50 transition-all duration-300 text-base"
          >
            Jetzt unverbindlich anfragen
          </a>
        </motion.div>
      </div>
    </section>
  )
}
