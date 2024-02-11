'use server'
import * as jose from 'jose'
import axios from 'axios'
import {
  AccessTokenCache,
  AppStateMutation,
  ConnectedApp,
  ExecQuery,
  ExecQueryResult,
  LoginResult
} from '@/interfaces'
import Cryptr from 'cryptr'
import { getPool } from '@/db'
import https from 'https'
import dayjs from 'dayjs'
// create an https agent to ignore TLS certificate errors (self-signed certificate in dev)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

const accessTokenCache: AccessTokenCache = {}

export async function loadAppFromTokenAction(token: string) {
  const secret = new TextEncoder().encode(process.env.APP_SECRET_KEY)

  // verify jwt token
  const { payload } = await jose.jwtVerify(token, secret)

  // load app from Rimdian API
  try {
    const res = await axios.post(
      payload.api_endpoint + '/api/app.getFromToken',
      { token },
      { httpsAgent: httpsAgent }
    )
    return res.data
  } catch (e: any) {
    throwAPIError(e)
  }
}

export async function activateAppAction(
  api_endpoint: string,
  collector_endpoint: string,
  workspace_id: string,
  app_id: string,
  email: string,
  password: string,
  appStateMutations: AppStateMutation[]
) {
  // store credentials in DB and activate app
  let conn: any = null

  try {
    const pool = getPool()
    conn = await pool.getConnection()

    await ensureTablesExist(conn)

    // encrypt password with GCM and secret key
    const cryptr = new Cryptr(process.env.APP_SECRET_KEY as string)
    const encrypted_password = cryptr.encrypt(password)

    // verify credentials and get access token
    const { access_token } = await getAccessToken(api_endpoint, email, password)

    await insertConnectedApp(
      conn,
      api_endpoint,
      collector_endpoint,
      workspace_id,
      app_id,
      email,
      encrypted_password
    )

    // mutate app state
    await mutateAppState(api_endpoint, workspace_id, app_id, appStateMutations, access_token)

    try {
      await axios.post(
        api_endpoint + '/api/app.activate',
        {
          workspace_id: workspace_id,
          id: app_id
        },
        {
          httpsAgent: httpsAgent,
          headers: {
            Authorization: 'Bearer ' + access_token
          }
        }
      )
    } catch (e: any) {
      throwAPIError(e)
    }
  } finally {
    if (conn) {
      conn.end()
    }
  }
}

export async function getAccessToken(
  api_endpoint: string,
  email: string,
  password: string
): Promise<LoginResult> {
  let data: LoginResult = {} as LoginResult

  // check if access token is in cache
  if (accessTokenCache[api_endpoint]) {
    if (accessTokenCache[api_endpoint][email]) {
      const expiresAt = dayjs(accessTokenCache[api_endpoint][email].access_token_expires_at)
      const nowWithBuffer = dayjs().add(5, 'minutes')
      if (expiresAt.isAfter(nowWithBuffer)) {
        return accessTokenCache[api_endpoint][email]
      } else {
        delete accessTokenCache[api_endpoint][email]
      }
    }
  }

  try {
    const res: any = await axios.post(
      api_endpoint + '/api/account.login',
      {
        email: email,
        password: password
      },
      {
        httpsAgent: httpsAgent
      }
    )
    data = res.data
  } catch (e: any) {
    throwAPIError(e)
  }
  return data
}

export async function getAccessTokenForApp(
  api_endpoint: string,
  workspace_id: string,
  app_id: string
): Promise<LoginResult> {
  const app = await getConnectedApp(api_endpoint, workspace_id, app_id)
  const cryptr = new Cryptr(process.env.APP_SECRET_KEY as string)
  let password = ''
  try {
    password = cryptr.decrypt(app.encrypted_password)
  } catch (e: any) {
    throw new Error('APP_SECRET_KEY is invalid')
  }
  return getAccessToken(api_endpoint, app.email, password)
}

async function ensureTablesExist(conn: any) {
  await conn.query(`
        CREATE TABLE IF NOT EXISTS connected_apps (
            api_endpoint VARCHAR(255) NOT NULL,
            collector_endpoint VARCHAR(255) NOT NULL,
            workspace_id VARCHAR(255) NOT NULL,
            app_id VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            encrypted_password VARCHAR(512) NOT NULL,
            PRIMARY KEY (api_endpoint, workspace_id, app_id)
        )`)
}

async function insertConnectedApp(
  conn: any,
  api_endpoint: string,
  collector_endpoint: string,
  workspace_id: string,
  app_id: string,
  email: string,
  encrypted_password: string
) {
  const query = `
            INSERT INTO connected_apps (api_endpoint, collector_endpoint, workspace_id, app_id, email, encrypted_password)
            VALUES (?, ?, ?, ?, ?, ?)`
  const args = [api_endpoint, collector_endpoint, workspace_id, app_id, email, encrypted_password]

  try {
    await conn.query(query, args)
  } catch (e: any) {
    // ignore duplicate entry error
    if (e.code !== 'ER_DUP_ENTRY') {
      throw e
    }
  }
}

export async function getConnectedApp(
  api_endpoint: string,
  workspace_id: string,
  app_id: string
): Promise<ConnectedApp> {
  // store credentials in DB and activate app
  let conn: any = null

  try {
    const pool = getPool()
    conn = await pool.getConnection()

    const rows = await conn.query(
      'SELECT * FROM connected_apps WHERE api_endpoint = ? AND workspace_id = ? AND app_id = ?',
      [api_endpoint, workspace_id, app_id]
    )

    if (rows.length === 0) {
      throw 'APP_NOT_FOUND'
    }

    return rows[0]
  } catch (e: any) {
    throw e
  } finally {
    if (conn) {
      conn.end()
    }
  }
}

export async function mutateAppState(
  api_endpoint: string,
  workspace_id: string,
  app_id: string,
  appStateMutations: AppStateMutation[],
  access_token: string
) {
  if (appStateMutations.length === 0) {
    return
  }

  try {
    await axios.post(
      api_endpoint + '/api/app.mutateState',
      {
        workspace_id: workspace_id,
        id: app_id,
        mutations: appStateMutations
      },
      {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      }
    )
  } catch (e: any) {
    throwAPIError(e)
  }
}

export async function execQuery(props: ExecQuery): Promise<ExecQueryResult | undefined> {
  const { access_token } = await getAccessTokenForApp(
    props.api_endpoint,
    props.workspace_id,
    props.app_id
  )
  const data = {
    workspace_id: props.workspace_id,
    app_id: props.app_id,
    query_id: props.query_id
  } as any

  if (props.query) {
    data.query = props.query
  }

  if (props.args) {
    data.args = props.args
  }

  try {
    const res = await axios.post(props.api_endpoint + '/api/app.execQuery', data, {
      httpsAgent: httpsAgent,
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    })

    return res.data as ExecQueryResult
  } catch (e: any) {
    throwAPIError(e)
  }
}

export async function importData(
  collector_endpoint: string,
  workspace_id: string,
  access_token: string,
  items: any[],
  sync?: boolean
) {
  if (items.length === 0) {
    return
  }

  try {
    await axios.post(
      collector_endpoint + (sync ? '/sync' : '/data'),
      {
        workspace_id: workspace_id,
        items: items
      },
      {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      }
    )
  } catch (e: any) {
    throwAPIError(e)
  }
}

const throwAPIError = (e: any) => {
  if (e.response.data?.code === 400) {
    throw new Error(e.response.data?.message)
  }
  throw e
}
