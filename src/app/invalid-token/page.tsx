'use client'
import { Alert } from 'antd'
import CSS from '../css'

export default function Page() {
  return (
    <div className={CSS.container + ' ' + CSS.padding_a_xl} style={{ width: 500 }}>
      {/* invalid token page */}
      <Alert message="Invalid token" type="error" />
    </div>
  )
}
