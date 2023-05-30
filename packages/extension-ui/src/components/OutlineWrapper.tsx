// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import border from '../assets/border.svg';
import { Z_INDEX } from '../zindex';
import Svg from './Svg';

type Variant = 'success' | 'failure' | 'neuter';

type Props = {
  variant: Variant;
};

const OutlineWrapper = ({ variant }: Props) => {
  return (
    <StyledSvg
      $variant={variant}
      src={border}
    />
  );
};

const StyledSvg = styled(Svg)<{ $variant: Variant }>`
  position: absolute;
  inset: 0;
  z-index: ${Z_INDEX.BORDER};
  pointer-events: none;

  background-color: ${({ $variant, theme }) =>
    ({
      success: theme.successBackground,
      failure: theme.errorColor,
      neuter: theme.neuterColor
    }[$variant])};
`;

export default OutlineWrapper;
