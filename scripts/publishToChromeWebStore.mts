import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util'
import assert from 'node:assert';

const REFRESH_TOKEN_URI = 'https://www.googleapis.com/oauth2/v4/token'
const CHROME_WEB_STORE_API_URL = 'https://www.googleapis.com/upload/chromewebstore/v1.1'
const EXTENSION_ZIP_PATH = './extension-chrome.zip'
const EXTENSION_ID = 'opbinaebpmphpefcimknblieddamhmol'

const CLIENT_ID_PARAM_NAME = 'clientId'
const CLIENT_SECRET_PARAM_NAME = 'clientSecret'
const REFRESH_TOKEN_PARAM_NAME = 'refreshToken'

const { values: {
  [CLIENT_ID_PARAM_NAME]: clientId = '',
  [CLIENT_SECRET_PARAM_NAME]: clientSecret = '',
  [REFRESH_TOKEN_PARAM_NAME]: refreshToken = '',
}} = parseArgs({
  options: {
    [CLIENT_ID_PARAM_NAME]: { type: 'string' },
    [CLIENT_SECRET_PARAM_NAME]: { type: 'string' },
    [REFRESH_TOKEN_PARAM_NAME]: { type: 'string' },
  }
})

assert(clientId, `The "${CLIENT_ID_PARAM_NAME}" parameter is not set.`)
assert(clientSecret, `The "${CLIENT_SECRET_PARAM_NAME}" parameter is not set.`)
assert(refreshToken, `The "${REFRESH_TOKEN_PARAM_NAME}" parameter is not set.`)

const parseJsonResponse = async (res: Response) => {
  if (!res.ok) throw new Error(`Fetch error "${res.status}": "${await res.text()}"`)

  try {
    return await res.clone().json()
  } catch (e) {
    throw new Error(`Error when parsing response: ${await res.text()}`)
  }
}

console.log('Fetching access token.')
const { access_token: accessToken } = await fetch(REFRESH_TOKEN_URI, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
}).then(parseJsonResponse)
console.log('Access token received.')

const fetchApi = (path: string, init?: Parameters<typeof fetch>[1]) =>
  fetch(`${CHROME_WEB_STORE_API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      'x-goog-api-version': '2'
    },
  }).then(parseJsonResponse)

// @ts-expect-error
const getExtensionZipBlob = () => readFile(EXTENSION_ZIP_PATH)

// @ts-expect-error
const uploadExtension = (fileExtensionBlob: Buffer) => fetchApi(`/items/${EXTENSION_ID}`, {
  method: 'PUT',
  body: fileExtensionBlob,
})

// @ts-expect-error
const publishExtension = () => fetchApi(`/items/${EXTENSION_ID}/publish?publishTarget=default`, {
  method: 'POST',
})

console.log(
  await fetchApi(`/items/${EXTENSION_ID}?projection=DRAFT`)
)

console.log('Uploading the extension zip.')
// await uploadExtension(await getExtensionZipBlob())

console.log('Publishing the extension.')
// await publishExtension()

//
// const { id: itemId, itemError } = await fetchApi('/items', {
//   method: 'POST',
//   headers: {
//     Authorization: `Bearer ${token}`,
//   }
// })
//
// if (itemError?.length) throw new Error(itemError.join(' | '))
//
// const { status, statusDetail } = await fetchApi(`/items/${itemId}/publish`, {
//   method: 'POST',
//   headers: {
//     Authorization: `Bearer ${token}`,
//   }
// })
//
// console.log(`Publishing finished with the status "${status.join(', ')}": "${statusDetail.join(' | ')}"`)
