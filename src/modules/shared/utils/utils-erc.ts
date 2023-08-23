import * as _ from 'lodash';

// ERC721 refer https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
export const ERC721_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const isErc721TransferEvent = (topics: string[]) => {
  return topics[0] === ERC721_TRANSFER_TOPIC && topics.length === 4;
};

export const extractErc721IdsFromEventLogs = (eventLogs) => {
  if (_.isEmpty(eventLogs)) {
    return [];
  }

  const tokenIds: string[] = [];
  for (const log of eventLogs) {
    if (isErc721TransferEvent(log.topics)) {
      log?.dataDecoded[2] && tokenIds.push(log?.dataDecoded[2]?.toString());
    }
  }
  return tokenIds;
};

// ERC1155 refer https://docs.openzeppelin.com/contracts/3.x/api/token/erc1155
export const ERC1155_TRANSFER_SINGLE_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
export const ERC1155_TRANSFER_BATCH_TOPIC = '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb';

export const isErc1155TransferSingleEvent = (topics: string[]) => {
  return topics[0] === ERC1155_TRANSFER_SINGLE_TOPIC;
};

export const isErc1155TransferBatchEvent = (topics: string[]) => {
  return topics[0] === ERC1155_TRANSFER_BATCH_TOPIC;
};

export const extractErc1155IdsFromEventLogs = (eventLogs) => {
  if (_.isEmpty(eventLogs)) {
    return [];
  }

  const tokenIds: string[] = [];
  for (const log of eventLogs) {
    if (isErc1155TransferSingleEvent(log.topics)) {
      log?.dataDecoded[3] && tokenIds.push(log?.dataDecoded[3]?.toString());
    }
    if (isErc1155TransferBatchEvent(log.topics)) {
      log?.dataDecoded[3] && log?.dataDecoded[3].length && tokenIds.concat(Object.values(log?.dataDecoded[3]));
    }
  }
  return tokenIds;
};
