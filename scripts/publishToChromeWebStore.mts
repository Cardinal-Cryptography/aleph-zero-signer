// TODO: Validate the endpoints with https://github.com/fregante/chrome-webstore-upload/tree/main

const API_URL = 'https://www.googleapis.com/upload/chromewebstore/v1.1'

type ExceptFirst<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Last]
  ? Last
  : never;

const fetchApi = (path: string, ...params: ExceptFirst<Parameters<typeof fetch>>) =>
  fetch(`${API_URL}${path}`, ...params)
    .then(res => res.json())

const token = '' // TODO: Get the token: last step from https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md?ref=strawberryjam.ghost.io

const { id: itemId, itemError } = await fetchApi('/items', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  }
})

if (itemError?.length) throw new Error(itemError.join(' | '))

const { status, statusDetail } = await fetchApi(`/items/${itemId}/publish`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  }
})

console.log(`Publishing finished with the status "${status.join(', ')}": "${statusDetail.join(' | ')}"`)
