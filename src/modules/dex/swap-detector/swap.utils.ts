import BigNumber from 'bignumber.js';
import { Interface } from '@ethersproject/abi';

export function convertBNIfNeeded(value: any): any {
  if (!value) {
    return '';
  }

  if (BigNumber.isBigNumber(value)) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((v) => convertBNIfNeeded(v));
  }

  return value;
}

export function decode_V2_SWAP_EXACT_IN(input: string) {
  const [recipient, amountIn, amountOutMin, path, payerIsUser] = Interface.getAbiCoder().decode(
    ['address', 'uint256', 'uint256', 'address[]', 'bool'],
    input,
  );

  return {
    command: 'V2_SWAP_EXACT_IN',
    recipient,
    amountIn: amountIn.toString(),
    amountOutMin: amountOutMin.toString(),
    path,
    payerIsUser,
  };
}

export function decode_V2_SWAP_EXACT_OUT(input: string) {
  const [recipient, amountOut, amountInMax, path, payerIsUser] = Interface.getAbiCoder().decode(
    ['address', 'uint256', 'uint256', 'address[]', 'bool'],
    input,
  );

  return {
    command: 'V2_SWAP_EXACT_OUT',
    recipient,
    amountOut: amountOut.toString(),
    amountInMax: amountInMax.toString(),
    path,
    payerIsUser,
  };
}

export function decode_V3_SWAP_EXACT_IN(input: string) {
  const [recipient, amountIn, amountOutMin, path, payerIsUser] = Interface.getAbiCoder().decode(
    ['address', 'uint256', 'uint256', 'bytes', 'bool'],
    input,
  );
  return {
    command: 'V3_SWAP_EXACT_IN',
    recipient,
    amountIn: amountIn.toString(),
    amountOutMin: amountOutMin.toString(),
    path: extractFromByteString(path),
    payerIsUser,
  };
}

export function decode_V3_SWAP_EXACT_OUT(input: string) {
  const [recipient, amountOut, amountInMax, path, payerIsUser] = Interface.getAbiCoder().decode(
    ['address', 'uint256', 'uint256', 'bytes', 'bool'],
    input,
  );

  return {
    command: 'V3_SWAP_EXACT_OUT',
    recipient,
    amountOut: amountOut.toString(),
    amountInMax: amountInMax.toString(),
    path: extractFromByteString(path),
    payerIsUser,
  };
}

const extractFromByteString = (path: string) => {
  const addresses = [];
  const ADDRESS_LENGTH = 40;
  for (let index = 2; index < path.length - ADDRESS_LENGTH; index += ADDRESS_LENGTH + 6) {
    const endOfAddress = index + ADDRESS_LENGTH;
    addresses.push(`0x${path.slice(index, endOfAddress)}`);
  }

  return addresses;
};
