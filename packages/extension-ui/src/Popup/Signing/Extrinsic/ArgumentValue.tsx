// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

const ArgumentValue = ({ children }: { children: string | number | undefined }) => {
  if (children === undefined) {
    return <>-</>;
  }

  if (isAddress(children)) {
    return (
      <AddressEllipsisContainer>
        <AddressEllipsisLeftPart>{children.slice(0, -4)}</AddressEllipsisLeftPart>
        {children.slice(-4)}
      </AddressEllipsisContainer>
    );
  }

  return <>{children}</>;

};

export default ArgumentValue;

const AddressEllipsisContainer = styled.div`
  display: flex;
`;

const AddressEllipsisLeftPart = styled.div`
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;


const isAddress = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    encodeAddress(isHex(value) ? hexToU8a(value) : decodeAddress(value));

    return true;
  } catch (e) {
    return false;
  }
};