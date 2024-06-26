// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { ThemeProps } from '../../types';

import React, { useContext } from 'react';
import styled from 'styled-components';

import useRequestsPagination from '@polkadot/extension-ui/hooks/useRequestsPagination';

import { Loading, RequestPagination, ScrollWrapper, SigningReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import Request from './Request';

interface Props extends ThemeProps {
  className?: string;
}

function Signing({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const requests = useContext(SigningReqContext);
  const { index: requestIndex, next, previous, request } = useRequestsPagination(requests);

  const isTransaction = !!(request?.payload as SignerPayloadJSON)?.blockNumber;

  return request ? (
    <>
      <ScrollWrapper className={className}>
        {requests.length > 1 && (
          <div className='centered'>
            <RequestPagination
              index={requestIndex}
              onNextClick={next}
              onPreviousClick={previous}
              pluralName={t<string>('transactions')}
              singularName={t<string>('transaction')}
              totalItems={requests.length}
            />
          </div>
        )}
        {isTransaction && <span className='heading'>{t<string>('Authorization')}</span>}
        <Request
          account={request.account}
          buttonText={isTransaction ? t('Sign') : t('Sign the message')}
          isFirst={requestIndex === 0}
          isLast={requests.length === 1}
          key={request.id}
          requestPayload={request.payload}
          signId={request.id}
          url={request.url}
        />
      </ScrollWrapper>
    </>
  ) : (
    <Loading />
  );
}

export default React.memo(
  styled(Signing)(
    ({ theme }: Props) => `
    .centered {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .heading {
      padding-top: 10px;
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
      margin: 8px 0px 4px 0px;
    }
  `
  )
);
