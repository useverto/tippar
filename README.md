# Tippar

A simple library to select which PST token holder receives a tip. With the addition of SmartWeave contracts being able to custody different types of PSTs, there now needs to be a way for tips to be distributed to contracts in addition to wallets.

## How it works

Tippar chooses token holders from contract(s) in recursion until a wallet is selected. Take note of the following examples:

> A tip needs to be given to a token holder in Contract A

```
Tippar Process:

select holder from contract (A)
if holder === contract (B)
  select new holder from contract (B)
  if new holder === wallet
    return new holder
  else
    ...continue recursion
```

**Real-World Example:**

An ArDrive user is sending a tip to an ArDrive holder. If the random token-holder selected to receive the tip is the Verto Contract, a new token-holder is calculated from the users who hold a balance of VRT. This means that the ArDrive tip will now be sent to the VRT token holder.

## Usage

```shell script
yarn add @verto/tippar
```

#### `chooseRecipient`

```js
async function chooseRecipient(client: Arweave, contract: string, mode?: string): Promise<string>
```

- `client`: Arweave client instance
- `contract`: Profit-Sharing token contract to choose holder from
- `mode?`: Optional parameter for setting type of selection
  - "weightedRandom": Select token holder based on a weighted-random
  - "greatest": Select token holder from the the greatest balance
  - Defaults to "weightedRandom"

**Example:**

```js
import { chooseRecipient } from "@verto/tippar;

async function someUserInteraction() {
  ...
  const tipReceiver = await chooseRecipient(arweaveClient, pstContract);
  console.log(`Wallet of tip receiver: ${tipReceiver}`);
  ...
}
```

## Contributing

Any and all contributions are welcome. Feel free to make a PR with any updates for fixes.
