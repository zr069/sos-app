import { motion } from 'framer-motion'
import { HiX } from 'react-icons/hi'

export default function Datenschutz({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl max-w-3xl w-full p-8 sm:p-12 my-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-earth-400 hover:text-earth-800 transition-colors rounded-lg hover:bg-earth-50"
            aria-label="Schließen"
          >
            <HiX size={24} />
          </button>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-earth-900 mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-earth max-w-none text-earth-700 space-y-6 text-[15px] leading-relaxed">
            <h2 className="font-display text-xl font-semibold text-earth-900 mt-0">
              1. Datenschutz auf einen Blick
            </h2>

            <h3 className="font-semibold text-earth-800 text-base">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit
              Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
              Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
              identifiziert werden können. Ausführliche Informationen zum Thema
              Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten
              Datenschutzerklärung.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">Datenerfassung auf dieser Website</h3>
            <p>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
              Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur verantwortlichen
              Stelle" in dieser Datenschutzerklärung entnehmen.
            </p>
            <p>
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen.
              Hierbei kann es sich z.&nbsp;B. um Daten handeln, die Sie in ein
              Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer
              Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das
              sind vor allem technische Daten (z.&nbsp;B. Internetbrowser,
              Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser
              Daten erfolgt automatisch, sobald Sie diese Website betreten.
            </p>
            <p>
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der
              Website zu gewährleisten. Andere Daten können zur Analyse Ihres
              Nutzerverhaltens verwendet werden.
            </p>
            <p>
              <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft,
              Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu
              erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung
              dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
              Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit
              für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
              Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten
              zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der
              zuständigen Aufsichtsbehörde zu.
            </p>

            <h2 className="font-display text-xl font-semibold text-earth-900">
              2. Hosting
            </h2>
            <p>
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
            </p>
            <p>
              Die genauen Angaben zum Hosting-Anbieter werden bei Bedarf ergänzt.
              Der Hoster erhebt in sog. Logfiles folgende Daten, die Ihr Browser
              übermittelt: IP-Adresse, die Adresse der vorher besuchten Website
              (Referer Anfrage-Header), Datum und Uhrzeit der Anfrage, Zeitzonendifferenz
              zur Greenwich Mean Time, Inhalt der Anforderung, HTTP-Statuscode,
              übertragene Datenmenge, Website, von der die Anforderung kommt und
              Informationen zu Browser und Betriebssystem.
            </p>

            <h2 className="font-display text-xl font-semibold text-earth-900">
              3. Allgemeine Hinweise und Pflichtinformationen
            </h2>

            <h3 className="font-semibold text-earth-800 text-base">Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten
              sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und
              entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser
              Datenschutzerklärung.
            </p>
            <p>
              Wenn Sie diese Website benutzen, werden verschiedene personenbezogene
              Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich
              identifiziert werden können. Die vorliegende Datenschutzerklärung
              erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie
              erläutert auch, wie und zu welchem Zweck das geschieht.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z.&nbsp;B.
              bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein
              lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht
              möglich.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Hinweis zur verantwortlichen Stelle
            </h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            <p>
              Dennis Fürth<br />
              Traumerde – Garten- und Landschaftsbau<br />
              Im Heidenfeld 37<br />
              60439 Frankfurt am Main
            </p>
            <p>
              Telefon: 0162 9803805<br />
              E-Mail: info@traumerde.de
            </p>
            <p>
              Verantwortliche Stelle ist die natürliche oder juristische Person, die
              allein oder gemeinsam mit anderen über die Zwecke und Mittel der
              Verarbeitung von personenbezogenen Daten (z.&nbsp;B. Namen,
              E-Mail-Adressen o.&nbsp;Ä.) entscheidet.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">Speicherdauer</h3>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere
              Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei
              uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
              berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur
              Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir
              keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
              personenbezogenen Daten haben; in letzterem Fall erfolgt die Löschung
              nach Fortfall dieser Gründe.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Widerruf Ihrer Einwilligung zur Datenverarbeitung
            </h3>
            <p>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen
              Einwilligung möglich. Sie können eine bereits erteilte Einwilligung
              jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
              Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Recht auf Datenübertragbarkeit
            </h3>
            <p>
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung
              oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder
              an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen
              zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen
              Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar
              ist.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Auskunft, Löschung und Berichtigung
            </h3>
            <p>
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit
              das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
              personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
              Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung
              dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene
              Daten können Sie sich jederzeit an uns wenden.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Recht auf Einschränkung der Verarbeitung
            </h3>
            <p>
              Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer
              personenbezogenen Daten zu verlangen. Hierzu können Sie sich jederzeit
              an uns wenden.
            </p>

            <h2 className="font-display text-xl font-semibold text-earth-900">
              4. Datenerfassung auf dieser Website
            </h2>

            <h3 className="font-semibold text-earth-800 text-base">Kontaktformular</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre
              Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen
              Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne
              Ihre Einwilligung weiter.
            </p>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags
              zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen
              erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf
              unserem berechtigten Interesse an der effektiven Bearbeitung der an uns
              gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer
              Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
            </p>
            <p>
              Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns,
              bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung
              widerrufen oder der Zweck für die Datenspeicherung entfällt (z.&nbsp;B.
              nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche
              Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">
              Anfrage per E-Mail oder Telefon
            </h3>
            <p>
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage
              inklusive aller daraus hervorgehenden personenbezogenen Daten (Name,
              Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert
              und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung
              weiter.
            </p>

            <h2 className="font-display text-xl font-semibold text-earth-900">
              5. Externe Dienste
            </h2>

            <h3 className="font-semibold text-earth-800 text-base">Google Maps</h3>
            <p>
              Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google
              Ireland Limited („Google"), Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <p>
              Zur Nutzung der Funktionen von Google Maps ist es notwendig, Ihre
              IP-Adresse zu speichern. Diese Informationen werden in der Regel an
              einen Server von Google in den USA übertragen und dort gespeichert. Der
              Anbieter dieser Seite hat keinen Einfluss auf diese Datenübertragung.
            </p>
            <p>
              Die Nutzung von Google Maps erfolgt im Interesse einer ansprechenden
              Darstellung unserer Online-Angebote und an einer leichten Auffindbarkeit
              der von uns auf der Website angegebenen Orte. Dies stellt ein berechtigtes
              Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar.
            </p>
            <p>
              Mehr Informationen zum Umgang mit Nutzerdaten finden Sie in der
              Datenschutzerklärung von Google:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 hover:text-forest-700 underline"
              >
                https://policies.google.com/privacy
              </a>.
            </p>

            <h3 className="font-semibold text-earth-800 text-base">Google Fonts (lokal)</h3>
            <p>
              Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so
              genannte Google Fonts, die von Google bereitgestellt werden. Die Google
              Fonts werden über einen externen Server geladen. Dabei wird Ihre
              IP-Adresse an Google übermittelt.
            </p>
            <p>
              Weitere Informationen zu Google Fonts finden Sie unter{' '}
              <a
                href="https://developers.google.com/fonts/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 hover:text-forest-700 underline"
              >
                https://developers.google.com/fonts/faq
              </a>{' '}
              und in der Datenschutzerklärung von Google:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 hover:text-forest-700 underline"
              >
                https://policies.google.com/privacy
              </a>.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
