// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { FocusEvent } from 'react';
import styled, { css } from 'styled-components';

interface Props extends ThemeProps {
  withError?: boolean;
}

const TextInput = css(
  ({ theme, withError }: Props) => `
  background: ${theme.inputBackground};
  border-radius: 2px;
  border: 1px solid ${theme.inputBorderColor};
  border-color: ${withError ? theme.errorBorderColor : theme.inputBorderColor};
  box-sizing: border-box;
  color: ${withError ? theme.errorColor : theme.textColor};
  display: block;
  font-family: ${theme.primaryFontFamily};
  font-size: ${theme.fontSize};
  height: 56px;
  outline: none;
  padding-left: 15px;
  resize: none;
  width: 100%;
  transition: 0.2s ease;

  &:read-only {
    background: ${theme.inputBorderColor};
    box-shadow: none;
    outline: none;
  }

  &:focus {
    border-color: ${withError ? theme.iconDangerColor : theme.inputFocusBorderColor};
    caret-color: ${withError ? theme.iconDangerColor : theme.inputFocusBorderColor};
  }

  &:hover:not(:disabled):not(:active):not(:focus) {
    border-color: ${withError ? theme.errorBorderColor : theme.inputFocusHoverColor};
  }

  &:disabled {
      background: ${theme.inputBackground};
  }
`
);

const scrollIntoViewCenter = (event: FocusEvent<HTMLElement>) => event.target.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
});

export const TextArea = styled.textarea.attrs({
  onFocus: scrollIntoViewCenter
})<Props>`${TextInput}`;

export const Input = styled.input.attrs({
  onFocus: scrollIntoViewCenter
})<Props>`${TextInput}`;
