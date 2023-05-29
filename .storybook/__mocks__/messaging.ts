const subscribe = (cb: (items: Array<unknown>) => void) => cb([]);

export const subscribeAccounts = subscribe;
export const subscribeAuthorizeRequests = subscribe;
export const subscribeMetadataRequests = (cb: (items: Array<unknown>) => void) => cb([undefined]);
export const subscribeSigningRequests = subscribe;
export const getMetadata = (genesisHash: string, isPartial: boolean | undefined) => Promise.resolve(null);
