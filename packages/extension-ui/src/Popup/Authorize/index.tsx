// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';

import { AuthorizeReqContext } from '../../components';
import Request from './Request';

function Authorize(): React.ReactElement {
  const requests = useContext(AuthorizeReqContext);

  return (
    <>
      {requests.map(
        ({ id, request, url }, index): React.ReactNode => (
          <Request
            authId={id}
            isFirst={index === 0}
            key={id}
            request={request}
            url={url}
          />
        )
      )}
    </>
  );
}

export default Authorize;
