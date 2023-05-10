// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-return */

import '@polkadot/extension-mocks/chrome';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ComponentType, configure, FunctionComponent, mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { AccountNamePasswordCreation, ActionContext, Button, themes } from '../../components';
import * as messaging from '../../messaging';
import HeaderWithSteps from '../../partials/HeaderWithSteps';
import { flushAllPromises } from '../../testHelpers';
import CreateAccount from '../CreateAccount/index';
import SafetyFirst from './SafetyFirst';
import SaveMnemonic from './SaveMnemonic';

// For this file, there are a lot of them
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

describe('Create Account', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;

  const exampleAccount = {
    address: 'HjoBp62cvsWDA3vtNMWxz6c9q13ReEHi9UGHK7JbZweH5g5',
    seed: 'inspire super mention escape kid voice girl discover cheese funny inject obvious'
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const mountComponent = (): ReactWrapper =>
    mount(
      <ActionContext.Provider value={onActionStub}>
        <Router>
          <ThemeProvider theme={themes.dark}>
            <CreateAccount />
          </ThemeProvider>
        </Router>
      </ActionContext.Provider>
    );

  describe('CreateAccount component', () => {
    const clickNext = () => wrapper.findWhere(
      (node) => node.type() === 'button' && node.text() === 'Next'
    ).simulate('click');

    const clickBack = () => wrapper.findWhere(
      (node) => node.type() === 'button' && !!node.find('.arrowLeft').length
    ).simulate('click');

    const isRendered = <T,>(statelessComponent: FunctionComponent<T>) => expect(wrapper.find(statelessComponent).exists()).toBeTruthy();
    const isUnmounted = <T,>(statelessComponent: FunctionComponent<T>) => expect(wrapper.find(statelessComponent).exists()).toBeFalsy();

    beforeEach(async () => {
      onActionStub = jest.fn();
      jest.spyOn(messaging, 'createSeed').mockResolvedValue(exampleAccount);
      jest.spyOn(messaging, 'createAccountSuri').mockResolvedValue(true);
      wrapper = mountComponent();
      await act(flushAllPromises);
      wrapper.update();
    });
    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });
    it('renders header with steps component when isBusy state is false', () => {
      wrapper.setState({ isBusy: false });

      isRendered(HeaderWithSteps);
    });

    it('renders SafetyFirst component when step is 1', () => {
      wrapper.setState({ step: 1 });

      isRendered(SafetyFirst);
    });

    it('renders SafetyFirst component after clicking back button on step 2', () => {
      isRendered(SafetyFirst);

      clickNext();

      isUnmounted(SafetyFirst);


      clickBack();

      isRendered(SafetyFirst);
    });

    it('renders SaveMnemonic component after clicking next button on step 1', () => {
      clickNext();

      isRendered(SaveMnemonic);
    });

    it('renders SaveMnemonic component after clicking Back button on step 3', () => {
      isUnmounted(SaveMnemonic);

      clickNext();

      isRendered(SaveMnemonic);

      clickNext();

      isUnmounted(SaveMnemonic);

      clickBack();

      isRendered(SaveMnemonic);
    });

    it('renders AccountNamePasswordCreation component after clicking next button on step 2', async () => {
      clickNext();
      clickNext();

      await act(flushAllPromises);

      isRendered(AccountNamePasswordCreation);
    });
  });
});
