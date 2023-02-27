// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { ThemeProps } from '../../types';

import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Loading, SigningReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import Request from './Request';

interface Props extends ThemeProps {
  className?: string;
}

function Signing({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const requests = useContext(SigningReqContext);
  const [requestIndex, setRequestIndex] = useState(0);

  useEffect(() => {
    setRequestIndex((requestIndex) => (requestIndex < requests.length ? requestIndex : requests.length - 1));
  }, [requests]);

  // protect against removal overflows/underflows
  const request =
    requests.length !== 0
      ? requestIndex >= 0
        ? requestIndex < requests.length
          ? requests[requestIndex]
          : requests[requests.length - 1]
        : requests[0]
      : null;
  const isTransaction = !!(request?.request?.payload as SignerPayloadJSON)?.blockNumber;

  return request ? (
    <div className={className}>
      <div className='content'>
        {isTransaction && <span className='heading'>{t<string>('New Transaction')}</span>}
        <Request
          account={request.account}
          buttonText={isTransaction ? t('Sign') : t('Sign the message')}
          isFirst={requestIndex === 0}
          request={request.request}
          signId={request.id}
          url={request.url}
        />
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default React.memo(
  styled(Signing)(
    ({ theme }: Props) => `
    border-radius: 32px;
    // due to Main padding 16px;
    margin: 0 -8px;

    .content {
      outline: ${theme.newTransactionBackground} solid 37px;
      border-radius: 32px;
      height: 584px;
      margin-top: 8px;
      overflow-y: hidden;
      overflow-x: hidden;
    }

    .heading {
      font-family: ${theme.secondaryFontFamily};
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 118%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.03em;
      color: ${theme.textColor};
      margin: 16px 0px 8px 0px;
    }
  `
  )
);
