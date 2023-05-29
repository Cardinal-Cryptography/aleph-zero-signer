// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { View } from '../components';
import Popup from '.';

const PopupWrapper = ({ initialPath }: { initialPath: string }) => (
  <View>
    <MemoryRouter initialEntries={[initialPath]}>
      <Popup />
    </MemoryRouter>
  </View>
);

export default {
  component: PopupWrapper,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Popup>;

type Story = StoryObj<typeof Popup>;

export const Metadata: Story = {
  args: {
    initialPath: '/'
  }
};

export const CreateAccount: Story = {
  args: {
    initialPath: '/account/create'
  }
};
