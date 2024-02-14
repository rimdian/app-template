import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AppContextProvider } from './app_context'
import { App, ConfigProvider } from 'antd'
import CSS from './css'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Default Rimdian app',
  description: 'Template to build a Rimdian app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={CSS.GLOBAL.body}>
        <AntdRegistry>
          <ConfigProvider {...CSS.AntDConfig}>
            <App>
              <Suspense>
                <AppContextProvider>{children}</AppContextProvider>
              </Suspense>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
