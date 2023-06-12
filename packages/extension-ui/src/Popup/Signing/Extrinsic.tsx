// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call, WeightV2} from '@polkadot/types/interfaces';
import type { Codec, SignerPayloadJSON } from '@polkadot/types/types';

import BigNumber from "bignumber.js";
import React, { useMemo } from 'react';
import styled from "styled-components";

import { formatNumber } from "@polkadot/util";

import helpIcon from '../../assets/help.svg';
import { Svg, Table } from '../../components';
import useMetadata from '../../hooks/useMetadata';
import useTranslation from '../../hooks/useTranslation';
import ExtrinsicTooltip from './Tooltip';

type Props = {
  className?: string;
  requestPayload: SignerPayloadJSON;
  url: string;
}

function Extrinsic({
  className,
  requestPayload,
  url
}: Props) {
  const { t } = useTranslation();
  const chain = useMetadata(requestPayload.genesisHash);
  const chainRegistry = chain?.registry;
  const transactionDetails = useMemo(() => {
    if (!chainRegistry) {
      return undefined;
    }

    const payloadType = chainRegistry.createType('ExtrinsicPayload', requestPayload, {
      version: requestPayload.version,
    });

    const method = payloadType.method.toString();

    const call = chainRegistry.createType('Call', method);

    return formatCall(call);
  }, [requestPayload, chainRegistry]);

  return (
    <FullWidthTable className={className}>
      <tr>
        <td className='label'>{t<string>('from')}</td>
        <div className='separator'></div>
        <td className='from'>{url}</td>
      </tr>
      <tr>
        <td className='label'>
          {t<string>('nonce')}&nbsp;
          <ExtrinsicTooltip content='The overall, lifetime transaction count of your account.'>
            <Svg
              className='help-icon'
              src={helpIcon}
            />
          </ExtrinsicTooltip>
        </td>
        <div className='separator'></div>
        <td className='data'>{formatNumber(Number(requestPayload.nonce))}</td>
      </tr>
      {transactionDetails && (Array.isArray(transactionDetails) ?
        transactionDetails.map((batchTransactionDetails, i) => (
          <>
            <BatchRow key={i}>
              <div className='separator'></div>
              <HeaderCell className='label'>{t<string>('Batched transaction')} {i + 1}/{transactionDetails.length}</HeaderCell>
              <div className='separator'></div>
            </BatchRow>
            <CallDefinitionRows {...batchTransactionDetails} />
          </>
        )) :
        <CallDefinitionRows {...transactionDetails} />
      )}
    </FullWidthTable>
  );
}

export default Extrinsic;

const EllipsisCell = styled.td``;

const FullWidthTable = styled(Table)`
  width: 100%;
  
  ${EllipsisCell} { /* Styles declared as a descendant of the <Table> in order to override the intrusive <Table> styles */
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const HeaderCell = styled.td`
  white-space: nowrap;
`;

const BatchRow = styled.tr`
  margin-top: 40px;
`;

const CallDefinitionRows = (props: { section: string, method: string, args: { name: string, value?: Renderable }[], docs?: string[]}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        <td className='label'>{t<string>('Section')}</td>
        <div className='separator'></div>
        <EllipsisCell className='data'>{props.section}</EllipsisCell>
      </tr>
      <tr>
        <td className='label'>{t<string>('Method')}</td>
        <div className='separator'></div>
        <EllipsisCell className='data'>{props.method}</EllipsisCell>
      </tr>
      {props.args?.length && (
        <tr>
          <div className='separator'></div>
          <HeaderCell className='label'>{t<string>('Arguments')}</HeaderCell>
          <div className='separator'></div>
        </tr>
      )}
      {props.args.map((arg) => (
        <tr key={arg.name}>
          <td className='label'>{arg.name}</td>
          <div className='separator'></div>
          <EllipsisCell className='data'>{arg.value ?? '-'}</EllipsisCell>
        </tr>
      ))}
    </>
  );
};

/**
 * Returns call details for a singular call and an array of call details for a batch.
 */
const formatCall = (call: Call) => {
  const isBatch = call.args[0]?.toRawType().startsWith('Vec<Call>');

  if (isBatch) {
    return (call.args[0] as unknown as Call[]).map((callFromBatch: Call) => ({
      section: callFromBatch.section,
      method: callFromBatch.method,
      args: formatCallArgs(callFromBatch),
      docs: getCallDocs(callFromBatch),
    }));
  }

  return {
    section: call.section,
    method: call.method,
    args: formatCallArgs(call),
    docs: getCallDocs(call),
  };
};

const formatCallArgs = (call: Call) =>
  call.meta.args.flatMap((argMeta, i) => {
    const argName = argMeta.name.toHuman();

    try {
      const value = call.args[i];

      // We're not displaying a transaction parameter without an argument passed to the transaction
      if (value.isEmpty) {
        return [];
      }

      const argType = argMeta.typeName.toString();
      const formatter = formatters[argType] || defaultFormatter;

      return [{ name: argName, value: formatter(value) }];
    } catch (e) {
      console.error(`Failed argument "${argName}" decoding:`, e);

      // In the case of an unlikely argument decoding error, for clarity we still want to display that this argument exists
      return [{ name: argName }];
    }
  });

type Renderable = string | number;

/**
 * Formatters turn call arguments into renderable values.
 */
const formatters: { [typeName: string]: (value: Codec) => Renderable } = {
  AccountIdLookupOf: (value) => value.toString(),
  BalanceOf: (value) => toBaseUnit(value),
  Balance: (value) => toBaseUnit(value),
  // Just "refTime" from weight matters, because the other value: "proofSize" is only applicable for parachains
  Weight: (value) => toBaseUnit((value as WeightV2).refTime, 6),
  Bytes: (value) => value.toString(),
};

const toBaseUnit = (value: Codec, precision = 2) => new BigNumber(value.toString()).div(10**12).toFixed(precision);

const defaultFormatter = (value: Codec) => value.toString();

/**
 * "Humanized" docs from `meta` is represented in an array of lines of a documentation.
 */
const getCallDocs = (call: Call) => call.meta.docs.toHuman() as string[] | undefined;
