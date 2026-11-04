import { DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons'
import { App, Button, Flex, Form, Modal, Popconfirm, Switch, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'

import { api } from '../../api/client'
import type { Reference } from '../../api/types'
import { showFormErrors } from '../../shared/forms'
import { useAction, useList, useSave } from '../../shared/queries'

interface Props<T extends Reference> {
  /** Ressource de /api/bo/ (species, egg-criteria…). */
  resource: string
  /** Nom d'une ligne, pour les titres : « une espèce ». */
  noun: string
  columns: ColumnsType<T>
  /** Champs du formulaire de création et de modification. */
  fields: React.ReactNode
  defaults?: Partial<T>
  params?: Record<string, unknown>
  /** Actions propres à une ligne, avant modifier et supprimer. */
  rowActions?: (row: T) => React.ReactNode
}

/** Table d'une liste de référence : ajouter, modifier, masquer, rétablir.
 *  Tout ce qui est enregistré repart vers les téléphones à leur synchro. */
export function ReferenceTable<T extends Reference>(props: Props<T>) {
  const { resource, noun, columns, fields, defaults, params, rowActions } = props
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const [showDeleted, setShowDeleted] = useState(false)
  const [editing, setEditing] = useState<T | null | undefined>(undefined)
  const { data = [], isFetching } = useList<T[]>(resource, params)
  const save = useSave<T>(resource)
  const remove = useAction(resource, (id) => api('delete', `/bo/${resource}/${id}/`), {
    success: 'Masqué sur les téléphones.',
  })
  const restore = useAction(resource, (id) => api('post', `/bo/${resource}/${id}/restore/`), {
    success: 'Rétabli.',
  })

  useEffect(() => {
    if (editing === undefined) return
    form.resetFields()
    form.setFieldsValue(editing ?? { position: data.length, ...defaults })
  }, [editing, form, defaults, data.length])

  const submit = async (values: Partial<T>) => {
    try {
      await save.mutateAsync({ ...params, ...values, id: editing?.id })
      setEditing(undefined)
    } catch (error) {
      const general = showFormErrors(form, error)
      if (general) message.error(general)
    }
  }

  const rows = showDeleted ? data : data.filter((row) => !row.deleted_at)
  const deletedCount = data.length - data.filter((row) => !row.deleted_at).length

  return (
    <>
      <Flex justify="space-between" align="center" gap={8} wrap style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <Switch size="small" checked={showDeleted} onChange={setShowDeleted} />
          <Typography.Text type="secondary">Afficher les lignes supprimées ({deletedCount})</Typography.Text>
        </Flex>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>
          Ajouter {noun}
        </Button>
      </Flex>
      <Table<T>
        rowKey="id"
        size="middle"
        loading={isFetching}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 640 }}
        rowClassName={(row) => (row.deleted_at ? 'ant-table-row-disabled' : '')}
        columns={[
          ...columns,
          {
            key: 'state',
            width: 100,
            render: (_, row) => (row.deleted_at ? <Tag>Supprimée</Tag> : null),
          },
          {
            key: 'actions',
            width: 150,
            align: 'right',
            render: (_, row) => (
              <Flex gap={4} justify="flex-end">
                {rowActions?.(row)}
                {row.deleted_at ? (
                  <Tooltip title="Rétablir">
                    <Button type="text" icon={<UndoOutlined />} onClick={() => restore.mutate(row.id)} />
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title="Modifier">
                      <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(row)} />
                    </Tooltip>
                    <Popconfirm
                      title="Masquer cette ligne ?"
                      description="Elle disparaît des téléphones ; les données qui la citent restent intactes."
                      okText="Masquer"
                      onConfirm={() => remove.mutate(row.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} aria-label="Supprimer" />
                    </Popconfirm>
                  </>
                )}
              </Flex>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? `Modifier « ${editing.name} »` : `Ajouter ${noun}`}
        open={editing !== undefined}
        onCancel={() => setEditing(undefined)}
        onOk={form.submit}
        okText="Enregistrer"
        confirmLoading={save.isPending}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          {fields}
        </Form>
      </Modal>
    </>
  )
}
