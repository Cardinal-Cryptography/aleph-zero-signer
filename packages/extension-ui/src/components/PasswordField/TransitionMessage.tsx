// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';

import Message, { MessageType } from './Message';

type Props = {
  className?: string;
  in: boolean;
  messageType: MessageType;
  text: string;
  duration: number;
};

const TransitionMessage = ({className = '', duration, in: show, messageType, text}: Props) => {
  const nodeRef = useRef(null);
  const [currentText, setCurrentText] = useState<string>();

  useEffect(() => {
    if (text === currentText) {
      return;
    }

    const timeout = currentText ? 150 : 0;

    setTimeout(setCurrentText, timeout, text);
  }, [setCurrentText, currentText, text]);

  const defaultStyle = {
    transition: `grid-template-rows ${duration}ms, opacity ${duration}ms, padding ${duration}ms`,
    opacity: 0,
  };

  const transitionStyles = {
    entering: { opacity: 1, gridTemplateRows: '1fr', paddingBottom: '8px' },
    entered:  { opacity: 1, gridTemplateRows: '1fr', paddingBottom: '8px' },
    exiting:  { opacity: 0, gridTemplateRows: '0fr' },
    exited:  { opacity: 0, gridTemplateRows: '0fr' },
    unmounted: { opacity: 0, gridTemplateRows: '0fr' },
  };

  return (
    <Transition
      appear
      in={show && text === currentText}
      nodeRef={nodeRef}
      timeout={duration}
    >
      {(state) => (
          <Wrapper
            ref={nodeRef}
            style={{...defaultStyle, ...transitionStyles[state]}}
          >
            <StyledMessage
              className={className}
              messageType={messageType}
            >
                {currentText}
            </StyledMessage>
          </Wrapper>
        )}
    </Transition>
  );
};

const Wrapper = styled.div`
  display: grid;
  overflow: hidden;
`;

const StyledMessage = styled(Message)`
  min-height: 0;
`;


export default TransitionMessage;