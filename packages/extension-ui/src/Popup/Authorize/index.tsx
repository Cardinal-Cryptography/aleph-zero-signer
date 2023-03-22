// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useContext } from 'react';
import styled from 'styled-components';

import { AccountContext, AuthorizeReqContext, BottomWrapper, Checkbox, PopupBorderContainer } from '../../components';
import Account from '../Accounts/Account';
import Request from './Request';

interface Props extends ThemeProps {
  className?: string;
}

const StyledPopupBorderContainer = styled(PopupBorderContainer)`

  padding: 0px -16px;

  ::-webkit-scrollbar-thumb {
    border-radius: 50px;  
    width: 2px;  
    border-right: 2px solid #111B24;
  }

  ::-webkit-scrollbar {
    width: 4px;
  }

  ${BottomWrapper} {
    position: sticky;
    bottom: 9px;
    width: 100vw;
    margin-left: -36px;
  }
`;

function Authorize({ className = '' }: Props): React.ReactElement {
  const requests = useContext(AuthorizeReqContext);
  const { accounts } = useContext(AccountContext);
  const classes = [requests.length === 1 ? 'lastRequest' : null, !accounts.length ? 'warning-outline' : null]
    .filter(Boolean)
    .join(' ');

  return (
    <StyledPopupBorderContainer>
      <div className={`${className} ${classes}`}>
        {requests.map(
          ({ id, request, url }, index): React.ReactNode => (
            <Request
              authId={id}
              className='request'
              isFirst={index === 0}
              key={id}
              request={request}
              url={url}
            />
          )
        )}
      </div>
    </StyledPopupBorderContainer>
  );
}

export default styled(Authorize)(
  ({ theme }: Props) => `

.border {
  height: 1px;
  width: 100vw;
  margin-left: -16px;
  border:  8px solid ${theme.newTransactionBackground};
  background: ${theme.newTransactionBackground};
}

.top {
  position: absolute;
  top: 0;
  margin-top: -5px;
}

.bottom {
  position: absolute;
  bottom: 0;
}

  outline:  37px solid ${theme.newTransactionBackground};
  border-radius: 32px;
  height: 584px;
  margin-top: 8px;
  overflow-y: scroll;
  overflow-x: hidden;

  ::-webkit-scrollbar-thumb {
    background:${theme.boxBorderColor};
    border-radius: 50px;  
    width: 2px;  
    border-right: 2px solid #111B24;
  }

  ::-webkit-scrollbar {
    width: 4px;
  }

  ${Account} {
    padding: 0px 4px;
    
    ${Checkbox} {
      margin-left: 8px;
    }
  }

  &.lastRequest {
    overflow-y: scroll;

    ::-webkit-scrollbar-thumb {
      background:${theme.boxBorderColor};
      border-radius: 50px;  
      width: 2px;  
      border-right: 2px solid #111B24;
    }
  
    ::-webkit-scrollbar {
      width: 4px;
    }
  }

  && {
    padding: 0;
  }

  .request {
    padding: 0 24px;
  }

  &.warning-outline {
    outline:  37px solid ${theme.warningColor};
  }
`
);
