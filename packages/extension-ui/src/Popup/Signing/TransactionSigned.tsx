// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';

import animSigned from '../../assets/anim_signed.svg';
import { Svg } from '../../components';
import { ActionContext } from '../../components/contexts';
import useTranslation from '../../hooks/useTranslation';

interface Props extends ThemeProps {
  className?: string;
}

function TransactionSigned({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  useEffect(() => {
    setTimeout(() => {
      onAction('/');
    }, 3000);
  }, [onAction]);

  return (
    <div className={className}>
      <div className='content'>
        <Svg
          className='icon'
          src={animSigned}
        />
        {t<string>('Transaction Signed')}
      </div>
    </div>
  );
}

export default React.memo(
  styled(TransactionSigned)(
    ({ theme }: Props) => `
    border-radius: 32px;
    // due to Main padding 16px;
    margin: 0 -8px;

    .content {
      outline: ${theme.successBackground} solid 37px;
      border-radius: 32px;
      height: calc(100vh - 16px);
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
    
    .icon {
      background: ${theme.successBackground};
      width: 96px;
      height: 96px;
    }
  `
  )
);
