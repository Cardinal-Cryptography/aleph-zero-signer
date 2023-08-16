import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';
import styled, { CSSProperties } from 'styled-components';

import { localStorageStores } from '@polkadot/extension-base/utils';
import { Video } from '@polkadot/extension-ui/components/index';

import useIsSplashThrottled from '../hooks/useIsSplashThrottled';
import { Steps } from '../partials/HeaderWithSteps';
import { Z_INDEX } from '../zindex';
import ScrollWrapper from './ScrollWrapper';

type SplashHandlerProps = {
  className?: string;
  children: ReactNode;
  isSplashShown: boolean;
};

function SplashHandler({
  children,
  className,
  isSplashShown
}: SplashHandlerProps): React.ReactElement<SplashHandlerProps> {
  // Needs this graduality to avoid flashes on rendering contents between video and app
  const [isSplashOn, setIsSplashOn] = useState<boolean>(isSplashShown);
  const [isContentVisible, setIsContentVisible] = useState<boolean>(!isSplashShown);
  const nodeRef = useRef(null);

  const duration = 250;

  const defaultStyle: Partial<CSSProperties> = {
    display: 'block',
    opacity: 1,
    transition: `opacity ${duration}ms ease-out`
  };

  const transitionStyles: Partial<{
    [key in TransitionStatus]: Partial<CSSProperties>;
  }> = {
    entered: { opacity: 1 },
    exited: { display: 'none', opacity: 0 },
    exiting: { opacity: 0 }
  };

  useEffect(() => {
    const setFalseWithErrorLog = (prevIsSplashOn: boolean) => {
      if (prevIsSplashOn) {
        console.error('Fallback timeout needed to turn off splash video.');
      }

      return false;
    };

    const endVideo = () => {
      setIsContentVisible(true);
      setIsSplashOn(setFalseWithErrorLog);
      localStorageStores.splashLastShownMs.set(Date.now());
    };

    const timeoutId = setTimeout(endVideo, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const onEnded = () => {
    setIsSplashOn(false);
    localStorageStores.splashLastShownMs.set(Date.now());
  };

  return (
    <div className={className}>
      <Transition
        in={isSplashOn}
        nodeRef={nodeRef}
        timeout={duration}
      >
        {(state) => (
          <div
            className='splash'
            ref={nodeRef}
            style={{
              ...defaultStyle,
              ...transitionStyles[state]
            }}
          >
            <Video
              onEnded={onEnded}
              onStarted={() => setIsContentVisible(true)}
              source='videos/splash.mp4'
              type='video/mp4'
            />
          </div>
        )}
      </Transition>
      {isContentVisible && children}
    </div>
  );
}

const WrappedSplashHandler = ({ children, className }: Omit<SplashHandlerProps, 'isSplashShown'>) => {
  const isSplashThrottled = useIsSplashThrottled();

  if (isSplashThrottled === undefined) {
    return null;
  }

  return (
    <SplashHandler
      className={className}
      isSplashShown={!isSplashThrottled}
    >
      {children}
    </SplashHandler>
  );
};

export default styled(WrappedSplashHandler)`
  display: flex;
  flex-direction: column;
  height: 100%;

  > *:not(.splash):not(.header):not(${ScrollWrapper}):not(${Steps}) {
    padding-left: 16px;
    padding-right: 16px;
  }

  .splash {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: ${Z_INDEX.SPLASH_HEADER};
  }

  `;
