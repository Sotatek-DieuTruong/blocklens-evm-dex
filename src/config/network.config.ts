import { registerAs } from '@nestjs/config';

export default registerAs('network', () => ({
  ETH_MAINNET: {
    id: 'ETH_MAINNET',
    name: 'Ethereum',
    chainId: 1,
    networkId: 1,
    chain: 'eth',
    network: 'mainnet',
    rpcUrls: ['http://172.16.199.36:8545'],
    blockExplorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io/',
    },
    blockTime: 15000,
    isCrawlInternalTx: false,
    multicallAddress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    otherRpcUrls: [
      'https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7',
      'https://api.bitstack.com/v1/wNFxbiJyQsSeLrX8RRCHi7NpRxrlErZk/DjShIqLishPCTB9HiMkPHXjUM9CNM9Na/ETH/mainnet',
      'https://yolo-intensive-paper.discover.quiknode.pro/45cad3065a05ccb632980a7ee67dd4cbb470ffbd',
      'https://eth-mainnet.nodereal.io/v1/d007dacd5592449b914ab0bc04398e59',
      'https://rpc.flashbots.net',
      'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
      'https://api.mycryptoapi.com/eth',
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://eth-mainnet.nodereal.io/v1/4ccb1ad61e5a4d469a7bf42ac0f05d3f',
      'https://eth-mainnet.public.blastapi.io',
      'https://eth-mainnet.nodereal.io/v1/62b684b47fe8472ba19d7f5cd15f4b06',
      'https://eth-rpc.gateway.pokt.network',
      'https://eth-mainnet.nodereal.io/v1/60c48f24d28842c49203a7d6412e2a04',
    ],
  }
}));
