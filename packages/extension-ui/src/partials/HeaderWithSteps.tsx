// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React from 'react';
import styled from 'styled-components';

import { Z_INDEX } from '../zindex';
import Header from './Header';

interface Props {
  step: number;
  text: string;
  total: number;
  withBackArrow?: boolean;
  withBackdrop?: boolean;
  withMargin?: boolean;
}

interface StepProps extends ThemeProps {
  previous: boolean;
  current: boolean;
  gap: number;
  total: number;
}

const Step = styled.div<StepProps>`
  background-color: ${({ current, previous, theme }: StepProps) =>
    previous ? theme.headerStepDone : current ? theme.headerStepCurrent : theme.headerStepToDo};
  height: 2px;
  width: ${({ total }) => `calc(100%/${total})`};
  display: inline-block;
`;

export const Steps = styled.div<{ withMargin: boolean }>`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ withMargin }) => (withMargin ? '36px' : 0)};
  gap: 8px;
  position: sticky;
  z-index: ${Z_INDEX.HEADER};
  top: 56px;

  :first-child {
    margin-left: 0px;
  }

  :last-child {
    margin-right: 0px;
  }
`;

function HeaderWithSteps({
  step,
  text,
  total,
  withBackArrow = false,
  withMargin = false
}: Props): React.ReactElement<Props> {
  return (
    <>
      <MarginLessHeader
        text={text}
        withBackArrow={withBackArrow}
        withHelp
        withStepper
      ></MarginLessHeader>
      <Steps withMargin={withMargin}>
        {Array.from({ length: total }, (_, i) => (
          <Step
            current={step === i + 1}
            gap={8}
            key={i}
            previous={step > i + 1}
            total={total}
          />
        ))}
      </Steps>
    </>
  );
}

export default React.memo(HeaderWithSteps);

const MarginLessHeader = styled(Header)`
  margin-bottom: 0;
`;
