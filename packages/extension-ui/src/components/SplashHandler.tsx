import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
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
  const [isContentRendered, setIsContentRendered] = useState<boolean>(!isSplashShown);

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

  const showContent = useCallback(() => {
    setIsContentRendered(true);
    setIsSplashOn(false);
  }, []);

  useEffect(() => {
    const endVideoAndLogError = () => {
      if (isSplashOn) {
        console.error('Fallback timeout needed to turn off splash video.');
        localStorageStores.splashLastShownMs.set(Date.now());
      }

      showContent();
    };

    const timeoutId = setTimeout(endVideoAndLogError, 2000);

    return () => clearTimeout(timeoutId);
  }, [isSplashOn, showContent]);

  const onVideoEnded = () => {
    showContent();
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
              onEnded={onVideoEnded}
              onStarted={() => setIsContentRendered(true)}
              source='videos/splash.mp4'
              type='video/mp4'
            />
          </div>
        )}
      </Transition>
      {isContentRendered && children}
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
