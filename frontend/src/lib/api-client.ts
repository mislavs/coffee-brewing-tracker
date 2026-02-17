import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions'
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary'
import { createApiClient } from '@/lib/api/generated/apiClient'
import { API_URL } from '@/lib/config'

const requestAdapter = new FetchRequestAdapter(
  new AnonymousAuthenticationProvider(),
)

requestAdapter.baseUrl = API_URL

export const apiClient = createApiClient(requestAdapter)
