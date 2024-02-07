'use client'
import { useSearchParams } from 'next/navigation'
import { createContext, useEffect, useState } from 'react'
import { loadAppFromTokenAction } from './actions'

export interface IAppContext {
  api_endpoint: string
  collector_endpoint: string
  workspace_id: string
  invalid_token: boolean
  app?: App
  reload: () => Promise<void>
}

const defaultState = {
  api_endpoint: '',
  collector_endpoint: '',
  workspace_id: '',
  invalid_token: false,
  reload: async () => {}
}

// The AppContext fetches the app from the token and stores it in the context
export const AppContext = createContext<IAppContext>(defaultState)

export function AppContextProvider({ children }: { children: any }) {
  const [value, setValue] = useState<IAppContext>(defaultState)
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  async function reload() {
    if (token) {
      await loadAppFromToken(token)
    }
  }

  async function loadAppFromToken(token: string) {
    try {
      const data = await loadAppFromTokenAction(token)
      // console.log(data)
      setValue({
        api_endpoint: data.api_endpoint,
        collector_endpoint: data.collector_endpoint,
        workspace_id: data.workspace_id,
        app: data.app,
        invalid_token: false,
        reload: reload
      })
    } catch (error) {
      console.error(error)
      setValue({
        api_endpoint: '',
        collector_endpoint: '',
        workspace_id: '',
        app: undefined,
        invalid_token: true,
        reload: reload
      })
    }
  }

  useEffect(() => {
    if (token) {
      loadAppFromToken(token)
    }
  }, [token])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
