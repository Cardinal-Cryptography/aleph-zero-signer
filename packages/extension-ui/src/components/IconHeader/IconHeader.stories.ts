// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Meta, StoryObj } from '@storybook/react';

import IconHeader from './IconHeader';

const meta = {
  component: IconHeader,
  argTypes: {
    className: {
      table: {
        disable: true
      }
    }
  },
  args: {
    iconType: 'aleph',
    headerText: 'Add your title here',
    children: 'Optional description here. I can be much longer than title'
  }
} satisfies Meta<typeof IconHeader>;

export default meta;

export const Story: StoryObj<typeof IconHeader> = {
  args: {}
};
