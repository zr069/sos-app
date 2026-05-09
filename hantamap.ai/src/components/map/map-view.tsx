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

function color(type: string) { return COLORS[type] || '#ffb240' }

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
      const c = color(type)
      const isOrigin = type === 'outbreak_origin'
      const isApprox = loc.precision === 'approximate' || loc.precision === 'city_level'
      const size = isOrigin ? 38 : 24
      const dot = isOrigin ? 14 : 10

      const icon = L.divIcon({
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
          <div class="signal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${c}18;"></div>
          ${isApprox ? `<div style="position:absolute;inset:3px;border-radius:50%;border:1.5px dashed ${c}40;"></div>` : ''}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${dot}px;height:${dot}px;border-radius:50%;background:${c};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 ${isOrigin ? 18 : 10}px ${c}90;"></div>
        </div>`,
      })

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map)
      // No bindPopup: React panels handle detail display
      marker.on('click', () => handleClick(report))
      markersRef.current.push(marker)
    })

    if (showMedia) {
      mediaItems.forEach(item => {
        if (!item.latitude || !item.longitude) return
        const icon = L.divIcon({
          className: '', iconSize: [20, 20], iconAnchor: [10, 10],
          html: `<div style="position:relative;width:20px;height:20px;cursor:pointer;">
            <div class="media-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(255,178,64,0.1);"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#ffb240;border:2px dotted rgba(255,255,255,0.5);box-shadow:0 0 8px rgba(255,178,64,0.4);"></div>
          </div>`,
        })
        const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map)
        marker.on('click', () => handleClick(item))
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
