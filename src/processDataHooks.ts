import { WebhookPayload, WebhookResult } from '@/interfaces'

// should always return a WebhookResult even in case of error
export async function processDataHooks(payload: WebhookPayload): Promise<WebhookResult> {
  const result = {} as WebhookResult
  // do some stuff with the payload
  // ...
  // resolve the promise
  return result
}

export default processDataHooks
