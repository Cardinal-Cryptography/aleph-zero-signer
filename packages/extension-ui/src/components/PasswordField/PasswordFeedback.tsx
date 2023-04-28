// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled, { useTheme } from 'styled-components';

import useTranslation from '../../hooks/useTranslation';
import { isPasswordTooWeak, ValidationResult } from './getFeedback';
import Message from './Message';
import ProgressBar from './ProgressBar';

type Props = {
  className?: string,
  feedback: ValidationResult,
}

function PasswordFeedback({
  className,
  feedback: {score, suggestions, warning},
  feedback,
}: Props): React.ReactElement {
  const { t } = useTranslation();

  const theme = useTheme();
  const scoreToColor = {
    0: theme.errorColor, 1: theme.errorColor, 2: theme.errorColor, 3: theme.warningColor, 4: theme.primaryColor
  };

  const isTooWeak = isPasswordTooWeak(feedback);
  const defaultCriticalMessage = isTooWeak ? t('Password is too weak.') : '';
  const critical = warning || defaultCriticalMessage;

  return (
    <div className={className}>
      <StyleProgressBar
        activeColor={scoreToColor[score]}
        activeStepsCount={score + 1}
        inactiveColor={theme.progressBarInactive}
        stepCount={5}
      />
      {isTooWeak && <StyledMessage messageType='critical'>{critical}</StyledMessage>}
      {isTooWeak && suggestions.map((suggestion, index) => (
        <StyledMessage
          key={index}
          messageType='info'>
          {suggestion}
        </StyledMessage>
      ))}
      {score === 3 && <StyledMessage messageType='warning'>{t("Your password could be stronger!")}</StyledMessage>}
      {score === 4 && <StyledMessage messageType='success'>{t("Awesome! Your password is really strong")}</StyledMessage>}
    </div>
  );
}

const StyledMessage = styled(Message)`
  margin: 0 15px;
  margin-bottom: 8px;
`;

const StyleProgressBar = styled(ProgressBar)`
  margin-bottom: 8px;
`;

export default PasswordFeedback;
