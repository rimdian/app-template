import type { Metadata } from 'next'
// import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AppContextProvider } from './app_context'
import { App, ConfigProvider } from 'antd'
import CSS from './css'

// import { Inter } from 'next/font/google'
// const inter = Inter({ subsets: ['latin'] })

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
      {/* <body className={inter.className}> */}
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
