import AnimatedSection from './AnimatedSection'
import { HiCheckCircle } from 'react-icons/hi'

const values = [
  {
    title: 'Qualität',
    text: 'Wir arbeiten ausschließlich mit hochwertigen Materialien und setzen auf handwerkliche Perfektion bis ins Detail.',
  },
  {
    title: 'Zuverlässigkeit',
    text: 'Termingerecht, transparent und fair – bei uns wissen Sie immer, woran Sie sind.',
  },
  {
    title: 'Nachhaltigkeit',
    text: 'Ökologisch verantwortungsvolles Arbeiten mit heimischen Pflanzen und nachhaltigen Methoden.',
  },
]

export default function About() {
  return (
    <section id="ueber-uns" className="py-24 lg:py-36 section-padding bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <AnimatedSection direction="left">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                alt="Garten- und Landschaftsbau Arbeit"
                className="w-full aspect-[4/5] object-cover rounded-2xl"
              />
              <div className="absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-earth-100" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <div>
            <AnimatedSection direction="right" delay={0.1}>
              <span className="text-forest-600 font-semibold text-sm tracking-[0.15em] uppercase">
                Über uns
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-earth-900 leading-[1.1]">
                Traumhafte Gärten aus Meisterhand
              </h2>
              <p className="mt-6 text-earth-500 text-lg leading-relaxed">
                Hinter Traumerde steht Dennis Fürth – ein leidenschaftlicher Garten- und
                Landschaftsbauer aus Frankfurt am Main. Mit einem geschulten Auge für
                Design und einem tiefen Verständnis für Natur schaffen wir Außenräume,
                die begeistern und Bestand haben.
              </p>
              <p className="mt-4 text-earth-500 text-lg leading-relaxed">
                Jedes Projekt ist für uns einzigartig. Wir hören zu, planen sorgfältig
                und setzen mit handwerklicher Präzision um – für Gärten, die Ihre
                persönliche Handschrift tragen.
              </p>
            </AnimatedSection>

            <div className="mt-10 space-y-5">
              {values.map((value, i) => (
                <AnimatedSection key={value.title} delay={0.2 + i * 0.1} direction="right">
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-earth-50 transition-colors duration-300">
                    <HiCheckCircle className="text-forest-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-earth-800 text-lg">{value.title}</h3>
                      <p className="text-earth-500 mt-1 leading-relaxed">{value.text}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
