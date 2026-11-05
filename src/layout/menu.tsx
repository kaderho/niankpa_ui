import {
  AppstoreOutlined,
  BankOutlined,
  CompassOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

type Item = Required<MenuProps>['items'][number]

export const MENU: Item[] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Tableau de bord' },
  {
    type: 'group',
    label: 'Clients',
    children: [
      { key: '/organizations', icon: <BankOutlined />, label: 'Organisations' },
      { key: '/accounts', icon: <TeamOutlined />, label: 'Comptes' },
      { key: '/employees', icon: <IdcardOutlined />, label: 'Employés' },
    ],
  },
  {
    type: 'group',
    label: 'Abonnements',
    children: [
      { key: '/plans', icon: <AppstoreOutlined />, label: 'Plans' },
      { key: '/payments', icon: <WalletOutlined />, label: 'Paiements' },
      { key: '/checkouts', icon: <CreditCardOutlined />, label: 'Paiements en ligne' },
      { key: '/vets', icon: <MedicineBoxOutlined />, label: 'Vétérinaires' },
    ],
  },
  {
    type: 'group',
    label: 'Application',
    children: [
      { key: '/references', icon: <DatabaseOutlined />, label: 'Listes de référence' },
      { key: '/partners', icon: <CompassOutlined />, label: 'Annuaire' },
      { key: '/roles', icon: <SafetyOutlined />, label: 'Rôles et permissions' },
      { key: '/config', icon: <SettingOutlined />, label: 'Configuration' },
    ],
  },
]

/** Entrée du menu à surligner pour une adresse. */
export function selectedKey(pathname: string) {
  const first = `/${pathname.split('/')[1] ?? ''}`
  return first === '/' ? '/' : first
}
