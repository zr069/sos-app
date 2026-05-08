'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type Report } from '@/lib/types'

const statusColors: Record<string, string> = {
  confirmed: '#dc2626',
  probable: '#d97706',
  suspected: '#f59e0b',
  disputed: '#6b7280',
  retracted: '#94a3b8',
}

interface MapViewProps {
  reports?: (Report & { location: { latitude: number; longitude: number; country: string; region?: string; city?: string } })[]
  height?: string
  interactive?: boolean
}

export function MapView({ reports = [], height = '500px', interactive = true }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [interactive])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    reports.forEach(report => {
      if (!report.location?.latitude || !report.location?.longitude) return

      const color = statusColors[report.status] || '#6b7280'
      const marker = L.circleMarker([report.location.latitude, report.location.longitude], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map)

      const locationParts = [report.location.city, report.location.region, report.location.country].filter(Boolean)
      const cases = report.confirmed_cases !== null ? `Confirmed cases: ${report.confirmed_cases}` : 'Cases: Unknown'

      marker.bindPopup(`
        <div style="font-family: system-ui; font-size: 13px; line-height: 1.5;">
          <strong>${locationParts.join(', ')}</strong><br/>
          <span style="color: #64748b;">${report.outbreak?.name || 'Unknown outbreak'}</span><br/>
          ${cases}<br/>
          <span style="text-transform: capitalize; color: ${color};">${report.verification_status}</span>
          ${report.editor_note ? `<br/><em style="color: #94a3b8; font-size: 11px;">${report.editor_note}</em>` : ''}
        </div>
      `)
    })
  }, [reports])

  return (
    <div ref={mapRef} style={{ height, width: '100%' }} className="rounded border border-slate-200 bg-slate-100" />
  )
}
