export type VerificationStatus = 'verified' | 'probable' | 'suspected' | 'disputed' | 'retracted' | 'awaiting_source'
export type OutbreakStatus = 'monitoring' | 'active' | 'escalating' | 'declining' | 'resolved'
export type SourceType = 'who' | 'ecdc' | 'cdc' | 'national_ministry' | 'regional_authority' | 'scientific' | 'media' | 'other'
export type AlertFrequency = 'immediate' | 'daily' | 'weekly'
export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  country: string | null
  city: string | null
  household_size: number | null
  has_children: boolean
  has_elderly: boolean
  has_pets: boolean
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Outbreak {
  id: string
  slug: string
  name: string
  pathogen_name: string | null
  summary: string | null
  status: OutbreakStatus
  transmission_notes: string | null
  what_is_known: string | null
  what_is_not_known: string | null
  what_to_do: string | null
  first_reported_at: string | null
  last_reviewed_at: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  country: string
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface Source {
  id: string
  title: string
  publisher: string
  url: string
  published_at: string | null
  source_type: SourceType
  reliability_level: number
  created_at: string
}

export interface Report {
  id: string
  outbreak_id: string
  location_id: string
  status: string
  confirmed_cases: number | null
  probable_cases: number | null
  suspected_cases: number | null
  deaths: number | null
  recovered: number | null
  report_date: string | null
  verification_status: VerificationStatus
  editor_note: string | null
  published: boolean
  created_at: string
  updated_at: string
  // Joined
  outbreak?: Outbreak
  location?: Location
  sources?: Source[]
}

export interface Update {
  id: string
  outbreak_id: string | null
  title: string
  summary: string | null
  body: string | null
  location_id: string | null
  verification_status: VerificationStatus
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined
  outbreak?: Outbreak
  location?: Location
  sources?: Source[]
}

export interface SavedRegion {
  id: string
  user_id: string
  label: string
  country: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  alert_enabled: boolean
  created_at: string
}

export interface TravelPlan {
  id: string
  user_id: string
  destination_country: string
  destination_region: string | null
  destination_city: string | null
  departure_date: string | null
  return_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PreparednessItem {
  id: string
  user_id: string
  category: string
  label: string
  completed: boolean
  quantity: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AlertPreference {
  id: string
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  frequency: AlertFrequency
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category: string
  name: string
  description: string | null
  affiliate_url: string | null
  image_url: string | null
  active: boolean
  disclaimer: string | null
  created_at: string
  updated_at: string
}
