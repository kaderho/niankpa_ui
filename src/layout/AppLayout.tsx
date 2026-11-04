import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Flex, Grid, Layout, Menu, Skeleton, Typography, theme } from 'antd'
import { Suspense, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/context'
import { Logo } from './Logo'
import { MENU, selectedKey } from './menu'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const screens = Grid.useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)
  const { token } = theme.useToken()
  const narrow = !screens.lg

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
          items={MENU}
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
              <Dropdown menu={{ items: MENU, onClick: ({ key }) => navigate(key) }} trigger={['click']}>
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
                <Typography.Text>{user?.phone}</Typography.Text>
              </Flex>
            </Dropdown>
          </Flex>
        </Layout.Header>
        <Layout.Content style={{ padding: narrow ? 16 : 32, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
            <Outlet />
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
