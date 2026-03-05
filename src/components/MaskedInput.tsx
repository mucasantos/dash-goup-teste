import React, { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";

interface MaskedInputProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  [key: string]: unknown;
}

const MaskedInput: React.FC<MaskedInputProps> = ({ mask, value, onChange, ...props }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let maskedValue = '';
    let maskIndex = 0;

    for (let i = 0; i < inputValue.length && maskIndex < mask.length; i++) {
      if (mask[maskIndex] === '9') {
        if (/\d/.test(inputValue[i])) {
          maskedValue += inputValue[i];
          maskIndex++;
        }
      } else {
        maskedValue += mask[maskIndex];
        if (inputValue[i] === mask[maskIndex]) {
          maskIndex++;
        }
      }
    }

    if (inputValue.length < value.length) {
      while (maskIndex > 0 && mask[maskIndex - 1] !== '9') {
        maskIndex--;
      }
      maskedValue = maskedValue.slice(0, maskIndex);
    }

    onChange(maskedValue);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      maxLength={mask.length}
    />
  );
};

export default MaskedInput;
