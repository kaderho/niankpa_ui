import { UploadOutlined } from '@ant-design/icons'
import { App, Button, Input, Modal, Typography } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api, errorMessage } from '../../../api/client'
import type { Breed } from '../../../api/types'

const EXAMPLE = 'week;weight_g;weight_min_g;weight_max_g;feed_g_day;water_ml_day\n1;170;150;190;20;40\n2;430;380;480;45;90'

/** Colle la courbe d'une souche depuis un tableur : elle remplace la
 *  courbe actuelle. */
export function ImportWeeksButton({ breed }: { breed: Breed }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const { message } = App.useApp()
  const client = useQueryClient()

  const submit = async () => {
    setBusy(true)
    try {
      const result = await api<{ weeks: number }>('post', `/bo/breeds/${breed.id}/import-weeks/`, { csv: text })
      message.success(`${result.weeks} semaines importées.`)
      for (const key of ['breed-weeks', 'breeds']) client.invalidateQueries({ queryKey: [key] })
      setOpen(false)
      setText('')
    } catch (error) {
      message.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button icon={<UploadOutlined />} onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>
        Importer un CSV
      </Button>
      <Modal
        title={`Importer la courbe de « ${breed.name} »`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText="Remplacer la courbe"
        okButtonProps={{ disabled: !text.trim() }}
        confirmLoading={busy}
        width={640}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          Collez un tableau avec une ligne d'en-têtes. Colonne <code>week</code> obligatoire ; au choix{' '}
          <code>weight_g</code>, <code>weight_min_g</code>, <code>weight_max_g</code>, <code>feed_g_day</code>,{' '}
          <code>water_ml_day</code>, <code>lay_percent</code>, <code>egg_weight_g</code>. Séparateur <code>;</code>,{' '}
          <code>,</code> ou tabulation (copier-coller depuis un tableur). Les semaines absentes sont retirées.
        </Typography.Paragraph>
        <Input.TextArea
          rows={10}
          value={text}
          placeholder={EXAMPLE}
          onChange={(event) => setText(event.target.value)}
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>
    </>
  )
}
