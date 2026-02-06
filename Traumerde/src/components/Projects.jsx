import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const projects = [
  {
    title: 'Moderne Terrasse',
    location: 'Sachsenhausen',
    category: 'Pflasterarbeiten',
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=80',
    large: true,
  },
  {
    title: 'Japanischer Garten',
    location: 'Nordend',
    category: 'Gartenplanung',
    image: 'https://images.unsplash.com/photo-1598902108854-d1446677db6b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Naturteich-Anlage',
    location: 'Oberursel',
    category: 'Teichbau',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Rasen & Bepflanzung',
    location: 'Bockenheim',
    category: 'Bepflanzung',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Exklusive Gartenlounge',
    location: 'Westend',
    category: 'Gartenplanung',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    large: true,
  },
  {
    title: 'Sichtschutz & Zaun',
    location: 'Bad Vilbel',
    category: 'Zaunbau',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-950/95 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        <HiX size={24} />
      </button>

      {/* Navigation */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 sm:left-8 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        <HiChevronLeft size={28} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 sm:right-8 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        <HiChevronRight size={28} />
      </button>

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl max-h-[80vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex].image.replace('w=800', 'w=1600')}
          alt={images[currentIndex].title}
          className="w-full h-full object-contain rounded-2xl"
        />
        <div className="mt-4 text-center">
          <h3 className="text-white font-display text-xl font-semibold">
            {images[currentIndex].title}
          </h3>
          <p className="text-white/40 text-sm mt-1">
            {images[currentIndex].category} · {images[currentIndex].location}
          </p>
        </div>
      </motion.div>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  const openLightbox = (index) => {
    setCurrentImage(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % projects.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + projects.length) % projects.length)

  return (
    <>
      <section id="projekte" className="relative py-32 lg:py-44 section-padding bg-earth-950 overflow-hidden">
        {/* Background accent */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-terra-500/3 rounded-full blur-[150px] pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-forest-400 font-semibold text-sm tracking-[0.2em] uppercase"
            >
              Unsere Projekte
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1]"
            >
              Einblicke in unsere <span className="gradient-text">Arbeit</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 text-white/40 text-lg"
            >
              Jedes Projekt erzählt seine eigene Geschichte. Entdecken Sie eine
              Auswahl unserer realisierten Garten- und Landschaftsbauprojekte.
            </motion.p>
          </div>

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                variants={itemVariants}
                className={`group relative rounded-2xl overflow-hidden ${
                  project.large ? 'sm:col-span-2 lg:col-span-2 aspect-[2/1]' : 'aspect-[4/3]'
                }`}
                onClick={() => openLightbox(index)}
                data-cursor-hover
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-earth-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <motion.div
                    className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                  >
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-forest-500/20 text-forest-400 border border-forest-500/20 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {project.category}
                    </span>
                    <h3 className="font-display text-xl lg:text-2xl font-semibold text-white">
                      {project.title}
                    </h3>
                    <p className="text-white/50 text-sm mt-1">{project.location}</p>
                  </motion.div>
                </div>

                {/* Hover border */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-2xl transition-all duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={projects}
            currentIndex={currentImage}
            onClose={closeLightbox}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </AnimatePresence>
    </>
  )
}
