'use client'
import { Alert } from 'antd'
// import styles from './page.module.css'

export default function Page() {
  return (
    <div style={{ width: 600, margin: '100px auto 0 auto' }}>
      {/* app is stopped */}
      <Alert
        message="The app is stopped"
        description="Tasks & hooks have been paused. You can reinstall the app or delete it."
        type="warning"
        showIcon
      />
    </div>
  )
}
