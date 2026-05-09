'use client'
import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  reports?: any[]
  mediaItems?: any[]
  height?: string
  interactive?: boolean
  showMedia?: boolean
  onMarkerSelect?: (report: any) => void
}

export function MapView({
  reports = [],
  mediaItems = [],
  height = '500px',
  interactive = true,
  showMedia = true,
  onMarkerSelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Layer[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const southWest = L.latLng(-85, -180)
    const northEast = L.latLng(85, 180)
    const worldBounds = L.latLngBounds(southWest, northEast)

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
      subdomains: 'abcd',
      noWrap: true,
      bounds: worldBounds,
    }).addTo(map)

    if (interactive) {
      L.control.zoom({ position: 'topright' }).addTo(map)
    }

    // Fix size after render
    setTimeout(() => map.invalidateSize(), 100)

    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [interactive])

  const handleMarkerClick = useCallback((report: any) => {
    onMarkerSelect?.(report)
  }, [onMarkerSelect])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    markersRef.current.forEach(l => map.removeLayer(l))
    markersRef.current = []

    reports.forEach(report => {
      const loc = report.location
      if (!loc?.latitude || !loc?.longitude) return

      const isApprox = loc.precision === 'approximate'
      const size = isApprox ? 36 : 22
      const icon = L.divIcon({
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2)],
        html: `<div style="position:relative;width:${size}px;height:${size}px;">
          <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,77,87,0.15);"></div>
          ${isApprox ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed rgba(255,77,87,0.25);"></div>` : ''}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#ff4d57;border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 16px rgba(255,77,87,0.6);"></div>
        </div>`,
      })

      const locParts = [loc.city, loc.region, loc.country].filter(Boolean)
      const cases = report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'
      const deaths = report.deaths !== null ? report.deaths : 'Unknown'

      const popup = `<div style="min-width:220px;">
        <div style="font-weight:700;font-size:14px;color:#f2f7f8;margin-bottom:4px;">${report.outbreak?.name || 'Unknown'}</div>
        <div style="color:#9fb0b7;font-size:11px;margin-bottom:8px;">${locParts.join(', ')}</div>
        <div style="display:inline-block;font-size:9px;font-weight:700;color:#38d48b;border:1px solid rgba(56,212,139,0.4);border-radius:4px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Verified</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 10px;">
            <div style="font-size:9px;color:#5a7078;text-transform:uppercase;letter-spacing:0.3px;">Confirmed</div>
            <div style="font-size:18px;font-weight:700;color:#f2f7f8;margin-top:2px;">${cases}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 10px;">
            <div style="font-size:9px;color:#5a7078;text-transform:uppercase;letter-spacing:0.3px;">Deaths</div>
            <div style="font-size:18px;font-weight:700;color:#f2f7f8;margin-top:2px;">${deaths}</div>
          </div>
        </div>
        ${isApprox ? '<div style="color:#ffb240;font-size:10px;margin-bottom:6px;">Location is approximate</div>' : ''}
        ${report.editor_note ? `<div style="color:#5a7078;font-size:10px;font-style:italic;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:4px;">${report.editor_note.slice(0, 120)}...</div>` : ''}
      </div>`

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map)
      marker.bindPopup(popup, { maxWidth: 300, closeButton: true })
      marker.on('click', () => handleMarkerClick(report))
      markersRef.current.push(marker)
    })

    if (showMedia) {
      mediaItems.forEach(item => {
        if (!item.latitude || !item.longitude) return
        const icon = L.divIcon({
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -12],
          html: `<div style="position:relative;width:20px;height:20px;">
            <div class="media-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,178,64,0.12);"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#ffb240;border:2px dotted rgba(255,255,255,0.5);box-shadow:0 0 8px rgba(255,178,64,0.4);"></div>
          </div>`,
        })
        const pubDate = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
        const popup = `<div style="min-width:200px;">
          <div style="font-weight:700;font-size:13px;color:#f2f7f8;margin-bottom:4px;">${item.title || 'Untitled'}</div>
          <div style="color:#9fb0b7;font-size:11px;margin-bottom:6px;">${item.publisher || 'Unknown'} · ${pubDate}</div>
          <div style="display:inline-block;font-size:9px;font-weight:700;color:#ffb240;border:1px solid rgba(255,178,64,0.3);border-radius:4px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Media reported</div>
          <div style="color:#5a7078;font-size:10px;margin-bottom:6px;">Not verified by health authorities</div>
          ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#28d7c2;font-size:11px;text-decoration:none;">View source</a>` : ''}
        </div>`
        const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map)
        marker.bindPopup(popup, { maxWidth: 260, closeButton: true })
        markersRef.current.push(marker)
      })
    }

    if (markersRef.current.length > 0 && interactive) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 5 })
    }
  }, [reports, mediaItems, showMedia, handleMarkerClick])

  return <div ref={mapRef} style={{ height, width: '100%' }} className="bg-[var(--bg-primary)]" />
}
