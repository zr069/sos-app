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
  outbreak_origin: '#ff4d57', confirmed_case_location: '#ff4d57',
  probable_case_location: '#ffb240', suspected_case_location: '#ffb240',
  treatment_location: '#38bdf8', monitoring_location: '#38bdf8',
  evacuation_location: '#a78bfa', response_location: '#38bdf8',
  media_signal: '#ffb240',
}

const LABELS: Record<string, string> = {
  outbreak_origin: 'Cluster origin', confirmed_case_location: 'Confirmed case',
  probable_case_location: 'Probable case', suspected_case_location: 'Suspected case',
  treatment_location: 'Treatment location', monitoring_location: 'Monitoring',
  evacuation_location: 'Evacuation', response_location: 'Response location',
  media_signal: 'Media signal',
}

const CLUSTER_LABELS: Record<string, string> = {
  linked_to_mv_hondius: 'Linked to MV Hondius',
  separate_hantavirus_case: 'Separate signal',
}

const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const DEFAULT_CENTER: [number, number] = [0, 20]
const DEFAULT_ZOOM = 2.2

function col(type: string) { return COLORS[type] || '#ffb240' }

function buildPopup(r: any): string {
  const type = r.report_type || 'confirmed_case_location'
  const c = col(type)
  const loc = r.location || {}
  const parts = [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
  const isCase = r.counts_as_case !== false
  const cases = r.confirmed_cases !== null ? r.confirmed_cases : 'Unknown'
  const deaths = r.deaths !== null ? r.deaths : 'Unknown'
  const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
  const cl = CLUSTER_LABELS[r.cluster_relation] || ''
  const slug = r.outbreak?.slug

  let h = `<div style="min-width:200px;max-width:300px;font-family:system-ui,sans-serif;">
    <div style="font-weight:700;font-size:14px;color:#f2f7f8;margin-bottom:3px;padding-right:18px;">${r.outbreak?.name || 'Report'}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:10px;margin-bottom:7px;">${parts}</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:9px;">
      <span style="font-size:8px;font-weight:700;color:${c};background:${c}15;border:1px solid ${c}30;border-radius:9px;padding:2px 7px;text-transform:uppercase;letter-spacing:0.4px;">${LABELS[type] || 'Report'}</span>
      ${cl ? `<span style="font-size:8px;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:2px 6px;">${cl}</span>` : ''}
    </div>`
  if (isCase) {
    h += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:9px;">
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 8px;"><div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;">Confirmed</div><div style="font-size:17px;font-weight:700;color:#f2f7f8;margin-top:2px;">${cases}</div></div>
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 8px;"><div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;">Deaths</div><div style="font-size:17px;font-weight:700;color:#f2f7f8;margin-top:2px;">${deaths}</div></div></div>`
  } else {
    h += `<div style="font-size:9px;color:rgba(255,255,255,0.25);margin-bottom:7px;">Does not count toward confirmed case totals.</div>`
  }
  if (isApprox) h += `<div style="color:#ffb240;font-size:8px;margin-bottom:5px;">Approximate location</div>`
  if (r.editor_note) { const n = r.editor_note.slice(0, 100); h += `<div style="color:rgba(255,255,255,0.18);font-size:8px;font-style:italic;border-top:1px solid rgba(255,255,255,0.04);padding-top:5px;margin-top:4px;">${n}${r.editor_note.length > 100 ? '...' : ''}</div>` }
  if (slug) h += `<a href="/outbreaks/${slug}" style="display:block;text-align:center;font-size:10px;font-weight:600;color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 0;margin-top:8px;text-decoration:none;border:1px solid rgba(255,255,255,0.05);">View outbreak details</a>`
  return h + '</div>'
}

function buildMediaPopup(item: any): string {
  const d = item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'
  return `<div style="min-width:190px;max-width:280px;font-family:system-ui,sans-serif;">
    <div style="font-weight:700;font-size:12px;color:#f2f7f8;margin-bottom:3px;padding-right:18px;">${item.title || 'Untitled'}</div>
    <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-bottom:6px;">${item.publisher || 'Unknown'} · ${d}</div>
    <span style="font-size:8px;font-weight:700;color:#ffb240;background:rgba(255,178,64,0.1);border:1px solid rgba(255,178,64,0.2);border-radius:9px;padding:2px 7px;text-transform:uppercase;">Media reported</span>
    <div style="color:rgba(255,255,255,0.2);font-size:9px;margin-top:6px;">Not verified by health authorities</div>
    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;font-size:10px;font-weight:600;color:#28d7c2;margin-top:8px;text-decoration:none;">View source</a>` : ''}</div>`
}

export function IntelMap({ reports = [], mediaItems = [], onMarkerSelect }: IntelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  // Store report data for click lookups
  const reportDataRef = useRef<Map<string, any>>(new Map())

  const handleSelect = useCallback((r: any) => { onMarkerSelect?.(r) }, [onMarkerSelect])

  // Expose map controls
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as any
    w.__hantamap_reset = () => mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 800 })
    w.__hantamap_zoomIn = () => mapRef.current?.zoomIn()
    w.__hantamap_zoomOut = () => mapRef.current?.zoomOut()
    return () => { delete w.__hantamap_reset; delete w.__hantamap_zoomIn; delete w.__hantamap_zoomOut }
  }, [])

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 1.8,
      maxZoom: 18,
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 300,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => map.resize())
    requestAnimationFrame(() => map.resize())
    setTimeout(() => map.resize(), 300)
    window.addEventListener('resize', () => map.resize())

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Render markers as GeoJSON layers (projection-native, no DOM drift)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Wait for style to load
    const render = () => {
      // Remove old layers and sources
      const layerIds = ['reports-glow', 'reports-core', 'reports-approx', 'media-glow', 'media-core']
      layerIds.forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      const sourceIds = ['reports-source', 'media-source']
      sourceIds.forEach(id => { if (map.getSource(id)) map.removeSource(id) })

      // Remove old click popup
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }

      // Build report data lookup and GeoJSON
      const dataMap = new Map<string, any>()
      const reportFeatures = reports.filter(r => r.location?.latitude && r.location?.longitude).map((r: any) => {
        const id = r.id
        dataMap.set(id, r)
        const type = r.report_type || 'confirmed_case_location'
        return {
          type: 'Feature' as const,
          properties: { id, color: col(type), isOrigin: type === 'outbreak_origin' ? 1 : 0, isApprox: (r.location.precision === 'approximate' || r.location.precision === 'city_level') ? 1 : 0 },
          geometry: { type: 'Point' as const, coordinates: [r.location.longitude, r.location.latitude] },
        }
      })
      reportDataRef.current = dataMap

      const mediaFeatures = mediaItems.filter(m => m.latitude && m.longitude).map((m: any, i: number) => ({
        type: 'Feature' as const,
        properties: { id: `media-${i}`, idx: i },
        geometry: { type: 'Point' as const, coordinates: [m.longitude, m.latitude] },
      }))

      // Add report source
      map.addSource('reports-source', { type: 'geojson', data: { type: 'FeatureCollection', features: reportFeatures } })

      // Glow ring layer
      map.addLayer({
        id: 'reports-glow',
        type: 'circle',
        source: 'reports-source',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isOrigin'], 1], 18, 12],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.12,
          'circle-blur': 0.8,
        },
      })

      // Approximate ring layer
      map.addLayer({
        id: 'reports-approx',
        type: 'circle',
        source: 'reports-source',
        filter: ['==', ['get', 'isApprox'], 1],
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isOrigin'], 1], 14, 10],
          'circle-color': 'transparent',
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0.25,
        },
      })

      // Core dot layer
      map.addLayer({
        id: 'reports-core',
        type: 'circle',
        source: 'reports-source',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isOrigin'], 1], 6, 4.5],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': 'rgba(255,255,255,0.85)',
          'circle-stroke-width': 1.5,
        },
      })

      // Media source
      if (mediaFeatures.length > 0) {
        map.addSource('media-source', { type: 'geojson', data: { type: 'FeatureCollection', features: mediaFeatures } })
        map.addLayer({
          id: 'media-glow',
          type: 'circle',
          source: 'media-source',
          paint: { 'circle-radius': 10, 'circle-color': '#ffb240', 'circle-opacity': 0.08, 'circle-blur': 0.6 },
        })
        map.addLayer({
          id: 'media-core',
          type: 'circle',
          source: 'media-source',
          paint: { 'circle-radius': 3.5, 'circle-color': '#ffb240', 'circle-stroke-color': 'rgba(255,255,255,0.5)', 'circle-stroke-width': 1 },
        })
      }

      // Click handlers
      map.on('click', 'reports-core', (e) => {
        if (!e.features || e.features.length === 0) return
        const feat = e.features[0]
        const coords = (feat.geometry as any).coordinates.slice() as [number, number]
        const id = feat.properties?.id
        const report = reportDataRef.current.get(id)
        if (!report) return

        if (popupRef.current) popupRef.current.remove()
        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: '320px', className: 'hm-gl-popup' })
          .setLngLat(coords)
          .setHTML(buildPopup(report))
          .addTo(map)

        handleSelect(report)
      })

      map.on('click', 'media-core', (e) => {
        if (!e.features || e.features.length === 0) return
        const feat = e.features[0]
        const coords = (feat.geometry as any).coordinates.slice() as [number, number]
        const idx = feat.properties?.idx
        const item = mediaItems[idx]
        if (!item) return

        if (popupRef.current) popupRef.current.remove()
        popupRef.current = new maplibregl.Popup({ offset: 10, closeButton: true, maxWidth: '300px', className: 'hm-gl-popup' })
          .setLngLat(coords)
          .setHTML(buildMediaPopup(item))
          .addTo(map)
      })

      // Cursor
      map.on('mouseenter', 'reports-core', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'reports-core', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'media-core', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'media-core', () => { map.getCanvas().style.cursor = '' })
    }

    if (map.isStyleLoaded()) {
      render()
    } else {
      map.on('load', render)
    }
  }, [reports, mediaItems, handleSelect])

  return <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
}
