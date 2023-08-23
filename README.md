# blocklens-evm-decoder

## Requirement

- node: v14.17.0

## Running application

- `install packages`

```sh
   npm i
```

- Create `.env` from `.env.example` file

```sh
    touch .env
    cp .env.example .env
```

- Run seeder

```sh
   npm run build
   node dist/command.js seeder
```

- Start service

```sh
    npm run start:dev
```

## Running Persistent-stack dev with docker

Please refer: `Blocklens-users`

## Supported networks

- Binance smart chain (BSC_TESTNET, BSC_MAINNET)
- Ethereum (ETHEREUM_GOERLI, ETHEREUM_MAINNET)
- Polygon (POLYGON_MUMBAI, POLYGON_MAINNET)
