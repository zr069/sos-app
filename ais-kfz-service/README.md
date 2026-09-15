# AIS Kfz — Website

Aktuell nur eine minimale Platzhalter-/Kontaktseite (`index.html`) sowie
`impressum.html` und `datenschutz.html`. Statisch, ohne Build.

Die frühere ausführliche Version ist in der Git-Historie erhalten und kann bei
Bedarf wiederhergestellt werden.

## Lokal starten
```bash
python3 -m http.server 4178
```

## Deployment (Vercel)
Statisches Projekt, Root = dieser Ordner, kein Build-Command. `www.ais-kfz.de`
ist die primäre Domain; `ais-kfz.de` leitet dorthin weiter (`vercel.json`).
