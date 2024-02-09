'use client'
import { Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { AppContext } from './app_context'
import { useContext, useEffect } from 'react'

export default function Home() {
  const appContext = useContext(AppContext)
  const router = useRouter()

  // redirect to dashboard if app is loaded
  useEffect(() => {
    if (appContext.app) {
      if (appContext.app.status === 'initializing') {
        router.push('/initializing')
      } else if (appContext.app.status === 'stopped') {
        router.push('/stopped')
      } else {
        router.push('/dashboard')
      }
    }
  }, [appContext.app, router])

  // redirect to invalid token page if token is invalid
  useEffect(() => {
    if (appContext.invalid_token) {
      router.push('/invalid-token')
    }
  }, [appContext.invalid_token, router])

  // show loading if app is not loaded
  return (
    <div style={{ width: '1px', margin: '100px auto 0 auto' }}>
      <Spin size="large" />
    </div>
  )
}
