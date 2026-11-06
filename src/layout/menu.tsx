import {
  AppstoreOutlined,
  BankOutlined,
  CompassOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

type Item = Required<MenuProps>['items'][number]

interface Entry {
  key: string
  icon: React.ReactNode
  label: string
  /** Rubrique de l'API qui ouvre cette page (voir `backoffice/sections.py`). */
  section: string
}

interface Group {
  label: string | null
  children: Entry[]
}

const GROUPS: Group[] = [
  {
    label: null,
    children: [{ key: '/', icon: <DashboardOutlined />, label: 'Tableau de bord', section: 'dashboard' }],
  },
  {
    label: 'Clients',
    children: [
      { key: '/organizations', icon: <BankOutlined />, label: 'Organisations', section: 'organizations' },
      { key: '/accounts', icon: <TeamOutlined />, label: 'Comptes', section: 'accounts' },
      { key: '/employees', icon: <IdcardOutlined />, label: 'Employés', section: 'employees' },
    ],
  },
  {
    label: 'Abonnements',
    children: [
      { key: '/plans', icon: <AppstoreOutlined />, label: 'Plans', section: 'plans' },
      { key: '/payments', icon: <WalletOutlined />, label: 'Paiements', section: 'payments' },
      { key: '/checkouts', icon: <CreditCardOutlined />, label: 'Paiements en ligne', section: 'payments' },
      { key: '/vets', icon: <MedicineBoxOutlined />, label: 'Vétérinaires et techniciens', section: 'vets' },
    ],
  },
  {
    label: 'Application',
    children: [
      { key: '/references', icon: <DatabaseOutlined />, label: 'Listes de référence', section: 'references' },
      { key: '/localities', icon: <EnvironmentOutlined />, label: 'Localités', section: 'localities' },
      { key: '/suppliers', icon: <ShopOutlined />, label: 'Fournisseurs', section: 'directory' },
      { key: '/partners', icon: <CompassOutlined />, label: 'Annuaire', section: 'directory' },
      { key: '/roles', icon: <SafetyOutlined />, label: 'Rôles et permissions', section: 'roles' },
      { key: '/config', icon: <SettingOutlined />, label: 'Configuration', section: 'config' },
    ],
  },
  {
    label: 'Plateforme',
    children: [{ key: '/team', icon: <UsergroupAddOutlined />, label: 'Équipe', section: 'team' }],
  },
]

const ENTRIES = GROUPS.flatMap((group) => group.children)

/** Menu réduit aux rubriques ouvertes au compte connecté. */
export function menuFor(sections: string[]): Item[] {
  const items: Item[] = []
  for (const group of GROUPS) {
    const children = group.children
      .filter((entry) => sections.includes(entry.section))
      .map(({ key, icon, label }) => ({ key, icon, label }))
    if (!children.length) continue
    if (group.label) items.push({ type: 'group', label: group.label, children })
    else items.push(...children)
  }
  return items
}

/** Entrée du menu à surligner pour une adresse. */
export function selectedKey(pathname: string) {
  const first = `/${pathname.split('/')[1] ?? ''}`
  return first === '/' ? '/' : first
}

/** Vrai si l'adresse ouvre une page permise ; une adresse hors menu l'est. */
export function canOpen(pathname: string, sections: string[]) {
  const entry = ENTRIES.find((e) => e.key === selectedKey(pathname))
  return !entry || sections.includes(entry.section)
}

/** Première page permise, pour y mener quand l'adresse demandée ne l'est pas. */
export function firstPage(sections: string[]) {
  return ENTRIES.find((entry) => sections.includes(entry.section))?.key ?? null
}
