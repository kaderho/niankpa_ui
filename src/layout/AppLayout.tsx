import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Flex, Grid, Layout, Menu, Result, Skeleton, Typography, theme } from 'antd'
import { Suspense, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/context'
import { Logo } from './Logo'
import { canOpen, firstPage, menuFor, selectedKey } from './menu'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const screens = Grid.useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)
  const { token } = theme.useToken()
  const narrow = !screens.lg
  const sections = useMemo(() => user?.sections ?? [], [user])
  const menu = useMemo(() => menuFor(sections), [sections])

  // Une page fermée à ses groupes mène à la première qui lui est ouverte.
  const allowed = canOpen(pathname, sections)
  const fallback = allowed ? null : firstPage(sections)
  if (fallback) return <Navigate to={fallback} replace />

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        theme="light"
        width={240}
        collapsible
        collapsed={narrow || collapsed}
        collapsedWidth={narrow ? 0 : 72}
        trigger={null}
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}`, position: 'sticky', top: 0, height: '100vh' }}
      >
        <Flex align="center" gap={10} style={{ height: 64, padding: '0 20px' }}>
          <Logo size={30} />
          {!collapsed && (
            <Typography.Text strong style={{ fontSize: 17 }}>
              Nian Kpa
            </Typography.Text>
          )}
        </Flex>
        <Menu
          mode="inline"
          items={menu}
          selectedKeys={[selectedKey(pathname)]}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Flex align="center" justify="space-between" style={{ height: '100%' }}>
            {narrow ? (
              <Dropdown menu={{ items: menu, onClick: ({ key }) => navigate(key) }} trigger={['click']}>
                <Button type="text" icon={<MenuUnfoldOutlined />} aria-label="Menu" />
              </Dropdown>
            ) : (
              <Button
                type="text"
                aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            <Dropdown
              menu={{
                items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Se déconnecter', onClick: logout }],
              }}
            >
              <Flex align="center" gap={8} style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
                <Typography.Text>{user?.name || user?.phone}</Typography.Text>
              </Flex>
            </Dropdown>
          </Flex>
        </Layout.Header>
        <Layout.Content style={{ padding: narrow ? 16 : 32, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
            {allowed ? (
              <Outlet />
            ) : (
              <Result
                status="403"
                title="Aucune rubrique ouverte"
                subTitle="Votre compte n'est dans aucun groupe. Demandez à un administrateur de vous en ajouter un."
              />
            )}
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
