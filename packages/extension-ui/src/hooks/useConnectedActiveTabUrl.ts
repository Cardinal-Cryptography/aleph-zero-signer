import { useEffect, useState } from 'react';

import { getConnectedTabsUrl } from '../messaging';

export default () => {
  const [connectedActiveTabUrl, setConnectedActiveTabUrl] = useState<string | undefined>();

  useEffect(() => {
    getConnectedTabsUrl()
      .then(setConnectedActiveTabUrl)
      .catch(console.error);
  }, []);

  return connectedActiveTabUrl;
};
