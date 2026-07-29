import { handleSteamProxyRequest } from '../../../server/steamProxy.js'

export default function handler(request, response) {
  return handleSteamProxyRequest(request, response)
}
