import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginPage } from './auth/LoginPage'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'

// Chaque page se charge à sa première visite.
const page = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(() => load().then((module) => ({ default: module[name] })))

const DashboardPage = page(() => import('./features/dashboard/DashboardPage'), 'DashboardPage')
const OrganizationsPage = page(() => import('./features/organizations/OrganizationsPage'), 'OrganizationsPage')
const AccountsPage = page(() => import('./features/accounts/AccountsPage'), 'AccountsPage')
const PlansPage = page(() => import('./features/plans/PlansPage'), 'PlansPage')
const PaymentsPage = page(() => import('./features/payments/PaymentsPage'), 'PaymentsPage')
const CheckoutsPage = page(() => import('./features/payments/CheckoutsPage'), 'CheckoutsPage')
const ReferencesPage = page(() => import('./features/references/ReferencesPage'), 'ReferencesPage')
const PartnersPage = page(() => import('./features/directory/PartnersPage'), 'PartnersPage')
const VetsPage = page(() => import('./features/vets/VetsPage'), 'VetsPage')
const RolesPage = page(() => import('./features/roles/RolesPage'), 'RolesPage')
const ConfigPage = page(() => import('./features/config/ConfigPage'), 'ConfigPage')

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="organizations/:id?" element={<OrganizationsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="checkouts" element={<CheckoutsPage />} />
          <Route path="vets" element={<VetsPage />} />
          <Route path="references/:tab?" element={<ReferencesPage />} />
          <Route path="partners/:tab?" element={<PartnersPage />} />
          <Route path="roles/:tab?" element={<RolesPage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
