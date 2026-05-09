'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  reports?: any[]
  mediaItems?: any[]
  height?: string
  interactive?: boolean
  showMedia?: boolean
}

const PULSE_CSS = `
@keyframes media-pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.5); opacity: 0.3; }
  100% { transform: scale(1); opacity: 0.9; }
}
.media-marker-pulse {
  animation: media-pulse 2s ease-in-out infinite;
}
`

const POPUP_CSS = `
.dark-popup .leaflet-popup-content-wrapper {
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  border: 1px solid #334155;
}
.dark-popup .leaflet-popup-tip {
  background: #1e293b;
  border: 1px solid #334155;
}
.dark-popup .leaflet-popup-content {
  margin: 10px 12px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
}
`

function createVerifiedIcon(isApproximate: boolean) {
  const size = isApproximate ? 28 : 16
  const ringHtml = isApproximate
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(220,38,38,0.25);background:rgba(220,38,38,0.08);"></div>`
    : ''

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 2)],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${ringHtml}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#dc2626;border:2px solid #fff;box-sizing:border-box;"></div>
      </div>
    `,
  })
}

function createMediaIcon() {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div class="media-marker-pulse" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:rgba(245,158,11,0.15);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px dotted rgba(255,255,255,0.7);box-sizing:border-box;"></div>
      </div>
    `,
  })
}

function buildVerifiedPopup(report: any): string {
  const loc = report.location || {}
  const locationParts = [loc.city, loc.region, loc.country].filter(Boolean)
  const casesText = report.confirmed_cases !== null ? String(report.confirmed_cases) : 'Unknown'
  const deathsText = report.deaths !== null ? String(report.deaths) : 'Unknown'

  let html = `
    <div style="min-width:180px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px;color:#f8fafc;">${report.outbreak?.name || 'Unknown outbreak'}</div>
      <div style="color:#94a3b8;font-size:12px;margin-bottom:6px;">${locationParts.join(', ')}</div>
      <div style="display:inline-block;font-size:10px;font-weight:600;color:#22c55e;border:1px solid #22c55e;border-radius:3px;padding:1px 6px;margin-bottom:8px;letter-spacing:0.3px;">VERIFIED</div>
      <div style="margin-bottom:2px;"><span style="color:#94a3b8;">Confirmed cases:</span> <strong style="color:#f1f5f9;">${casesText}</strong></div>
      <div style="margin-bottom:4px;"><span style="color:#94a3b8;">Deaths:</span> <strong style="color:#f1f5f9;">${deathsText}</strong></div>`

  if (report.editor_note) {
    html += `<div style="font-style:italic;color:#94a3b8;font-size:11px;margin-top:6px;border-top:1px solid #334155;padding-top:6px;">${report.editor_note}</div>`
  }

  if (loc.precision === 'approximate') {
    html += `<div style="color:#d97706;font-size:11px;margin-top:4px;">Location is approximate</div>`
  }

  html += `</div>`
  return html
}

function buildMediaPopup(item: any): string {
  const pubDate = item.published_at
    ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date'

  let html = `
    <div style="min-width:180px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px;color:#f8fafc;">${item.title || 'Untitled'}</div>
      <div style="color:#94a3b8;font-size:12px;margin-bottom:4px;">${item.publisher || item.original_publisher || 'Unknown publisher'}</div>
      <div style="color:#64748b;font-size:11px;margin-bottom:8px;">${pubDate}</div>
      <div style="font-size:11px;color:#f59e0b;margin-bottom:6px;">Media monitoring: not verified by health authorities</div>`

  if (item.url) {
    html += `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa;font-size:11px;text-decoration:none;">View source</a>`
  }

  html += `</div>`
  return html
}

export function MapView({
  reports = [],
  mediaItems = [],
  height = '500px',
  interactive = true,
  showMedia = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Layer[]>([])

  // Inject CSS once
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = 'hantamap-marker-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = PULSE_CSS + POPUP_CSS
      document.head.appendChild(style)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [30, 10],
      zoom: 3,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [interactive])

  // Render markers
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear previous markers
    markersRef.current.forEach(layer => map.removeLayer(layer))
    markersRef.current = []

    // Verified report markers
    reports.forEach(report => {
      const loc = report.location
      if (!loc?.latitude || !loc?.longitude) return

      const isApproximate = loc.precision === 'approximate'
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: createVerifiedIcon(isApproximate),
      }).addTo(map)

      marker.bindPopup(buildVerifiedPopup(report), { className: 'dark-popup', maxWidth: 280 })
      markersRef.current.push(marker)
    })

    // Media markers
    if (showMedia) {
      mediaItems.forEach(item => {
        if (!item.latitude || !item.longitude) return

        const marker = L.marker([item.latitude, item.longitude], {
          icon: createMediaIcon(),
        }).addTo(map)

        marker.bindPopup(buildMediaPopup(item), { className: 'dark-popup', maxWidth: 280 })
        markersRef.current.push(marker)
      })
    }
  }, [reports, mediaItems, showMedia])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="bg-slate-900"
    />
  )
}
