// Données renvoyées par /api/bo/.

import type { PlanUsage } from './dashboard'

export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Choice {
  value: string
  label: string
  /** Listes tenues au back-office : pictogramme et couleur de l'élément. */
  emoji?: string
  color?: string
  /** Masqué, ou pas encore géré par l'application : lisible, pas choisi. */
  disabled?: boolean
}

/** Liste de choix tenue au back-office. */
export interface ChoiceList {
  key: string
  label: string
  /** free : étiquettes ; behaviour : l'application agit selon la clé. */
  kind: 'free' | 'behaviour'
  /** Liste libre ouverte : toute clé ajoutée se choisit tout de suite. */
  open: boolean
  used_in: string
}

/** Élément d'une liste de choix. */
export interface ChoiceItem extends Reference {
  list_key: string
  key: string
  emoji: string
  color: string
  min_app_version: string
  extra: Record<string, unknown>
  /** Clé d'origine, que le code connaît. */
  system: boolean
  /** Le code sait quoi en faire : elle se choisit dans les formulaires. */
  supported: boolean
}

export interface Meta {
  app_features: { field: string; key: string; label: string }[]
  settings: { name: string; label: string; type: string }[]
  plan_features: Choice[]
  payment_methods: Choice[]
  health_kinds: Choice[]
  routes: Choice[]
  purposes: Choice[]
  medicine_kinds: Choice[]
  feed_phases: Choice[]
  breed_types: Choice[]
  breed_reliabilities: Choice[]
  sale_units: Choice[]
  packagings: Choice[]
  category_sheets: Choice[]
  review_statuses: Choice[]
  report_reasons: Choice[]
  departure_reasons: Choice[]
  /** Listes de choix tenues au back-office. */
  choice_lists: ChoiceList[]
  /** Clés des pictogrammes et leur emoji, pour l'aperçu. */
  pictograms: { key: string; emoji: string }[]
  /** Rubriques du back-office qu'un groupe de l'équipe peut ouvrir. */
  sections: Section[]
}

export interface Section {
  key: string
  label: string
  /** Section du menu où la rubrique se range. */
  menu: string
}

export interface StaffUser {
  id: number
  phone: string
  name: string
  is_superuser: boolean
  /** Clés des rubriques ouvertes à ce compte (toutes pour un super-administrateur). */
  sections: string[]
}

/** Membre de l'équipe Nian Kpa. */
export interface TeamMember {
  id: number
  phone: string
  name: string
  groups: number[]
  sections: string[]
  is_active: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
}

/** Groupe de l'équipe et les rubriques qu'il ouvre. */
export interface TeamGroup {
  id: number
  name: string
  sections: string[]
  members: number
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
  /** Présente dans la fiche seulement, jamais dans la liste. */
  usage?: PlanUsage
}

export interface OrgFarm {
  id: string
  name: string
  locality: string | null
  place: number | null
  place_label: string | null
  latitude: number | null
  longitude: number | null
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

/** Employé d'une organisation (agent ou fermier), reconnu à son numéro. */
export interface Employee {
  id: number
  phone: string
  role: 'agent' | 'fermier'
  name: string
  organization: string
  organization_name: string | null
  /** Fermes où il a une fiche active ; vide : il est libre. */
  farms: string[]
  created_at: string
}

/** Motif de départ d'un employé, attaché à son numéro. */
export interface Departure {
  id: number
  phone: string
  name: string
  role: 'agent' | 'fermier'
  organization: string
  organization_name: string | null
  reason: string
  reason_label: string
  comment: string
  has_voice: boolean
  given_by_phone: string | null
  given_by_name: string
  created_at: string
  expires_at: string
  reply_text: string
  has_reply_voice: boolean
  replied_at: string | null
  contested_at: string | null
  hidden_at: string | null
  hidden_note: string
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

/** Type de fiche d'une catégorie : il dit quels champs ont ses produits. */
export type Sheet = 'medicament' | 'aliment' | 'sujet' | 'simple'

/** Catégorie de l'annuaire et du catalogue. */
export interface Category extends Reference {
  emoji: string
  color: string
  sheet: Sheet
  verification_required: boolean
}

/** Champs d'une fiche (standard ou produit) ; ceux des autres fiches
 *  restent vides. */
export interface SheetRow extends Reference {
  category: string
  sheet: Sheet
  description: string
  species: string[]
  unit: string
  medicine_kind: string | null
  withdrawal_days: number | null
  phase: string | null
  strain: string
  purpose: string | null
  age_days: number | null
  vaccines: string
}

/** Standard de la plateforme, sans produit : seulement un prix indicatif
 *  pour le simulateur, daté du jour où il a été posé. */
export interface Standard extends SheetRow {
  indicative_price: number | null
  indicative_price_at: string | null
}

/** Fiche technique d'une souche, pour le simulateur de bande. */
export interface Breed extends Reference {
  species: string
  species_name: string
  description: string
  breed_type: string
  purpose: string
  reliability: string
  standard: string | null
  program: string | null
  sale_age_min_days: number | null
  sale_age_days: number | null
  sale_age_max_days: number | null
  lay_start_week: number | null
  lay_peak_week: number | null
  lay_end_week: number | null
  mortality_low_percent: number
  mortality_high_percent: number
  density_start: number | null
  density_end: number | null
  feeders_per_100: number | null
  drinkers_per_100: number | null
  sale_unit: string
  sale_price: number | null
  sale_price_at: string | null
  weeks_count: number
}

/** Une semaine de la courbe d'une souche. */
export interface BreedWeek extends Reference {
  breed: string
  week: number
  weight_g: number | null
  weight_min_g: number | null
  weight_max_g: number | null
  feed_g_day: number | null
  water_ml_day: number | null
  lay_percent: number | null
  egg_weight_g: number | null
}

/** Phase du programme alimentaire d'une souche. */
export interface BreedFeedPhase extends Reference {
  breed: string
  phase: string
  age_from_days: number
  age_to_days: number
  standard: string | null
}

/** Où en est la vérification d'une fiche. */
export type ReviewStatus = 'attente' | 'verifie' | 'refuse' | 'suspendu'

export interface Reviewed {
  status: ReviewStatus
  status_note: string
  reviewed_by_phone: string | null
  reviewed_at: string | null
  published_at: string | null
}

/** Produit d'un fournisseur. */
export interface Product extends SheetRow, Reviewed {
  partner: string
  partner_name: string
  standard: string | null
  standard_name: string | null
  price: number | null
  /** Quantité disponible, dans l'unité du produit ; null = non renseignée. */
  stock_quantity: number | null
  certification: string
  certified: boolean
  brand: string
  bag_kg: number | null
}

/** Précision d'un fournisseur (pharmacie vétérinaire, couvoir…). */
export interface PartnerKind extends Reference {
  emoji: string
  default_category: string | null
}

/** Fournisseur de l'annuaire. */
export interface Partner extends Reference, Reviewed {
  categories: string[]
  precision: string | null
  phone1: string
  phone2: string
  address: string
  latitude: number | null
  longitude: number | null
  /** Localité du référentiel ; la plus proche de la position si vide. */
  place: number | null
  place_label: string | null
  zone: string
  radius_km: number
  accreditation: string
  accredited: boolean
  documents: string
  visited_at: string | null
  /** Fin du forfait hors plateforme ; vide = sans fin. */
  listed_until: string | null
  /** Fin de la mise en avant payée (annuaire sponsorisé) ; vide = aucune. */
  featured_until: string | null
  suggested_by: string | null
  suggested_by_name: string | null
  products_count: number
}

/** Signalement d'un fermier. */
export interface Report {
  id: number
  partner: string
  partner_name: string
  partner_status: ReviewStatus
  product: string | null
  product_name: string | null
  farm_name: string | null
  reason: string
  note: string
  created_at: string
  handled_at: string | null
  decision: string
}

export type GlobalConfig = Record<string, unknown> & {
  currency: string
  updated_at: string
  secrets_set: Record<string, boolean>
}

/** Permission que les rôles se partagent, rangée par rubrique. */
export interface PermissionEntry {
  perm: string
  rubric: string
  label: string
}

/** Rôle d'une personne (propriétaire, fermier, agent…) et ses permissions. */
export interface Role {
  key: string
  label: string
  permissions: string[]
  defaults: string[]
  /** Permissions imposées : toujours données (true) ou jamais (false). */
  locked: Record<string, boolean>
}

export interface RolesPayload {
  catalogue: PermissionEntry[]
  roles: Role[]
}

/** Forfait d'un vétérinaire : places payées, une par ferme suivie. */
export interface VetSubscription {
  id: number
  phone: string
  status: 'trial' | 'active' | 'expired'
  /** Fermes suivies en ce moment. */
  farms: number
  /** Fermes qu'il peut suivre : celles de l'essai, ou ses places payées. */
  allowed: number
  seats: number
  trial_ends_at: string | null
  paid_until: string | null
  note: string
  latitude: number | null
  longitude: number | null
  place: number | null
  place_label: string | null
}

export interface VetPayment {
  id: number
  seats: number
  months: number
  amount: number
  method: string
  reference: string
  paid_at: string
}

/** Localité de la Côte d'Ivoire (ville, village, quartier). */
export interface Locality {
  id: number
  name: string
  /** Nom et ce qui le situe : « Bouaké · Vallée du Bandama ». */
  label: string
  district: string
  region: string
  department: string
  sub_prefecture: string
  latitude: number | null
  longitude: number | null
  population: number
  geonames_id: number | null
}

/** Résultat d'un import de localités. */
export interface LocalityImport {
  created: number
  updated: number
  /** Fermes, fournisseurs et vétérinaires rattachés ensuite. */
  linked: number
}
