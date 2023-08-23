import { AbiItem } from 'web3-utils';
import { Interface } from '@ethersproject/abi';
import { isObject } from 'lodash';
import * as crypto from 'crypto';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createSignature(abi: AbiItem, isIndexed = false): string {
  if (abi.type === 'function') return createSignatureFunction(abi);
  const { name, inputs } = abi;
  return `${name}(${(inputs || [])
    .map(({ type, indexed }) => `${type}${indexed && isIndexed ? ' indexed' : ''}`)
    .join(',')})`;
}

const createSignatureFunction = (abi: AbiItem) => {
  try {
    const iface = new Interface([abi as any]);
    return iface.getFunction(abi.name).format();
  } catch (e) {
    return null;
  }
};

export const formatShortAddress = (address: string, digits = 8): string => {
  if (!address) {
    return '--';
  }
  return `${address.substring(0, digits)}...${address.substring(address.length - 3, address.length)}`;
};

export const autoImport = (module) => {
  return Object.keys(module).map((moduleName) => module[moduleName]);
};

export const removeUnicode = (jsonObj) => {
  const jsonStr = JSON.stringify(jsonObj);
  const myJsonStr = jsonStr.replace(/\\\\u[0-9a-fA-F]{4}/g, '').replace(/\\u[0-9a-fA-F]{4}/g, '');
  let value = {};
  try {
    value = JSON.parse(myJsonStr);
  } catch (error) {
    console.log('========= Parse error', error.message);
    console.log('========= jsonObj', jsonObj);
    console.log('========= myJsonStr', myJsonStr);
  }
  return value;
};

export function createHexHash(payload: any): string {
  let hashPayload = payload;
  if (isObject(payload)) {
    hashPayload = JSON.stringify(hashPayload);
  }
  return crypto.createHash('md5').update(hashPayload).digest('hex').toString();
}
