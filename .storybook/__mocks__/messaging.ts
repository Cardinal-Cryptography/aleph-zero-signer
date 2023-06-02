const subscribe = (cb: (items: Array<unknown>) => void) => cb([]);

export const subscribeAccounts = subscribe;
export const subscribeAuthorizeRequests = subscribe;
export const subscribeMetadataRequests = (cb: (items: Array<unknown>) => void) => cb([{
  id: 'Aleph Zero Signer',
  request: {
    chain: "Aleph Zero Testnet",
    chainType: 'substrate',
    color: '#00CCAB',
    genesisHash: "0x05d5279c52c484cc80396535a316add7d47b1c5b9e0398dd1f584149341460c5",
    icon: "substrate",
    specVersion: 64,
    ss58Format: 42,
    tokenDecimals: 12,
    tokenSymbol: "TZERO",
    metaCalls: "",
  },
  url: "https://test.azero.dev/#/accounts"
}]);
export const subscribeSigningRequests = subscribe;
export const getMetadata = (genesisHash: string, isPartial: boolean | undefined) => Promise.resolve(null);
export const createSeed = () => Promise.resolve({
  address: '5FyJZtpz7W1ugKXsrQxYGfawYymCL3VhprqgrNxqEVwSRYR1', seed: 'loud clog similar hungry damage light together wealth area master potato fire'
});
export const validateSeed = () => Promise.resolve({address: '5FyJZtpz7W1ugKXsrQxYGfawYymCL3VhprqgrNxqEVwSRYR1' })
export const getAllMetadata = () => Promise.resolve([]);
export const createAccountSuri = () => Promise.resolve();
