// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled, { useTheme } from 'styled-components';

import useTranslation from '../../hooks/useTranslation';
import { isPasswordTooWeak, ValidationResult } from './getFeedback';
import ProgressBar from './ProgressBar';
import TransitionMessage from './TransitionMessage';

type Props = {
  className?: string,
  feedback: ValidationResult,
  isCapsLockOn?: boolean;
}

function PasswordFeedback({
  className,
  feedback: {score, suggestions, warning},
  feedback,
  isCapsLockOn,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const scoreToColor = {
    0: theme.errorColor, 1: theme.errorColor, 2: theme.errorColor, 3: theme.warningColor, 4: theme.primaryColor
  };

  const isTooWeak = isPasswordTooWeak(feedback);
  const defaultCriticalMessage = isTooWeak ? t('Password is too weak.') : '';
  const criticalMessage = warning || defaultCriticalMessage;
  const duration = 500;

  return (
    <div className={className}>
      <StyleProgressBar
        activeColor={scoreToColor[score]}
        activeStepsCount={score + 1}
        inactiveColor={theme.progressBarInactive}
        stepCount={5}
      />
      <StyledTransitionMessage
        duration={duration}
        messageType='success'
        show={score === 4}
        text={t("Awesome! Your password is really strong")}
      />
      <StyledTransitionMessage
        duration={duration}
        messageType='critical'
        show={isTooWeak}
        text={criticalMessage}
      />
      <StyledTransitionMessage
        duration={duration}
        messageType='warning'
        show={score === 3}
        text={t("Your password could be stronger!")}
      />
      <StyledTransitionMessage
        duration={duration}
        messageType='warning'
        show={!!isCapsLockOn}
        text={t('CapsLock is ON')}
      />
      {suggestions.map((suggestion, index) => (
        <StyledTransitionMessage
          duration={duration}
          key={index}
          messageType='info'
          show={!!suggestion}
          text={typeof suggestion === 'string' ? suggestion : ''}
        />
      ))}
    </div>
  );
}

const StyledTransitionMessage = styled(TransitionMessage)`
  margin: 0 15px;
`;

const StyleProgressBar = styled(ProgressBar)`
  margin-bottom: 8px;
`;


export default PasswordFeedback;
