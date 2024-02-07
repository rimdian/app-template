'use client'
import { Button, Form, Input, message } from 'antd'
import CSS from '../css'
import Block from '../components'
import { useContext, useState } from 'react'
import { AppContext } from '../app_context'
import { activateAppAction } from '../actions'
import { refreshApp } from '../rimdian'

export default function Page() {
  const appContext = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    if (loading) return
    setLoading(true)

    activateAppAction(
      appContext.api_endpoint as string,
      appContext.collector_endpoint as string,
      appContext.workspace_id as string,
      appContext.app?.id as string,
      values.email,
      values.password,
      [
        {
          operation: 'set',
          key: 'custom_field',
          value: values.custom_field
        }
      ]
    )
      .then(() => {
        form.resetFields()
        message.success(appContext.app?.name + ' has been connected!')
        setLoading(false)
        appContext.reload()
        refreshApp()
      })
      .catch((e) => {
        setLoading(false)
        message.error(e.message)
      })
  }

  return (
    <div className={CSS.container + ' ' + CSS.padding_a_xl} style={{ width: 500 }}>
      {/* invalid token page */}
      <Block classNames={[CSS.margin_t_xl]}>
        <Form form={form} layout="vertical" className={CSS.padding_a_xl} onFinish={onFinish}>
          <Form.Item
            label="Service account email"
            name="email"
            rules={[{ required: true, type: 'string' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Service account password"
            name="password"
            rules={[{ required: true, type: 'string' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Custom field"
            name="custom_field"
            rules={[{ required: true, type: 'string' }]}
          >
            <Input />
          </Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Connect app
          </Button>
        </Form>
      </Block>
    </div>
  )
}
