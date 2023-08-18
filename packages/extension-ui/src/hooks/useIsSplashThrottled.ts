import { useEffect, useState } from 'react';

import { localStorageStores } from '@polkadot/extension-base/utils';

const DAY_MS = 1000 * 60 * 60 * 24;

const splashLastShownMsPromise = localStorageStores.splashLastShownMs.get();

const useIsSplashThrottled = () => {
  const [isSplashThrottled, setIsSplashThrottled] = useState<boolean>();

  useEffect(() => {
    splashLastShownMsPromise
      .then((splashLastShownMs) => setIsSplashThrottled(splashLastShownMs + DAY_MS > Date.now()))
      .catch(() => setIsSplashThrottled(false));
  }, []);

  return isSplashThrottled;
};

export default useIsSplashThrottled;
