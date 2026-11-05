import { Button, Popconfirm, Select, Table, Tag, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../api/client'
import type { Employee, Page } from '../../api/types'
import { formatDate } from '../../shared/format'
import { useAction, useList } from '../../shared/queries'
import { SearchBar } from '../../shared/SearchBar'

const ROLES = { agent: 'Agent', fermier: 'Fermier' }

/** Les employés ; le support libère celui que son organisation ne retire pas. */
export function EmployeesTab() {
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, page_size: 20 })
  const { data, isFetching } = useList<Page<Employee>>('employees', params)
  const onSearch = useCallback((search: string) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const release = useAction('employees', (id) => api('post', `/bo/employees/${id}/release/`), {
    success: 'Employé libéré : une autre organisation peut l’inviter.',
  })

  return (
    <>
      <SearchBar placeholder="Numéro, nom ou organisation" onSearch={onSearch}>
        <Select
          allowClear
          placeholder="Rôle"
          style={{ width: 150 }}
          options={Object.entries(ROLES).map(([value, label]) => ({ value, label }))}
          onChange={(role) => setParams((p) => ({ ...p, role, page: 1 }))}
        />
      </SearchBar>
      <Table<Employee>
        rowKey="id"
        loading={isFetching}
        dataSource={data?.results}
        scroll={{ x: 900 }}
        pagination={{
          current: params.page as number,
          pageSize: params.page_size as number,
          total: data?.count,
          showSizeChanger: true,
          onChange: (page, page_size) => setParams((p) => ({ ...p, page, page_size })),
        }}
        columns={[
          {
            title: 'Numéro',
            dataIndex: 'phone',
            render: (phone: string, employee) => (
              <>
                <Typography.Text strong>{phone}</Typography.Text>{' '}
                <Typography.Text type="secondary">{employee.name}</Typography.Text>
              </>
            ),
          },
          { title: 'Rôle', dataIndex: 'role', render: (role: Employee['role']) => ROLES[role] },
          {
            title: 'Organisation',
            render: (_, employee) => (
              <Link to={`/organizations/${employee.organization}`}>{employee.organization_name}</Link>
            ),
          },
          {
            title: 'Fermes',
            dataIndex: 'farms',
            render: (farms: string[]) =>
              farms.length ? farms.map((farm) => <Tag key={farm}>{farm}</Tag>) : <Tag color="green">Libre</Tag>,
          },
          { title: 'Depuis', dataIndex: 'created_at', render: formatDate },
          {
            title: '',
            align: 'right',
            render: (_, employee) =>
              employee.farms.length > 0 && (
                <Popconfirm
                  title="Libérer cet employé ?"
                  description="Ses fiches se ferment et ses téléphones perdent l'accès."
                  okText="Libérer"
                  cancelText="Annuler"
                  onConfirm={() => release.mutate(employee.id)}
                >
                  <Button danger size="small">Libérer cet employé</Button>
                </Popconfirm>
              ),
          },
        ]}
      />
    </>
  )
}
