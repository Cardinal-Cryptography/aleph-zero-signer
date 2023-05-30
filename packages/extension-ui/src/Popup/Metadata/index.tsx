// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';
import styled from 'styled-components';

import { IconHeader, Loading, MetadataReqContext, OutlineWrapper } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import Request from './Request';

export default function Metadata(): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(MetadataReqContext);

  return (
    <>
      <OutlineWrapper variant='neuter' />
      <StyledIconHeader
        headerText={t('Metadata update')}
        iconType='warning'
      >
        {t('This approval enables future requests to be decoded using this metadata.')}
      </StyledIconHeader>
      {requests[0] ? (
        <Request
          key={requests[0].id}
          metaId={requests[0].id}
          request={requests[0].request}
          url={requests[0].url}
        />
      ) : (
        <Loading />
      )}
    </>
  );
}

const StyledIconHeader = styled(IconHeader)`
  margin: 40px;
`;
