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
  autoFit?: boolean
  onMarkerSelect?: (report: any) => void
}

const MARKER_STYLES: Record<string, { color: string; border: string; glow: string; label: string }> = {
  outbreak_origin:          { color: '#ff4d57', border: 'rgba(255,255,255,0.9)', glow: 'rgba(255,77,87,0.6)', label: 'Cluster origin' },
  confirmed_case_location:  { color: '#ff4d57', border: 'rgba(255,255,255,0.9)', glow: 'rgba(255,77,87,0.5)', label: 'Confirmed case' },
  probable_case_location:   { color: '#f59e0b', border: 'rgba(255,255,255,0.8)', glow: 'rgba(245,158,11,0.4)', label: 'Probable case' },
  suspected_case_location:  { color: '#f59e0b', border: 'rgba(255,255,255,0.7)', glow: 'rgba(245,158,11,0.3)', label: 'Suspected case' },
  treatment_location:       { color: '#38d48b', border: 'rgba(255,255,255,0.8)', glow: 'rgba(56,212,139,0.3)', label: 'Treatment location' },
  monitoring_location:      { color: '#60a5fa', border: 'rgba(255,255,255,0.7)', glow: 'rgba(96,165,250,0.3)', label: 'Monitoring' },
  evacuation_location:      { color: '#a78bfa', border: 'rgba(255,255,255,0.7)', glow: 'rgba(167,139,250,0.3)', label: 'Evacuation' },
  response_location:        { color: '#60a5fa', border: 'rgba(255,255,255,0.7)', glow: 'rgba(96,165,250,0.3)', label: 'Response location' },
  media_signal:             { color: '#ffb240', border: 'rgba(255,255,255,0.5)', glow: 'rgba(255,178,64,0.3)', label: 'Media signal' },
}

const CLUSTER_LABELS: Record<string, string> = {
  linked_to_mv_hondius: 'Linked to MV Hondius',
  separate_hantavirus_case: 'Separate Hantavirus signal',
  unknown_relation: 'Relation unknown',
}

function getStyle(type: string) {
  return MARKER_STYLES[type] || MARKER_STYLES.media_signal
}

export function MapView({ reports = [], mediaItems = [], height = '500px', interactive = true, showMedia = true, autoFit = false, onMarkerSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Layer[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const sw = L.latLng(-85, -180)
    const ne = L.latLng(85, 180)
    const bounds = L.latLngBounds(sw, ne)
    const map = L.map(mapRef.current, {
      center: [15, 0], zoom: 2, minZoom: 2, maxZoom: 18,
      maxBounds: bounds, maxBoundsViscosity: 1.0, worldCopyJump: false,
      scrollWheelZoom: interactive, dragging: interactive, zoomControl: false, attributionControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18, subdomains: 'abcd', noWrap: true, bounds,
    }).addTo(map)
    if (interactive) L.control.zoom({ position: 'topright' }).addTo(map)
    setTimeout(() => map.invalidateSize(), 100)
    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [interactive])

  const handleClick = useCallback((r: any) => { onMarkerSelect?.(r) }, [onMarkerSelect])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    markersRef.current.forEach(l => map.removeLayer(l))
    markersRef.current = []

    reports.forEach(report => {
      const loc = report.location
      if (!loc?.latitude || !loc?.longitude) return

      const type = report.report_type || 'confirmed_case_location'
      const style = getStyle(type)
      const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
      const isOrigin = type === 'outbreak_origin'
      const size = isOrigin ? 36 : isApprox ? 28 : 22
      const dotSize = isOrigin ? 14 : 10

      const icon = L.divIcon({
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2)],
        html: `<div style="position:relative;width:${size}px;height:${size}px;">
          <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${style.color}20;"></div>
          ${isApprox && type !== 'treatment_location' && type !== 'response_location' ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed ${style.color}40;"></div>` : ''}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${style.color};border:2px solid ${style.border};box-shadow:0 0 ${isOrigin ? 16 : 10}px ${style.glow};"></div>
        </div>`,
      })

      const locParts = [loc.city, loc.region, loc.country].filter(Boolean)
      const countsAsCase = report.counts_as_case !== false
      const clusterLabel = CLUSTER_LABELS[report.cluster_relation] || ''
      const cases = report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'
      const deaths = report.deaths !== null ? report.deaths : 'Unknown'
      const badgeColor = type.includes('treatment') || type.includes('monitoring') || type.includes('response') || type.includes('evacuation')
        ? style.color : report.verification_status === 'verified' ? '#38d48b' : '#ffb240'
      const badgeText = style.label

      let popup = `<div style="min-width:220px;">
        <div style="font-weight:700;font-size:14px;color:#f2f7f8;margin-bottom:2px;">${report.outbreak?.name || 'Report'}</div>
        <div style="color:#9fb0b7;font-size:11px;margin-bottom:6px;">${locParts.join(', ')}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
          <span style="font-size:9px;font-weight:700;color:${badgeColor};border:1px solid ${badgeColor}40;border-radius:4px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.4px;">${badgeText}</span>
          ${clusterLabel ? `<span style="font-size:9px;color:#5a7078;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:2px 6px;">${clusterLabel}</span>` : ''}
        </div>`

      if (countsAsCase) {
        popup += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
          <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;">
            <div style="font-size:8px;color:#5a7078;text-transform:uppercase;letter-spacing:0.3px;">Confirmed</div>
            <div style="font-size:16px;font-weight:700;color:#f2f7f8;margin-top:1px;">${cases}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;">
            <div style="font-size:8px;color:#5a7078;text-transform:uppercase;letter-spacing:0.3px;">Deaths</div>
            <div style="font-size:16px;font-weight:700;color:#f2f7f8;margin-top:1px;">${deaths}</div>
          </div>
        </div>`
      } else {
        popup += `<div style="font-size:10px;color:#5a7078;margin-bottom:6px;">This location does not count toward confirmed case totals.</div>`
      }

      if (report.editor_note) {
        popup += `<div style="color:#5a7078;font-size:10px;font-style:italic;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:4px;">${report.editor_note.slice(0, 160)}${report.editor_note.length > 160 ? '...' : ''}</div>`
      }
      popup += '</div>'

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map)
      marker.bindPopup(popup, { maxWidth: 300, closeButton: true })
      marker.on('click', () => handleClick(report))
      markersRef.current.push(marker)
    })

    if (showMedia) {
      mediaItems.forEach(item => {
        if (!item.latitude || !item.longitude) return
        const icon = L.divIcon({
          className: '', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
          html: `<div style="position:relative;width:20px;height:20px;">
            <div class="media-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,178,64,0.12);"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#ffb240;border:2px dotted rgba(255,255,255,0.5);box-shadow:0 0 8px rgba(255,178,64,0.4);"></div>
          </div>`,
        })
        const pubDate = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
        const popup = `<div style="min-width:200px;">
          <div style="font-weight:700;font-size:13px;color:#f2f7f8;margin-bottom:4px;">${item.title || 'Untitled'}</div>
          <div style="color:#9fb0b7;font-size:11px;margin-bottom:6px;">${item.publisher || 'Unknown'} · ${pubDate}</div>
          <span style="font-size:9px;font-weight:700;color:#ffb240;border:1px solid rgba(255,178,64,0.3);border-radius:4px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.4px;">Media reported</span>
          <div style="color:#5a7078;font-size:10px;margin-top:8px;">Not verified by health authorities. Case counts: Unknown.</div>
          ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#28d7c2;font-size:11px;text-decoration:none;display:block;margin-top:6px;">View source</a>` : ''}
        </div>`
        const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map)
        marker.bindPopup(popup, { maxWidth: 260, closeButton: true })
        markersRef.current.push(marker)
      })
    }

    if (markersRef.current.length > 0 && autoFit) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 4 })
    }
  }, [reports, mediaItems, showMedia, autoFit, handleClick])

  return <div ref={mapRef} style={{ height, width: '100%' }} className="bg-[var(--bg-primary)]" />
}
