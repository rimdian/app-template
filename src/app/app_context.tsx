'use client'
import { useSearchParams } from 'next/navigation'
import { createContext, useCallback, useEffect, useState } from 'react'
import { loadAppFromTokenAction } from './actions'
import { App } from '@/interfaces'

export interface IAppContext {
  invalid_token: boolean
  app?: App
  reload: () => Promise<void>
}

const defaultState = {
  invalid_token: false,
  reload: async () => {}
}

// The AppContext fetches the app from the token and stores it in the context
export const AppContext = createContext<IAppContext>(defaultState)

export function AppContextProvider({ children }: { children: any }) {
  const [value, setValue] = useState<IAppContext>(defaultState)
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const loadAppFromToken = useCallback(
    async (token: string) => {
      const reload = async function () {
        if (token) {
          await loadAppFromToken(token)
        }
      }

      try {
        const data = await loadAppFromTokenAction(token)
        // console.log(data)
        setValue({
          app: data.app as App,
          invalid_token: false,
          reload: reload
        })
      } catch (error) {
        console.error(error)
        setValue({
          app: undefined,
          invalid_token: true,
          reload: reload
        })
      }
    },
    [setValue]
  )

  useEffect(() => {
    if (token) {
      loadAppFromToken(token)
    }
  }, [token, loadAppFromToken])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
