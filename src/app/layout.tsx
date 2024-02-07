import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AppContextProvider } from './app_context'
import { App, ConfigProvider } from 'antd'
import CSS from './css'

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
      <body>
        <AntdRegistry>
          <ConfigProvider theme={CSS.AntD}>
            <App>
              <AppContextProvider>{children}</AppContextProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
