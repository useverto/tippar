import Arweave from "arweave";
import { readContract, selectWeightedPstHolder } from "smartweave";

const client = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false,
});

export async function chooseRecipient(
  client: Arweave,
  contract: string,
  mode?: string
): Promise<any> {
  const state = await readContract(client, contract);
  const balances = state.balances;
  const vault = state.vault;

  for (const addr of Object.keys(vault)) {
    if (!vault[addr].length) continue;

    const vaultBalance = vault[addr]
      .map((a: { balance: any }) => a.balance)
      .reduce((a: any, b: any) => a + b, 0);
    if (addr in balances) {
      balances[addr] += vaultBalance;
    } else {
      balances[addr] = vaultBalance;
    }
  }

  let chosenWallet: string = "";

  if (!mode || mode === "weightedRandom") {
    // Default to weighted random
  } else if (mode === "greatest") {
    // Choose greatest token holder
  } else {
    throw new Error("There was a problem parsing the chooseRecipient mode");
  }

  const walletBalance = client.wallets.getBalance(chosenWallet);
  // Make sure chosen holder isn't a contract
  return {};
}

chooseRecipient(
  client,
  "usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A",
  "weightedRandom"
);
