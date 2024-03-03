import Cryptr from 'cryptr'
import { getAccessToken, getConnectedApp, importData } from './app/actions'
import { WebhookResult, WebhookPayload } from './interfaces'
import dayjs from 'dayjs'

// should always return a WebhookResult even in case of error
export async function processTasks(payload: WebhookPayload): Promise<WebhookResult> {
  const result = {} as WebhookResult

  // get connected app from the DB
  const connectedApp = await getConnectedApp(
    payload.api_endpoint,
    payload.workspace_id,
    payload.app_id
  )

  if (!connectedApp) {
    result.is_done = true
    result.is_error = true
    result.message =
      'app ' +
      payload.app_id +
      ' not found for workspace ' +
      payload.workspace_id +
      ' and api_endpoint ' +
      payload.api_endpoint
    return result
  }

  // get access token from the connected app
  const cryptr = new Cryptr(process.env.APP_SECRET_KEY as string)
  const password = cryptr.decrypt(connectedApp.encrypted_password)

  let access_token = ''

  try {
    const token = await getAccessToken(payload.api_endpoint, connectedApp.email, password)
    access_token = token.access_token
  } catch (e: any) {
    result.is_done = true
    result.is_error = true
    result.message = e
    return result
  }

  switch (payload.task_exec_worker?.task_id) {
    case 'app_default_task_1':
      // process task 1
      return await processTask1(payload, access_token)
    default:
      // reject the task
      result.is_done = true
      result.is_error = true
      result.message = 'unsupported task kind: ' + payload.task_exec_worker?.task_id
      return result
  }
}

async function processTask1(payload: WebhookPayload, access_token: string): Promise<WebhookResult> {
  const result = {
    // init the worker state with the current state
    updated_worker_state: payload.task_exec_worker?.worker_state || {}
  } as WebhookResult

  // most tasks are state machines with a pipeline of steps
  const currentStep = result.updated_worker_state.current_step || 'step1'

  switch (currentStep) {
    case 'step1':
      // do something, for example import data to the collector API
      const items = [
        {
          kind: 'user',
          user: {
            external_id: '123',
            is_authenticated: true,
            created_at: dayjs().toISOString(),
            updated_at: dayjs().toISOString(),
            email: 'example@....com'
          }
        },
        {
          kind: 'app_default_table1',
          app_default_table1: {
            external_id: '123',
            created_at: dayjs().toISOString(),
            updated_at: dayjs().toISOString(),
            column1: 'value1',
            column2: 'value2'
          }
        }
      ]

      result.items_to_import = items.map((item) => JSON.stringify(item))

      // update the worker state with the new state
      result.updated_worker_state.step1_took = '10s'
      result.updated_worker_state.current_step = 'step2'

      // if somehow you deal with external API that has a rate limit
      // you can delay the trigger of the next worker execution
      result.delay_next_request_in_secs = 10
      return result
    case 'step2':
      // do something else and update the worker state with the new state
      result.updated_worker_state.step2_took = '20s'
      result.updated_worker_state.current_step = 'done'
      return result
    case 'done':
      result.is_done = true
      result.is_error = false
      result.message = 'task is done'
      result.app_state_mutations = [
        {
          operation: 'set',
          key: 'last_import_completed_at',
          value: dayjs().toISOString()
        }
      ]
    default:
      // reject the task
      result.is_done = true
      result.is_error = true
      result.message = 'unsupported step: ' + currentStep
      return result
  }
}

export default processTasks
