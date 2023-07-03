// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

const getSafeIndex = (index: number, arrLength: number) => Math.min(index, Math.max(arrLength - 1, 0));

const useRequestsPagination = <T>(requests: Array<T>) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((requestIndex) => Math.min(requestIndex + 1, requests.length));
  const previous = () => setIndex((requestIndex) => Math.max(requestIndex - 1, 0));

  useEffect(() => {
    setIndex((currIndex) => getSafeIndex(currIndex, requests.length));
  }, [requests]);

  const finalIndex = getSafeIndex(index, requests.length);

  return {
    next,
    previous,
    index: finalIndex,
    request: requests[finalIndex]
  };
};

export default useRequestsPagination;
