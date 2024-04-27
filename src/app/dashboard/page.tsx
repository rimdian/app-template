'use client'
import CSS from '../css'
import Block from '../components'
import { useContext, useState } from 'react'
import { AppContext } from '../app_context'
import { Button, Divider, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { execQuery } from '../actions'

export default function Page() {
  const ctx = useContext(AppContext)
  const [formQuery1] = useForm()
  const [formQuery2] = useForm()
  const [loadingQuery1, setLoadingQuery1] = useState(false)
  const [loadingQuery2, setLoadingQuery2] = useState(false)
  const [queryResult, setQueryResult] = useState<any>(null)

  const execQuery1 = async (values: any) => {
    if (loadingQuery1) return
    setLoadingQuery1(true)
    try {
      const result = await execQuery({
        api_endpoint: ctx.app?.api_endpoint as string,
        workspace_id: ctx.app?.workspace_id as string,
        app_id: ctx.app?.id as string,
        query_id: ctx.app?.manifest.sql_queries?.[0].id || '',
        args: [values.user_external_id]
      })
      setQueryResult(result)
    } catch (error: any) {
      message.error(error.message)
      setQueryResult(null)
    } finally {
      setLoadingQuery1(false)
    }
  }

  const execQuery2 = async (values: any) => {
    if (loadingQuery1) return
    setLoadingQuery2(true)
    try {
      const result = await execQuery({
        api_endpoint: ctx.app?.api_endpoint as string,
        workspace_id: ctx.app?.workspace_id as string,
        app_id: ctx.app?.id as string,
        query_id: ctx.app?.manifest.sql_queries?.[1].id || '',
        query: values.query
      })
      setQueryResult(result)
    } catch (error: any) {
      message.error(error.message)
      setQueryResult(null)
    } finally {
      setLoadingQuery2(false)
    }
  }

  return (
    <div className={CSS.container + ' ' + CSS.padding_a_xl} style={{ width: 630 }}>
      <Block title="Current app state">
        <div className={CSS.padding_a_m}>
          <pre>{JSON.stringify(ctx.app?.state, null, 2)}</pre>
        </div>
      </Block>

      <Block title="Test app SQL queries">
        <div className={CSS.padding_a_m}>
          <Form form={formQuery1} layout="inline" onFinish={execQuery1}>
            <Form.Item
              style={{ width: 400 }}
              name="user_external_id"
              rules={[{ required: true, type: 'string' }]}
            >
              <Input placeholder="Enter a user external ID" />
            </Form.Item>
            <Form.Item>
              <Button loading={loadingQuery1} type="primary" htmlType="submit">
                Exec query 1
              </Button>
            </Form.Item>
          </Form>
          <Divider />
          <Form form={formQuery2} layout="inline" onFinish={execQuery2}>
            <Form.Item
              style={{ width: 400 }}
              name="query"
              rules={[{ required: true, type: 'string' }]}
            >
              <Input placeholder="Enter a custom query... SELECT * from `order` LIMIT 1" />
            </Form.Item>
            <Form.Item>
              <Button loading={loadingQuery2} type="primary" htmlType="submit">
                Exec query 2
              </Button>
            </Form.Item>
          </Form>

          {queryResult && (
            <div className={CSS.padding_a_m}>
              <pre>{JSON.stringify(queryResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}
