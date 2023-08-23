export interface ISwap {
  toTokenAddress?: string;
  fromTokenAddress?: string;
  quantityIn?: number;
  quantityOut?: number;
  exchangeName: string;
  contractVersion: string;
}
