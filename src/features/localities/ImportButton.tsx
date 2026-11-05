import { UploadOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Upload } from 'antd'
import { useState } from 'react'

import { api, errorMessage } from '../../api/client'
import type { LocalityImport } from '../../api/types'

/** Import d'un export GeoNames (CI.zip, CI.txt) ou d'un CSV. Une
 *  localité déjà connue est mise à jour, jamais doublée. */
export function ImportButton() {
  const { message, modal } = App.useApp()
  const client = useQueryClient()
  const [busy, setBusy] = useState(false)

  const send = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setBusy(true)
    try {
      const result = await api<LocalityImport>('post', '/bo/localities/import/', body)
      client.invalidateQueries({ queryKey: ['localities'] })
      modal.success({
        title: 'Import terminé',
        content: `${result.created} localités ajoutées, ${result.updated} mises à jour, ${result.linked} fiches rattachées.`,
      })
    } catch (error) {
      message.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Upload
      accept=".zip,.txt,.csv"
      showUploadList={false}
      beforeUpload={(file) => {
        void send(file)
        return false
      }}
    >
      <Button icon={<UploadOutlined />} loading={busy}>
        Importer
      </Button>
    </Upload>
  )
}
