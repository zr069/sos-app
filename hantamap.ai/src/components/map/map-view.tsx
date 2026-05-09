'use client'
import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'

interface MapViewProps {
  reports?: any[]
  mediaItems?: any[]
  height?: string
  interactive?: boolean
  showMedia?: boolean
  autoFit?: boolean
  captureScroll?: boolean
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

const CLUSTER: Record<string, string> = {
  linked_to_mv_hondius: 'Linked to MV Hondius',
  separate_hantavirus_case: 'Separate signal',
}

function c(type: string) { return COLORS[type] || '#ffb240' }

function buildPopup(report: any): string {
  const type = report.report_type || 'confirmed_case_location'
  const col = c(type)
  const loc = report.location || {}
  const locParts = [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
  const countsAsCase = report.counts_as_case !== false
  const cases = report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'
  const deaths = report.deaths !== null ? report.deaths : 'Unknown'
  const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
  const clusterLabel = CLUSTER[report.cluster_relation] || ''
  const label = LABELS[type] || 'Report'
  const slug = report.outbreak?.slug

  let html = `<div style="min-width:230px;max-width:300px;">
    <div style="font-weight:700;font-size:14px;color:#f2f7f8;margin-bottom:3px;">${report.outbreak?.name || 'Report'}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:11px;margin-bottom:8px;">${locParts}</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">
      <span style="font-size:8px;font-weight:700;color:${col};background:${col}18;border:1px solid ${col}30;border-radius:9px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>
      ${clusterLabel ? `<span style="font-size:8px;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:2px 7px;">${clusterLabel}</span>` : ''}
    </div>`

  if (countsAsCase) {
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
      <div style="background:rgba(255,255,255,0.035);border-radius:10px;padding:8px 10px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.4px;">Confirmed</div>
        <div style="font-size:18px;font-weight:700;color:#f2f7f8;margin-top:2px;">${cases}</div>
      </div>
      <div style="background:rgba(255,255,255,0.035);border-radius:10px;padding:8px 10px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.4px;">Deaths</div>
        <div style="font-size:18px;font-weight:700;color:#f2f7f8;margin-top:2px;">${deaths}</div>
      </div>
    </div>`
  } else {
    html += `<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:8px;">Does not count toward confirmed case totals.</div>`
  }

  if (isApprox) html += `<div style="color:#ffb240;font-size:9px;margin-bottom:6px;">Approximate location</div>`

  if (report.editor_note) {
    const note = report.editor_note.length > 140 ? report.editor_note.slice(0, 140) + '...' : report.editor_note
    html += `<div style="color:rgba(255,255,255,0.2);font-size:9px;font-style:italic;border-top:1px solid rgba(255,255,255,0.05);padding-top:6px;margin-top:4px;">${note}</div>`
  }

  if (slug) {
    html += `<a href="/outbreaks/${slug}" style="display:block;text-align:center;font-size:10px;font-weight:600;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.04);border-radius:9px;padding:7px 0;margin-top:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.06);">Open full report</a>`
  }

  html += '</div>'
  return html
}

function buildMediaPopup(item: any): string {
  const pubDate = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
  return `<div style="min-width:210px;max-width:280px;">
    <div style="font-weight:700;font-size:13px;color:#f2f7f8;margin-bottom:4px;">${item.title || 'Untitled'}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:11px;margin-bottom:8px;">${item.publisher || 'Unknown'} · ${pubDate}</div>
    <span style="font-size:8px;font-weight:700;color:#ffb240;background:rgba(255,178,64,0.12);border:1px solid rgba(255,178,64,0.25);border-radius:9px;padding:2px 8px;text-transform:uppercase;letter-spacing:0.5px;">Media reported</span>
    <div style="color:rgba(255,255,255,0.25);font-size:10px;margin-top:8px;">Not verified by health authorities</div>
    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;font-size:10px;font-weight:600;color:#28d7c2;margin-top:10px;text-decoration:none;">View source</a>` : ''}
  </div>`
}

export function MapView({
  reports = [], mediaItems = [], height = '500px',
  interactive = true, showMedia = true, autoFit = false,
  captureScroll = true, onMarkerSelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Layer[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const bounds = L.latLngBounds([-85, -180], [85, 180])
    const map = L.map(mapRef.current, {
      center: [15, 0], zoom: 2, minZoom: 2, maxZoom: 18,
      maxBounds: bounds, maxBoundsViscosity: 1.0, worldCopyJump: false,
      dragging: interactive, touchZoom: interactive, doubleClickZoom: interactive,
      scrollWheelZoom: interactive && captureScroll,
      inertia: true, inertiaDeceleration: 3000,
      zoomControl: false, attributionControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 18, subdomains: 'abcd', noWrap: true, bounds,
    }).addTo(map)
    if (interactive) L.control.zoom({ position: 'topright' }).addTo(map)
    setTimeout(() => map.invalidateSize(), 150)
    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [interactive, captureScroll])

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
      const col = c(type)
      const isOrigin = type === 'outbreak_origin'
      const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
      const size = isOrigin ? 38 : 24
      const dot = isOrigin ? 14 : 10

      const icon = L.divIcon({
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
        html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
          <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${col}18;"></div>
          ${isApprox ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed ${col}40;"></div>` : ''}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${dot}px;height:${dot}px;border-radius:50%;background:${col};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 ${isOrigin ? 18 : 10}px ${col}90;"></div>
        </div>`,
      })

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map)
      marker.bindPopup(buildPopup(report), { maxWidth: 320, closeButton: true, className: 'hm-popup' })
      marker.on('click', () => handleClick(report))
      markersRef.current.push(marker)
    })

    if (showMedia) {
      mediaItems.forEach(item => {
        if (!item.latitude || !item.longitude) return
        const icon = L.divIcon({
          className: '', iconSize: [20, 20], iconAnchor: [10, 10],
          popupAnchor: [0, -14],
          html: `<div style="position:relative;width:20px;height:20px;cursor:pointer;">
            <div class="media-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,178,64,0.1);"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#ffb240;border:2px dotted rgba(255,255,255,0.5);box-shadow:0 0 8px rgba(255,178,64,0.4);"></div>
          </div>`,
        })
        const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map)
        marker.bindPopup(buildMediaPopup(item), { maxWidth: 300, closeButton: true, className: 'hm-popup' })
        markersRef.current.push(marker)
      })
    }

    if (markersRef.current.length > 0 && autoFit) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 4 })
    }
  }, [reports, mediaItems, showMedia, autoFit, handleClick])

  return <div ref={mapRef} style={{ height, width: '100%' }} className="bg-[#02090b]" />
}
