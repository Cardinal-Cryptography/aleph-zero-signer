// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React from 'react';
import styled from 'styled-components';

import dotIcon from '../assets/dot.svg';
import Svg from './Svg';

interface Props {
  className?: string;
  fileName: string;
}

function FileNameDisplay({ className, fileName }: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      <div className='inner'>
        <Svg
          className='icon-dot'
          src={dotIcon}
        />
        <span>{fileName.slice(0, 32)}...</span>
      </div>
    </div>
  );
}

export default styled(FileNameDisplay)(
  ({ theme }: ThemeProps) => `
  border: 1px dashed ${theme.inputFileBorderColor};
  border-radius: 2px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 16px;

  .inner {
    background: ${theme.fileNameBackground};
    border-radius: 2px;
    max-height: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    gap: 2px;

    .icon-dot {
      width: 16px;
      height: 16px;
      background: ${theme.iconNeutralColor};
    }

    span {
      color: ${theme.subTextColor};
      align-self: center;
      white-space: pre-line;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      margin-left: 2px;
      font-weight: 300;
      font-size: 13px;
      line-height: 130%;
      letter-spacing: 0.06em;

    }
  }
  


  
`
);
