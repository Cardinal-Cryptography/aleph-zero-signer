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

  const alephOptions = withTestNetwork
    ? options.filter((option) => option.text.includes('Aleph Zero'))
    : options.filter((option) => option.text === 'Aleph Zero');
  const otherOptions = options.filter((option) => !option.text.includes('Aleph Zero'));

  return (
    <div className={className}>
      <div className='aleph-options'>
        {alephOptions.map((option, index) => (
          <div key={option.value}>
            <RadioCard
              onChange={handleChange}
              option={option}
              position={index === 0 ? 'top' : index === options.length - 1 ? 'bottom' : 'middle'}
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
            position={index === 0 ? 'top' : index === options.length - 1 ? 'bottom' : 'middle'}
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
