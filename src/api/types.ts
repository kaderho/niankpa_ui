// Données renvoyées par /api/bo/.

export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Choice {
  value: string
  label: string
}

export interface Meta {
  app_features: { field: string; key: string; label: string }[]
  settings: { name: string; label: string; type: string }[]
  plan_features: Choice[]
  payment_methods: Choice[]
  health_kinds: Choice[]
  routes: Choice[]
  purposes: Choice[]
}

export interface StaffUser {
  id: number
  phone: string
  is_superuser: boolean
}

export type OrgStatus = 'trial' | 'active' | 'grace' | 'expired'

export interface Plan {
  id: number
  code: string
  name: string
  description: string
  price: number
  max_devices: number
  max_birds: number
  max_farms: number
  features: string[]
  rank: number
  is_public: boolean
}

export interface Organization {
  id: string
  name: string
  code: string
  owner: number | null
  owner_phone: string | null
  plan: number | null
  plan_name: string | null
  trial_ends_at: string | null
  paid_until: string | null
  note: string
  created_at: string
  status: OrgStatus
  farms_count: number
  accounts_count: number
  devices_count: number
}

export interface OrgFarm {
  id: string
  name: string
  locality: string | null
  deleted: boolean
  accounts: string[]
}

export interface OrgDevice {
  id: number
  device_id: string
  account: string
  first_seen: string
  last_seen: string
}

export interface Payment {
  id: number
  organization: string
  organization_name: string
  plan: number
  plan_name: string
  months: number
  amount: number
  method: string
  reference: string
  paid_at: string
  note: string
}

export interface Checkout {
  id: number
  organization: string
  organization_name: string
  plan: number
  plan_name: string
  months: number
  amount: number
  token: string
  status: 'pending' | 'completed' | 'cancelled'
  payment: number | null
  created_at: string
}

export interface Account {
  id: number
  phone: string
  farm: string | null
  farm_name: string | null
  organization: string | null
  organization_name: string | null
  is_active: boolean
  is_staff: boolean
  date_joined: string
  last_login: string | null
}

export interface Stats {
  saas_enabled: boolean
  currency: string
  organizations: Record<OrgStatus, number>
  accounts: number
  farms: number
  devices_30d: number
  flocks: number
  birds: number
  revenue_30d: number
  revenue_by_month: { month: string; total: number }[]
  recent_payments: {
    id: number
    organization: string
    plan: string
    amount: number
    method: string
    paid_at: string
  }[]
}

/** Ligne d'une liste de référence (espèces, points de contrôle…). */
export interface Reference {
  id: string
  name: string
  position: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  [field: string]: unknown
}

export interface Program extends Reference {
  species: string
  species_name: string
  purpose: string | null
  steps_count: number
}

export interface Step extends Reference {
  program: string
  age_day: number
  kind: string
  route: string | null
}

export type GlobalConfig = Record<string, unknown> & {
  currency: string
  updated_at: string
  secrets_set: Record<string, boolean>
}
