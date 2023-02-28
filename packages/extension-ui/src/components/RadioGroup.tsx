// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import RadioCard from './RadioCard';

interface Option {
  text: string;
  value: string;
}

interface Props {
  className?: string;
  options: Array<Option>;
  onSelectionChange: (value: string) => void;
  defaultSelectedValue?: string | null;
  withTestNetwork?: boolean;
}

const RadioGroup: React.FC<Props> = ({
  className,
  defaultSelectedValue,
  onSelectionChange,
  options,
  withTestNetwork = false
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultSelectedValue || '');

  const handleChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      onSelectionChange(value);
    },
    [onSelectionChange]
  );

  console.log('options', options);

  const { alephOptions, otherOptions } = options.reduce(
    (acc: { alephOptions: Option[]; otherOptions: Option[] }, option) => {
      const isAleph = withTestNetwork ? option.text.includes('Aleph Zero') : option.text === 'Aleph Zero';

      if (isAleph) {
        acc.alephOptions.push(option);
      } else if (withTestNetwork || !option.text.includes('Aleph Zero')) {
        acc.otherOptions.push(option);
      }

      return acc;
    },
    { alephOptions: [], otherOptions: [] }
  );

  function getPositionForOption(options: Option[], index: number): 'top' | 'bottom' | 'both' | 'middle' {
    if (options.length === 1) {
      return 'both';
    } else if (index === 0) {
      return 'top';
    } else if (index === options.length - 1) {
      return 'bottom';
    } else {
      return 'middle';
    }
  }

  return (
    <div className={className}>
      <div className='aleph-options'>
        {alephOptions.map((option, index) => (
          <div key={option.value}>
            <RadioCard
              onChange={handleChange}
              option={option}
              position={getPositionForOption(alephOptions, index)}
              selectedValue={selectedValue}
            />
          </div>
        ))}
      </div>
      {otherOptions.map((option, index) => (
        <div key={option.value}>
          <RadioCard
            onChange={handleChange}
            option={option}
            position={getPositionForOption(otherOptions, index)}
            selectedValue={selectedValue}
          />
        </div>
      ))}
    </div>
  );
};

export default styled(RadioGroup)`
  .aleph-options {
    margin-bottom: 16px;
  }
`;
