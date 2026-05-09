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

// Safe zone padding: top accounts for header+controls, bottom for metrics rail
const SAFE_TOP = 80
const SAFE_BOTTOM = 80
const SAFE_SIDE = 28

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

function col(type: string) { return COLORS[type] || '#ffb240' }

function buildPopup(report: any, compact: boolean): string {
  const type = report.report_type || 'confirmed_case_location'
  const color = col(type)
  const loc = report.location || {}
  const locParts = [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
  const countsAsCase = report.counts_as_case !== false
  const cases = report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'
  const deaths = report.deaths !== null ? report.deaths : 'Unknown'
  const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
  const clusterLabel = CLUSTER[report.cluster_relation] || ''
  const label = LABELS[type] || 'Report'
  const slug = report.outbreak?.slug

  let html = `<div style="min-width:${compact ? 180 : 220}px;">
    <div style="font-weight:700;font-size:${compact ? 13 : 14}px;color:#f2f7f8;margin-bottom:2px;padding-right:18px;">${report.outbreak?.name || 'Report'}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:10px;margin-bottom:6px;">${locParts}</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
      <span style="font-size:8px;font-weight:700;color:${color};background:${color}18;border:1px solid ${color}30;border-radius:9px;padding:2px 7px;text-transform:uppercase;letter-spacing:0.4px;">${label}</span>
      ${clusterLabel ? `<span style="font-size:8px;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:2px 6px;">${clusterLabel}</span>` : ''}
    </div>`

  if (countsAsCase) {
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px;">
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 8px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.3px;">Confirmed</div>
        <div style="font-size:${compact ? 15 : 17}px;font-weight:700;color:#f2f7f8;margin-top:1px;">${cases}</div>
      </div>
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 8px;">
        <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.3px;">Deaths</div>
        <div style="font-size:${compact ? 15 : 17}px;font-weight:700;color:#f2f7f8;margin-top:1px;">${deaths}</div>
      </div>
    </div>`
  } else {
    html += `<div style="font-size:9px;color:rgba(255,255,255,0.25);margin-bottom:6px;">Does not count toward confirmed case totals.</div>`
  }

  if (isApprox) html += `<div style="color:#ffb240;font-size:8px;margin-bottom:4px;">Approximate location</div>`

  if (!compact && report.editor_note) {
    const note = report.editor_note.length > 100 ? report.editor_note.slice(0, 100) + '...' : report.editor_note
    html += `<div style="color:rgba(255,255,255,0.18);font-size:8px;font-style:italic;border-top:1px solid rgba(255,255,255,0.04);padding-top:5px;margin-top:4px;">${note}</div>`
  }

  if (slug) {
    html += `<a href="/outbreaks/${slug}" style="display:block;text-align:center;font-size:10px;font-weight:600;color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 0;margin-top:8px;text-decoration:none;border:1px solid rgba(255,255,255,0.05);">Open full report</a>`
  }

  html += '</div>'
  return html
}

function buildMediaPopup(item: any): string {
  const pubDate = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
  return `<div style="min-width:190px;">
    <div style="font-weight:700;font-size:12px;color:#f2f7f8;margin-bottom:3px;padding-right:18px;">${item.title || 'Untitled'}</div>
    <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-bottom:6px;">${item.publisher || 'Unknown'} · ${pubDate}</div>
    <span style="font-size:8px;font-weight:700;color:#ffb240;background:rgba(255,178,64,0.1);border:1px solid rgba(255,178,64,0.2);border-radius:9px;padding:2px 7px;text-transform:uppercase;letter-spacing:0.4px;">Media reported</span>
    <div style="color:rgba(255,255,255,0.2);font-size:9px;margin-top:6px;">Not verified by health authorities</div>
    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;font-size:10px;font-weight:600;color:#28d7c2;margin-top:8px;text-decoration:none;">View source</a>` : ''}
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
  const selectedRingRef = useRef<L.CircleMarker | null>(null)

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

    // Clear selection ring when popup closes
    map.on('popupclose', () => {
      if (selectedRingRef.current) {
        map.removeLayer(selectedRingRef.current)
        selectedRingRef.current = null
      }
    })

    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [interactive, captureScroll])

  const handleClick = useCallback((r: any) => { onMarkerSelect?.(r) }, [onMarkerSelect])

  // Show selection ring around clicked marker
  const showSelectionRing = useCallback((lat: number, lng: number, color: string) => {
    const map = mapInstance.current
    if (!map) return
    if (selectedRingRef.current) map.removeLayer(selectedRingRef.current)
    selectedRingRef.current = L.circleMarker([lat, lng], {
      radius: 22,
      color: color,
      weight: 1.5,
      opacity: 0.5,
      fillColor: color,
      fillOpacity: 0.06,
      dashArray: '4 3',
    }).addTo(map)
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    markersRef.current.forEach(l => map.removeLayer(l))
    markersRef.current = []
    if (selectedRingRef.current) { map.removeLayer(selectedRingRef.current); selectedRingRef.current = null }

    // Detect if mobile for compact mode
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const maxW = isMobile ? Math.min(280, window.innerWidth - 40) : 320

    reports.forEach(report => {
      const loc = report.location
      if (!loc?.latitude || !loc?.longitude) return
      const type = report.report_type || 'confirmed_case_location'
      const color = col(type)
      const isOrigin = type === 'outbreak_origin'
      const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
      const size = isOrigin ? 38 : 24
      const dot = isOrigin ? 14 : 10

      const icon = L.divIcon({
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
        html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
          <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${color}18;"></div>
          ${isApprox ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed ${color}40;"></div>` : ''}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${dot}px;height:${dot}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 ${isOrigin ? 18 : 10}px ${color}90;"></div>
        </div>`,
      })

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map)
      marker.bindPopup(buildPopup(report, isMobile), {
        maxWidth: maxW,
        minWidth: isMobile ? 170 : 200,
        closeButton: true,
        className: 'hm-popup',
        autoPan: true,
        autoPanPadding: L.point(SAFE_SIDE, SAFE_TOP),
        autoPanPaddingBottomRight: L.point(SAFE_SIDE, SAFE_BOTTOM),
        autoPanPaddingTopLeft: L.point(SAFE_SIDE, SAFE_TOP),
        keepInView: true,
      })
      marker.on('click', () => {
        showSelectionRing(loc.latitude, loc.longitude, color)
        handleClick(report)
      })
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
        marker.bindPopup(buildMediaPopup(item), {
          maxWidth: maxW,
          minWidth: isMobile ? 160 : 180,
          closeButton: true,
          className: 'hm-popup',
          autoPan: true,
          autoPanPadding: L.point(SAFE_SIDE, SAFE_TOP),
          autoPanPaddingBottomRight: L.point(SAFE_SIDE, SAFE_BOTTOM),
          autoPanPaddingTopLeft: L.point(SAFE_SIDE, SAFE_TOP),
          keepInView: true,
        })
        marker.on('click', () => {
          showSelectionRing(item.latitude, item.longitude, '#ffb240')
        })
        markersRef.current.push(marker)
      })
    }

    if (markersRef.current.length > 0 && autoFit) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 4 })
    }
  }, [reports, mediaItems, showMedia, autoFit, handleClick, showSelectionRing])

  return <div ref={mapRef} style={{ height, width: '100%' }} className="bg-[#02090b]" />
}
