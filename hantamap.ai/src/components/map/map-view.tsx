'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type VerificationStatus, type Source } from '@/lib/types'

const statusColors: Record<string, string> = {
  confirmed: '#dc2626',
  probable: '#d97706',
  suspected: '#f59e0b',
  disputed: '#6b7280',
  retracted: '#94a3b8',
}

const verificationColors: Record<VerificationStatus, string> = {
  verified: '#059669',
  probable: '#d97706',
  suspected: '#ea580c',
  disputed: '#dc2626',
  retracted: '#94a3b8',
  awaiting_source: '#64748b',
}

interface MapViewReport {
  id: string
  status: string
  confirmed_cases: number | null
  deaths: number | null
  verification_status: VerificationStatus
  editor_note: string | null
  report_date: string | null
  location: {
    latitude: number
    longitude: number
    country: string
    region?: string | null
    city?: string | null
    precision?: string | null
  }
  outbreak?: { name: string }
  sources?: Source[]
}

interface MapViewProps {
  reports?: MapViewReport[]
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
      const casesText = report.confirmed_cases !== null ? String(report.confirmed_cases) : 'Unknown'
      const deathsText = report.deaths !== null ? String(report.deaths) : 'Unknown'
      const verificationColor = verificationColors[report.verification_status] || '#64748b'
      const sourceCount = report.sources?.length ?? 0

      let popupHtml = `
        <div style="font-family: system-ui; font-size: 13px; line-height: 1.6; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${report.outbreak?.name || 'Unknown outbreak'}</div>
          <div style="color: #64748b; margin-bottom: 6px;">${locationParts.join(', ')}</div>
          <div style="display: inline-block; font-size: 11px; font-weight: 600; color: ${verificationColor}; border: 1px solid ${verificationColor}; border-radius: 4px; padding: 1px 6px; margin-bottom: 6px; text-transform: capitalize;">${report.verification_status.replace('_', ' ')}</div>
          <div style="margin-bottom: 2px;"><span style="color: #64748b;">Confirmed cases:</span> <strong>${casesText}</strong></div>
          <div style="margin-bottom: 4px;"><span style="color: #64748b;">Deaths:</span> <strong>${deathsText}</strong></div>`

      if (report.editor_note) {
        popupHtml += `<div style="font-style: italic; color: #94a3b8; font-size: 11px; margin-top: 4px;">${report.editor_note}</div>`
      }

      if (report.location.precision === 'approximate') {
        popupHtml += `<div style="color: #d97706; font-size: 11px; margin-top: 4px;">Location is approximate</div>`
      }

      if (sourceCount > 0) {
        popupHtml += `<div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">${sourceCount} source${sourceCount === 1 ? '' : 's'}</div>`
      }

      popupHtml += `</div>`

      marker.bindPopup(popupHtml)
    })
  }, [reports])

  return (
    <div ref={mapRef} style={{ height, width: '100%' }} className="rounded border border-slate-200 bg-slate-100" />
  )
}
