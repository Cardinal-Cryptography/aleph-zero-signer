// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import critical from '../../assets/message-icons/critical.svg';
import info from '../../assets/message-icons/info.svg';
import success from '../../assets/message-icons/success.svg';
import warning from '../../assets/message-icons/warning.svg';

interface Props {
  children: React.ReactNode;
  className?: string;
  messageType: 'critical' | 'warning' | 'info' | 'success';
}

const MESSAGE_TYPE_TO_ICON_URL = {
  critical, warning, info, success
};

function Message({ children, className = '', messageType }: Props): React.ReactElement<Props> {
  return (
    <Container className={className}>
      <Icon src={MESSAGE_TYPE_TO_ICON_URL[messageType]} />
      {children}
    </Container>
  );
}

const Icon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`;

const Container = styled.div`
  display: flex;
  align-items: start;
  line-height: 16px;
`;

export default styled(Message)<Props>`
  color: ${({messageType, theme}) => ({critical: theme.errorColor, warning: theme.warningColor, info: theme.textColor, success: theme.primaryColor})[messageType]};
  font-size: ${({theme}) => theme.labelFontSize};
`;

