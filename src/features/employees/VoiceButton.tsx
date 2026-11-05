import { SoundOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { useState } from 'react'

import { errorMessage, http } from '../../api/client'

/** Écoute un vocal du back-office : il se charge avec le jeton de session. */
export function VoiceButton({ url, label }: { url: string; label: string }) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const play = async () => {
    setLoading(true)
    try {
      const { data } = await http.get<Blob>(url, { responseType: 'blob' })
      const source = URL.createObjectURL(data)
      const audio = new Audio(source)
      audio.onended = () => URL.revokeObjectURL(source)
      await audio.play()
    } catch (error) {
      message.error(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button size="small" icon={<SoundOutlined />} loading={loading} onClick={play}>
      {label}
    </Button>
  )
}
