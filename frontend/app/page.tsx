"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

// --- 1. IMPORT YOUR GENERATED CLIENT AND WALLET KIT ---
import { Client, networks } from "@/index";
import { kit } from "./components/wallet-connect";
import EventList from "./components/EventList";
import CreateEvent from "./components/CreateEvent";
import ClaimPoap from "./components/ClaimPoap";
import MyPoaps from "./components/MyPoaps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- 2. CONFIGURE YOUR CONTRACT AND NETWORK ---
const CONTRACT_ID = networks.testnet.contractId;
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;

export default function Home() {
  // Wallet & Client State
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 3. INITIALIZE CLIENT ON WALLET CONNECT ---
  useEffect(() => {
    if (publicKey) {
      const newClient = new Client({
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
        contractId: CONTRACT_ID,
        publicKey: publicKey, // The 'source' account for transactions
        signTransaction: (tx) => kit.signTransaction(tx),
      });
      setClient(newClient);
    }
  }, [publicKey]);

  const handleTransaction = async (promise: Promise<any>, successMessage: string) => {
    setIsLoading(true);
    await toast.promise(promise, {
      loading: 'Processing transaction...',
      success: () => {
        setIsLoading(false);
        return successMessage;
      },
      error: (err) => {
        setIsLoading(false);
        return err.message || 'An error occurred.';
      },
    });
  };

  // --- 5. RENDER THE UI (JSX) ---
  return (
    <div className="flex justify-center min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-center text-blue-400">POAP dApp</h1>
        <p className="text-center text-gray-400 mb-6">Create, claim, and view Proof of Attendance tokens on Soroban.</p>

        {/* --- Connect & Status Panel --- */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <button
            onClick={async () => {
              await kit.openModal({
                onWalletSelected: async (option) => {
                  kit.setWallet(option.id);
                  const { address } = await kit.getAddress();
                  setPublicKey(address);
                  toast.success('Wallet connected!');
                },
              });
            }}
            disabled={isLoading || !!publicKey}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            {publicKey ? "Wallet Connected!" : "Connect Freighter Wallet"}
          </button>

          {publicKey && (
            <p className="text-sm text-center mt-4 text-green-400 break-all">
              {publicKey}
            </p>
          )}
        </div>

        {/* --- Main Content Area --- */}
        {client && publicKey && (
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="my-poaps">My POAPs</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <EventList client={client} />
            </TabsContent>
            <TabsContent value="my-poaps">
              <MyPoaps client={client} publicKey={publicKey} />
            </TabsContent>
            <TabsContent value="actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <CreateEvent 
                  client={client} 
                  publicKey={publicKey} 
                  onTransaction={handleTransaction}
                />
                <ClaimPoap 
                  client={client} 
                  publicKey={publicKey} 
                  onTransaction={handleTransaction}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}