// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  className?: string;
  isFull?: boolean;
}

function Table({ children, className = '', isFull }: Props): React.ReactElement<Props> {
  return (
    <table className={`${className} ${isFull ? 'isFull' : ''}`}>
      <tbody>{children}</tbody>
    </table>
  );
}

export default React.memo(
  styled(Table)(
    ({ theme }: ThemeProps) => `
  border: 0;
  display: block;
  font-size: ${theme.labelFontSize};
  line-height: ${theme.labelLineHeight};
  margin-bottom: 1rem;
  padding: 0px 8px;

  &.isFull {
    height: 100%;
    overflow: auto;
  }

  tr {
    display: flex;
    width: 312px;
    max-height: 34px;
    border-bottom: 1px solid ${theme.boxBorderColor};
    flex-direction: row;
    gap: 8px;
    padding: 6px 4px 8px;
  }

  td.label {
    text-align: left;
    vertical-align: top;
    white-space: nowrap;
    font-style: normal;
    font-weight: 300;
    font-size: 14px;
    line-height: 145%;
    display: flex;
    align-items: center;
    letter-spacing: 0.07em;
    color: ${theme.subTextColor};
    text-transform: capitalize;
    width: 102px;

  }

  td.data {
    min-width: 0;
    text-overflow: ellipsis;
    font-weight: 300;
    font-size: 14px;
    line-height: 145%;
    text-align: right;


    text-align: right;
    letter-spacing: 0.07em;
    width: 194px;

    white-space:nowrap;
    overflow: hidden;
  }

  details {
    cursor: pointer;
    max-width: 24rem;

    summary {
      text-overflow: ellipsis;
      outline: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    &[open] summary {
      white-space: normal;
    }
  }
`
  )
);
