import { WebhookResult, WebhookPayload } from '@/interfaces'
import processDataHooks from '@/processDataHooks'
import processTasks from '@/processTasks'
import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'

export const SignatureHeader = 'X-Rmd-Signature'

export const config = {
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 20,
  api: {
    // Disables body parsing to compute the signature on the raw body properly
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<WebhookResult>) {
  if (req.method !== 'POST') {
    // The request is not a POST request
    res.status(200).end('This endpoint only accepts POST requests')
    return
  }

  // validate Signature header
  const signature = req.headers[SignatureHeader.toLowerCase()]
  if (!signature) {
    console.error('Missing Signature header ' + SignatureHeader)
    res.status(401).end('Missing Signature header')
    return
  }

  const appSecretKey = process.env.APP_SECRET_KEY
  if (!appSecretKey) {
    console.error('Missing APP_SECRET_KEY environment variable')
    res.status(401).end('Missing APP_SECRET_KEY environment variable')
    return
  }

  const rawBody = (await buffer(req)).toString()

  // console.log('Received payload', rawBody)

  // compute signature
  const crypto = require('crypto')
  const computedSignature = crypto.createHmac('sha256', appSecretKey).update(rawBody).digest('hex')

  // compare signatures
  if (signature !== computedSignature) {
    console.error('Invalid Signature header, expected', computedSignature, 'got', signature)
    res.status(401).end('Invalid Signature header')
    return
  }

  // parse payload
  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch (error) {
    console.error('Error parsing payload', error)
    res.status(400).end('Error parsing payload ' + error)
    return
  }

  // process payload
  if (payload.kind === 'data_hook') {
    try {
      const result = await processDataHooks(payload)
      res.status(200).json(result)
      return
    } catch (error) {
      console.error('Error processing data hook', error)
      res.status(500).end('Error processing data hook ' + error)
      return
    }
  }

  if (payload.kind === 'task_exec_worker') {
    try {
      const result = await processTasks(payload)
      res.status(200).json(result)
      return
    } catch (error) {
      console.error('Error processing task', error)
      res.status(500).end('Error processing task ' + error)
      return
    }
  }

  // unknown kind
  console.error('Unknown webhook kind', payload.kind)
  res.status(400).end('Unknown webhook kind: ' + payload.kind)
}
