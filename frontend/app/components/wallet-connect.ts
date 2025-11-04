"use client";

import { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";

export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  modules: allowAllModules(),
  selectedWalletId: FREIGHTER_ID,
});