// Chiffres du tableau de bord (/api/bo/stats/) et consommation du plan
// d'une organisation. Rien sur l'activité des fermes : le back-office voit
// ses clients, pas ce qui se passe chez eux.

import type { OrgStatus } from './types'

export type Review = 'attente' | 'verifie' | 'refuse' | 'suspendu'
export type VetStatus = 'trial' | 'active' | 'expired'

export interface Stats {
  saas_enabled: boolean
  currency: string
  clients: {
    organizations: Record<OrgStatus, number>
    ending_soon: number
    accounts: number
    employees: number
    departures_contested: number
    farms: number
    devices_30d: number
  }
  subscriptions: {
    plans: { id: number | null; name: string; organizations: number }[]
    revenue_30d: number
    payments_30d: number
    revenue_by_month: { month: string; total: number }[]
    recent_payments: {
      id: number
      organization: string
      plan: string
      amount: number
      method: string
      paid_at: string
    }[]
    checkouts: { pending: number; completed_30d: number; cancelled_30d: number }
    vets: Record<VetStatus, number>
  }
  application: {
    references: {
      species: number
      biosecurity_items: number
      egg_criteria: number
      programs: number
      standards: number
    }
    localities: { total: number; farms_unplaced: number; partners_unplaced: number }
    suppliers: Record<Review, number>
    directory: {
      products: number
      products_pending: number
      reports_open: number
      categories: number
      partner_kinds: number
    }
  }
}

/** État de la limite de sujets : jamais un nombre. */
export type BirdsState = 'off' | 'unlimited' | 'ok' | 'near' | 'reached'

export interface PlanUsage {
  enforced: boolean
  farms: { used: number; limit: number }
  devices: { used: number; limit: number }
  birds: BirdsState
}
