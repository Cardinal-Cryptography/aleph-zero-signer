// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { getAllMetadata } from '../messaging';
import chains from '../util/chains';
import useTranslation from './useTranslation';

interface Option {
  text: string;
  value: string;
}

interface ChainsAccumulator {
  alephChains: Option[];
  relayChains: Option[];
  otherChains: Option[];
}

const RELAY_CHAIN = 'Relay Chain';
const ALEPH_ZERO = 'Aleph Zero';

export default function (): Option[] {
  const { t } = useTranslation();
  const [metadataChains, setMetadatachains] = useState<Option[]>([]);

  useEffect(() => {
    getAllMetadata()
      .then((metadataDefs) => {
        const res = metadataDefs.map((metadata) => ({ text: metadata.chain, value: metadata.genesisHash }));

        setMetadatachains(res);
      })
      .catch(console.error);
  }, []);

  const hashes = useMemo(() => {
    const { alephChains, otherChains, relayChains } = chains.reduce(
      (acc: ChainsAccumulator, { chain, genesisHash }) => {
        if (chain.includes(ALEPH_ZERO)) {
          acc.alephChains.push({ text: chain, value: genesisHash });
        } else if (chain.includes(RELAY_CHAIN)) {
          acc.relayChains.push({ text: chain, value: genesisHash });
        } else {
          acc.otherChains.push({ text: chain, value: genesisHash });
        }

        return acc;
      },
      { alephChains: [], relayChains: [], otherChains: [] }
    );

    const newChains = [
      ...alephChains,
      { text: t('Allow use on any chain'), value: '' },
      ...relayChains,
      ...otherChains.filter(({ text }) => !text.includes(RELAY_CHAIN) && !text.includes(ALEPH_ZERO))
    ];

    const extraChains = metadataChains.filter(({ value }) => {
      return !chains.find(({ genesisHash }) => genesisHash === value);
    });

    return [...newChains, ...extraChains];
  }, [metadataChains, t]);

  return hashes;
}
