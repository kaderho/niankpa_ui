import { Flex, Typography } from 'antd'

interface Props {
  title: string
  subtitle?: string
  extra?: React.ReactNode
}

export function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <Flex justify="space-between" align="flex-end" gap={16} wrap style={{ marginBottom: 24 }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {extra && (
        <Flex gap={8} wrap>
          {extra}
        </Flex>
      )}
    </Flex>
  )
}
