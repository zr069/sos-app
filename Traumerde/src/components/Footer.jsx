import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi'

export default function Footer({ onOpenImpressum, onOpenDatenschutz }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-earth-900 text-earth-300">
      <div className="section-padding py-16 lg:py-20">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/logo.png"
                  alt="Traumerde Logo"
                  className="h-9 w-auto object-contain brightness-0 invert opacity-80"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className="hidden items-center justify-center h-9 w-9 rounded-full bg-forest-600 text-white font-display font-bold text-sm"
                  style={{ display: 'none' }}
                >
                  T
                </div>
                <span className="font-display text-xl font-semibold text-white">
                  Traumerde
                </span>
              </div>
              <p className="text-earth-400 leading-relaxed text-sm max-w-xs">
                Professioneller Garten- und Landschaftsbau in Frankfurt am Main.
                Ihr Partner für traumhafte Außenanlagen.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Navigation</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#ueber-uns" className="text-earth-400 hover:text-white transition-colors">Über uns</a></li>
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Leistungen</a></li>
                <li><a href="#warum-traumerde" className="text-earth-400 hover:text-white transition-colors">Warum Traumerde</a></li>
                <li><a href="#kontakt" className="text-earth-400 hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>

            {/* Leistungen */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Leistungen</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Gartenplanung</a></li>
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Pflasterarbeiten</a></li>
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Bepflanzung</a></li>
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Rasenpflege</a></li>
                <li><a href="#leistungen" className="text-earth-400 hover:text-white transition-colors">Teich- & Zaunbau</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Kontakt</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <HiOutlinePhone className="text-earth-500 flex-shrink-0" size={15} />
                  <a href="tel:+491629803805" className="text-earth-400 hover:text-white transition-colors">0162 9803805</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <HiOutlineMail className="text-earth-500 flex-shrink-0" size={15} />
                  <a href="mailto:info@traumerde.de" className="text-earth-400 hover:text-white transition-colors">info@traumerde.de</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <HiOutlineLocationMarker className="text-earth-500 flex-shrink-0 mt-0.5" size={15} />
                  <span className="text-earth-400">Im Heidenfeld 37<br />60439 Frankfurt am Main</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 pt-6 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-earth-500">
            <p>&copy; {currentYear} Traumerde – Dennis Fürth. Alle Rechte vorbehalten.</p>
            <div className="flex gap-5">
              <button onClick={onOpenImpressum} className="hover:text-white transition-colors cursor-pointer">Impressum</button>
              <button onClick={onOpenDatenschutz} className="hover:text-white transition-colors cursor-pointer">Datenschutz</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
