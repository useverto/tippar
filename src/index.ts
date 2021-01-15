import Arweave from "arweave";
import { readContract, selectWeightedPstHolder } from "smartweave";
import { tx } from "ar-gql";

export async function chooseRecipient(
  client: Arweave,
  contract: string,
  mode?: string
): Promise<any> {
  const state = await readContract(client, contract);
  let balances: {
    [key: string]: number;
  } = state.balances;
  const vault = state.vault;
  let chosenRecipient: string;

  // Add the liquid balance and the vault balances
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

  if (!mode || mode === "weightedRandom") {
    // Default to weighted random
    chosenRecipient = selectWeightedPstHolder(balances);
  } else if (mode === "greatest") {
    // Choose greatest token holder
    balances = Object.fromEntries(
      Object.entries(balances).sort(([, a], [, b]) => b - a)
    );
    chosenRecipient = Object.keys(balances)[0];
  } else {
    throw new Error("There was a problem parsing the chooseRecipient mode");
  }

  // Check if chosen holder is a contract or wallet
  const transactionResponse = await tx(chosenRecipient);

  if (transactionResponse !== null) {
    // Chosen user might be a SmartWeave Contract
    let swContract: boolean = false;
    transactionResponse.tags.forEach((tag) => {
      if (tag.name === "App-Name" && tag.value === "SmartWeaveContract")
        swContract = true;
    });

    if (swContract) {
      // Is SW Contract => Find new recipient inside new contract
      try {
        chosenRecipient = await chooseRecipient(client, chosenRecipient, mode);
      } catch (err) {
        throw new Error(err);
      }
    } else {
      // Not SW Contract => Find new recipient for given contract
      try {
        chosenRecipient = await chooseRecipient(client, contract, mode);
      } catch (err) {
        throw new Error(err);
      }
    }
  }
  return chosenRecipient;
}
