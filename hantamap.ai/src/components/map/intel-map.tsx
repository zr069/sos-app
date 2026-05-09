'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface IntelMapProps {
  reports?: any[]
  mediaItems?: any[]
  onMarkerSelect?: (report: any) => void
}

const COLORS: Record<string, string> = {
  outbreak_origin: '#ff4d57',
  confirmed_case_location: '#ff4d57',
  probable_case_location: '#ffb240',
  suspected_case_location: '#ffb240',
  treatment_location: '#38bdf8',
  monitoring_location: '#38bdf8',
  evacuation_location: '#a78bfa',
  response_location: '#38bdf8',
  media_signal: '#ffb240',
}

const LABELS: Record<string, string> = {
  outbreak_origin: 'Cluster origin',
  confirmed_case_location: 'Confirmed case',
  probable_case_location: 'Probable case',
  suspected_case_location: 'Suspected case',
  treatment_location: 'Treatment location',
  monitoring_location: 'Monitoring',
  evacuation_location: 'Evacuation',
  response_location: 'Response location',
  media_signal: 'Media signal',
}

const CLUSTER_LABELS: Record<string, string> = {
  linked_to_mv_hondius: 'Linked to MV Hondius',
  separate_hantavirus_case: 'Separate signal',
}

// Dark vector basemap style
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

function col(type: string) { return COLORS[type] || '#ffb240' }

function createMarkerEl(type: string, isOrigin: boolean, isApprox: boolean): HTMLElement {
  const color = col(type)
  const size = isOrigin ? 40 : 26
  const dotSize = isOrigin ? 14 : 10
  const el = document.createElement('div')
  el.style.cssText = `position:relative;width:${size}px;height:${size}px;cursor:pointer;`
  el.innerHTML = `
    <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${color}20;"></div>
    ${isApprox ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed ${color}40;"></div>` : ''}
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 ${isOrigin ? 20 : 12}px ${color}99;"></div>
  `
  return el
}

function createMediaMarkerEl(): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = 'position:relative;width:20px;height:20px;cursor:pointer;'
  el.innerHTML = `
    <div class="media-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,178,64,0.1);"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#ffb240;border:2px dotted rgba(255,255,255,0.5);box-shadow:0 0 10px rgba(255,178,64,0.5);"></div>
  `
  return el
}

function buildPopupHTML(report: any): string {
  const type = report.report_type || 'confirmed_case_location'
  const color = col(type)
  const loc = report.location || {}
  const locParts = [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
  const countsAsCase = report.counts_as_case !== false
  const cases = report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'
  const deaths = report.deaths !== null ? report.deaths : 'Unknown'
  const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
  const clusterLabel = CLUSTER_LABELS[report.cluster_relation] || ''
  const label = LABELS[type] || 'Report'
  const slug = report.outbreak?.slug

  let html = `<div style="min-width:200px;max-width:300px;font-family:system-ui,-apple-system,sans-serif;">
    <div style="font-weight:700;font-size:14px;color:#f2f7f8;margin-bottom:3px;padding-right:20px;">${report.outbreak?.name || 'Report'}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:10px;margin-bottom:8px;">${locParts}</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">
      <span style="font-size:8px;font-weight:700;color:${color};background:${color}15;border:1px solid ${color}30;border-radius:9px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>
      ${clusterLabel ? `<span style="font-size:8px;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:2px 7px;">${clusterLabel}</span>` : ''}
    </div>`

  if (countsAsCase) {
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px;">
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:7px 9px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.3px;">Confirmed</div>
        <div style="font-size:17px;font-weight:700;color:#f2f7f8;margin-top:2px;">${cases}</div>
      </div>
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:7px 9px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.3px;">Deaths</div>
        <div style="font-size:17px;font-weight:700;color:#f2f7f8;margin-top:2px;">${deaths}</div>
      </div>
    </div>`
  } else {
    html += `<div style="font-size:9px;color:rgba(255,255,255,0.25);margin-bottom:8px;">Does not count toward confirmed case totals.</div>`
  }

  if (isApprox) html += `<div style="color:#ffb240;font-size:8px;margin-bottom:5px;">Approximate location</div>`

  if (report.editor_note) {
    const note = report.editor_note.length > 100 ? report.editor_note.slice(0, 100) + '...' : report.editor_note
    html += `<div style="color:rgba(255,255,255,0.18);font-size:8px;font-style:italic;border-top:1px solid rgba(255,255,255,0.04);padding-top:5px;margin-top:5px;">${note}</div>`
  }

  if (slug) {
    html += `<a href="/outbreaks/${slug}" style="display:block;text-align:center;font-size:10px;font-weight:600;color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 0;margin-top:8px;text-decoration:none;border:1px solid rgba(255,255,255,0.05);">Open full report</a>`
  }

  return html + '</div>'
}

function buildMediaPopupHTML(item: any): string {
  const pubDate = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
  return `<div style="min-width:190px;max-width:280px;font-family:system-ui,-apple-system,sans-serif;">
    <div style="font-weight:700;font-size:12px;color:#f2f7f8;margin-bottom:3px;padding-right:20px;">${item.title || 'Untitled'}</div>
    <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-bottom:6px;">${item.publisher || 'Unknown'} · ${pubDate}</div>
    <span style="font-size:8px;font-weight:700;color:#ffb240;background:rgba(255,178,64,0.1);border:1px solid rgba(255,178,64,0.2);border-radius:9px;padding:2px 7px;text-transform:uppercase;letter-spacing:0.4px;">Media reported</span>
    <div style="color:rgba(255,255,255,0.2);font-size:9px;margin-top:6px;">Not verified by health authorities</div>
    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;font-size:10px;font-weight:600;color:#28d7c2;margin-top:8px;text-decoration:none;">View source</a>` : ''}
  </div>`
}

export function IntelMap({ reports = [], mediaItems = [], onMarkerSelect }: IntelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  const handleSelect = useCallback((r: any) => { onMarkerSelect?.(r) }, [onMarkerSelect])

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [0, 20],
      zoom: 1.8,
      minZoom: 1.5,
      maxZoom: 18,
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 300,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Render markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }

    // Official reports
    reports.forEach(report => {
      const loc = report.location
      if (!loc?.latitude || !loc?.longitude) return

      const type = report.report_type || 'confirmed_case_location'
      const isOrigin = type === 'outbreak_origin'
      const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'

      const el = createMarkerEl(type, isOrigin, isApprox)

      const popup = new maplibregl.Popup({
        offset: isOrigin ? 24 : 16,
        closeButton: true,
        maxWidth: '320px',
        className: 'hm-gl-popup',
      }).setHTML(buildPopupHTML(report))

      el.addEventListener('click', () => handleSelect(report))

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    })

    // Media markers
    mediaItems.forEach(item => {
      if (!item.latitude || !item.longitude) return

      const el = createMediaMarkerEl()

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: true,
        maxWidth: '300px',
        className: 'hm-gl-popup',
      }).setHTML(buildMediaPopupHTML(item))

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [reports, mediaItems, handleSelect])

  return (
    <div ref={containerRef} className="absolute inset-0" />
  )
}
