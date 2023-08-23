# create databases
CREATE DATABASE IF NOT EXISTS `bsc-testnet-indexing`;
CREATE DATABASE IF NOT EXISTS `eth-goerli-indexing`;
CREATE DATABASE IF NOT EXISTS `bsc-mainnet-indexing`;
CREATE DATABASE IF NOT EXISTS `eth-mainnet-indexing`;
CREATE DATABASE IF NOT EXISTS `polygon-mainnet-indexing`;
CREATE DATABASE IF NOT EXISTS `polygon-mumbai-indexing`;

CREATE DATABASE IF NOT EXISTS `bsc-testnet-abi-decoder`;
CREATE DATABASE IF NOT EXISTS `eth-goerli-abi-decoder`;
CREATE DATABASE IF NOT EXISTS `bsc-mainnet-abi-decoder`;
CREATE DATABASE IF NOT EXISTS `eth-mainnet-abi-decoder`;
CREATE DATABASE IF NOT EXISTS `polygon-mainnet-abi-decoder`;
CREATE DATABASE IF NOT EXISTS `polygon-mumbai-abi-decoder`;

GRANT ALL PRIVILEGES ON *.* TO 'blocklens'@'%';
