import { SearchOutlined } from '@ant-design/icons'
import { Flex, Input } from 'antd'
import { useEffect, useState } from 'react'

interface Props {
  placeholder: string
  onSearch: (value: string) => void
  children?: React.ReactNode
}

/** Recherche et filtres, sur une ligne au-dessus de la table. La recherche
 *  part toute seule après une courte pause de frappe. */
export function SearchBar({ placeholder, onSearch, children }: Props) {
  const [value, setValue] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), 300)
    return () => clearTimeout(timer)
  }, [value, onSearch])
  return (
    <Flex gap={8} wrap style={{ marginBottom: 16 }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={{ width: 300, maxWidth: '100%' }}
      />
      {children}
    </Flex>
  )
}
