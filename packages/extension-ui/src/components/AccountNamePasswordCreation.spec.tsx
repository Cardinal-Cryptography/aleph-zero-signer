// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { ReactWrapper } from 'enzyme';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { ThemeProvider } from 'styled-components';

import { themes } from '../components';
import { flushAllPromises } from '../testHelpers';
import { AccountNamePasswordCreation, BackButton, Button, Input, InputWithLabel } from '.';

// For this file, there are a lot of them
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

const account = {
  name: 'My Polkadot Account',
  password: 'Alice has a cat'
};

const buttonLabel = 'Create';

let wrapper: ReactWrapper;
const onBackClick = jest.fn();
const onCreate = jest.fn();

const type = async (input: ReactWrapper, value: string): Promise<void> => {
  input.simulate('change', { target: { value } });
  await act(flushAllPromises);
  wrapper.update();
};

const capsLockOn = async (input: ReactWrapper): Promise<void> => {
  input.simulate('keyDown', { getModifierState: () => true });
  await act(flushAllPromises);
  wrapper.update();
};

const enterName = (name: string): Promise<void> => type(wrapper.find('input').first(), name);
const password = (password: string) => (): Promise<void> =>
  type(wrapper.find('input[type="password"]').first(), password);
const repeat = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').last(), password);
const findVisiblePasswordMessages = () => wrapper.find('PasswordFeedback').find({ in: true }).find('Message');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const mountComponent = (isBusy = false): ReactWrapper =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  mount(
    <ThemeProvider theme={themes.dark}>
      <AccountNamePasswordCreation
        address={null}
        buttonLabel={buttonLabel}
        genesisHash={null}
        isBusy={isBusy}
        isDeriving={false}
        onBackClick={onBackClick}
        onCreate={onCreate}
        setGenesis={console.log}
      />
    </ThemeProvider>
  );

describe('AccountNamePasswordCreation', () => {
  beforeEach(async () => {
    wrapper = mountComponent();
    await act(flushAllPromises);
    wrapper.update();
  });

  it('next step button has the correct label', () => {
    expect(wrapper.find(Button).last().text()).toBe('Create');
  });

  it('back button calls onBackClick', () => {
    wrapper.find(BackButton).simulate('click');
    expect(onBackClick).toHaveBeenCalledTimes(1);
  });

  it('input should not be highlighted as error until first interaction', () => {
    expect(wrapper.find(InputWithLabel).find('[data-input-name]').find(Input).prop('withError')).toBe(false);
  });

  it('input should keep showing error when something has been typed but then erased', async () => {
    await enterName(account.name);
    await enterName('');
    expect(wrapper.find(InputWithLabel).find('[data-input-name]').find(Input).prop('withError')).toBe(true);
  });

  it('password with caps lock should show a warning', async () => {
    await enterName('Alice').then(password('Alice has a cat'));
    await capsLockOn(wrapper.find(InputWithLabel).find('[data-input-password]').find(Input));

    expect(findVisiblePasswordMessages().find({ messageType: 'warning' }).text()).toBe('CapsLock is ON');
  });

  it('has form with submit button', () => {
    const submitButton = wrapper.find('button[type="submit"]');
    const form = wrapper.find('form');

    expect(form.props().id).toBeTruthy();
    expect(submitButton.props().form).toBe(form.props().id);
  });

  it('submit button is not enabled until both passwords are equal', async () => {
    await enterName('abc').then(password('Alice has a cat')).then(repeat('Not Alice has a cat'));
    expect(wrapper.find({ children: 'Passwords do not match.' }).length).toBeGreaterThan(0);
    expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]').find(Input).prop('withError')).toBe(true);
    expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(true);
  });

  it('submit button is enabled when both passwords are equal', async () => {
    await enterName('abc').then(password('Alice has a cat')).then(repeat('Alice has a cat'));
    expect(
      wrapper.findWhere((node) => node.prop('in') === true && node.prop('messageType') === 'critical')
    ).toHaveLength(0);
    expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]').find(Input).prop('withError')).toBe(false);
    expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(false);
  });

  it('calls onCreate with provided name and password', async () => {
    await enterName(account.name).then(password(account.password)).then(repeat(account.password));
    wrapper.find('form').simulate('submit');
    await act(flushAllPromises);

    expect(onCreate).toBeCalledWith(account.name, account.password);
  });

  describe('All fields are filled correctly, but then', () => {
    beforeEach(async () => {
      await enterName(account.name).then(password(account.password)).then(repeat(account.password));
    });

    it('first password changes - button is disabled', async () => {
      await type(wrapper.find('input[type="password"]').first(), 'Not Alice has a cat');
      expect(wrapper.find({ children: 'Passwords do not match.' }).length).toBeGreaterThan(0);
      expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(true);
    });

    it('first password changes, then second changes too - button is enabled', async () => {
      await type(wrapper.find('input[type="password"]').first(), 'Alice has a cat');
      await type(wrapper.find('input[type="password"]').last(), 'Alice has a cat');
      expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(false);
    });

    it('second password changes, then first changes too - button is enabled', async () => {
      await type(wrapper.find('input[type="password"]').last(), 'Alice has a cat');
      await type(wrapper.find('input[type="password"]').first(), 'Alice has a cat');
      expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(false);
    });

    it('name is removed - button is disabled', async () => {
      await enterName('');
      expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(true);
    });
  });
});
