import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDWEW3HL6QNYT75IYAR6RIS4ALEINBUI4TMIXMDX6ZVFYQOQRA43SO3V",
  }
} as const


export interface Event {
  creator: string;
  description: string;
  id: u32;
  image_url: string;
  max_supply: u32;
  minted_count: u32;
  name: string;
  secret: string;
}


export interface EventPublicDetails {
  creator: string;
  description: string;
  id: u32;
  image_url: string;
  max_supply: u32;
  minted_count: u32;
  name: string;
}


export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_event: ({creator, name, description, image_url, max_supply, secret}: {creator: string, name: string, description: string, image_url: string, max_supply: u32, secret: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a claim_poap transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_poap: ({to, event_id, provided_secret}: {to: string, event_id: u32, provided_secret: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_event: ({event_id}: {event_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<EventPublicDetails>>

  /**
   * Construct and simulate a has_claimed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_claimed: ({event_id, addr}: {event_id: u32, addr: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABUV2ZW50AAAAAAAACAAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAKbWF4X3N1cHBseQAAAAAABAAAAAAAAAAMbWludGVkX2NvdW50AAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAABnNlY3JldAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAEkV2ZW50UHVibGljRGV0YWlscwAAAAAABwAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAKbWF4X3N1cHBseQAAAAAABAAAAAAAAAAMbWludGVkX2NvdW50AAAABAAAAAAAAAAEbmFtZQAAABA=",
        "AAAABQAAADNFbWl0dGVkIHdoZW5ldmVyIHNvbWVvbmUgc3VjY2Vzc2Z1bGx5IGNsYWltcyBhIFBPQVAAAAAAAAAAAAxDbGFpbWVkRXZlbnQAAAABAAAADWNsYWltZWRfZXZlbnQAAAAAAAACAAAAAAAAAAhldmVudF9pZAAAAAQAAAAAAAAAAAAAAAdjbGFpbWVyAAAAABMAAAAAAAAAAg==",
        "AAAAAAAAAAAAAAAEaW5pdAAAAAAAAAAA",
        "AAAAAAAAAAAAAAAMY3JlYXRlX2V2ZW50AAAABgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAARuYW1lAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAKbWF4X3N1cHBseQAAAAAABAAAAAAAAAAGc2VjcmV0AAAAAAAQAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAKY2xhaW1fcG9hcAAAAAAAAwAAAAAAAAACdG8AAAAAABMAAAAAAAAACGV2ZW50X2lkAAAABAAAAAAAAAAPcHJvdmlkZWRfc2VjcmV0AAAAABAAAAAA",
        "AAAAAAAAAAAAAAAJZ2V0X2V2ZW50AAAAAAAAAQAAAAAAAAAIZXZlbnRfaWQAAAAEAAAAAQAAB9AAAAASRXZlbnRQdWJsaWNEZXRhaWxzAAA=",
        "AAAAAAAAAAAAAAALaGFzX2NsYWltZWQAAAAAAgAAAAAAAAAIZXZlbnRfaWQAAAAEAAAAAAAAAARhZGRyAAAAEwAAAAEAAAAB" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        create_event: this.txFromJSON<u32>,
        claim_poap: this.txFromJSON<null>,
        get_event: this.txFromJSON<EventPublicDetails>,
        has_claimed: this.txFromJSON<boolean>
  }
}