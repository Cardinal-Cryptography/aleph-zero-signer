const subscribe = (cb: (items: Array<unknown>) => void) => cb([]);

export const subscribeAccounts = subscribe;
export const subscribeAuthorizeRequests = subscribe;
export const subscribeMetadataRequests = (cb: (items: Array<unknown>) => void) => cb([undefined]);
export const subscribeSigningRequests = subscribe;
export const getMetadata = (genesisHash: string, isPartial: boolean | undefined) => Promise.resolve(null);
export const createSeed = () => Promise.resolve({
  address: '5FyJZtpz7W1ugKXsrQxYGfawYymCL3VhprqgrNxqEVwSRYR1', seed: 'loud clog similar hungry damage light together wealth area master potato fire'
});
export const validateSeed = () => Promise.resolve({address: '5FyJZtpz7W1ugKXsrQxYGfawYymCL3VhprqgrNxqEVwSRYR1' })
export const getAllMetadata = () => Promise.resolve([]);
export const createAccountSuri = () => Promise.resolve();