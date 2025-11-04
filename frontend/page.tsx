"use client";

import { useState, useEffect } from "react";
import { Buffer } from "buffer";

// --- 1. IMPORT YOUR GENERATED CLIENT ---
// Make sure this path matches where you saved your bindings file
import { Client } from "../lib/soroban-bindings";
import { kit } from "./components/wallet-connect";

// --- 2. CONFIGURE YOUR CONTRACT AND NETWORK ---
const CONTRACT_ID = "CDGMJLYFSGEKLYMB4K22CIJRVUJBJZGPEB7JRLRWQQ7XMV75P2RUO2YY"; // ⚠️ UPDATE THIS
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export default function Home() {
	// Wallet & Client State
	const [publicKey, setPublicKey] = useState<string | null>(null);
	const [client, setClient] = useState<Client | null>(null);

	// UI State
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<string | null>(null);

	// Form Inputs: Admin
	const [initToken, setInitToken] = useState("");
	const [gameId, setGameId] = useState("");
	const [minBet, setMinBet] = useState("");
	const [maxPlayers, setMaxPlayers] = useState("");
	const [resolveResult, setResolveResult] = useState("");

	// Form Inputs: Player
	const [joinGameId, setJoinGameId] = useState("");
	const [joinChoice, setJoinChoice] = useState("0");
	const [joinAmount, setJoinAmount] = useState("");

	// Form Inputs: View
	const [queryGameId, setQueryGameId] = useState("");
	const [potResult, setPotResult] = useState("");

	// --- 3. INITIALIZE CLIENT ON WALLET CONNECT ---

	/**
	 * Once we have a publicKey, initialize the contract client
	 */
	useEffect(() => {
		if (publicKey) {
			const newClient = new Client({
				rpcUrl: RPC_URL,
				networkPassphrase: NETWORK_PASSPHRASE,
				contractId: CONTRACT_ID,
				publicKey: publicKey, // The 'source' account for transactions
			});
			setClient(newClient);
		}
	}, [publicKey]);

	// --- 4. HELPER FUNCTIONS ---

	/**
	 * Resets status messages
	 */
	const clearStatus = () => {
		setError(null);
		setResult(null);
	};

	/**
	 * Converts a string Game ID into a 32-byte buffer
	 */
	const gameIdToBuffer = (id: string): Buffer => {
		if (!id) throw new Error("Game ID cannot be empty");
		// Create a 32-byte buffer
		const buffer = Buffer.alloc(32);
		// Write the string to the buffer. If string is < 32 bytes, rest is null bytes.
		buffer.write(id);
		return buffer;
	};

	// --- 5. CONTRACT FUNCTION HANDLERS ---

	const handleAdminTx = async (
		action: "init" | "create_game" | "resolve_game"
	) => {
		clearStatus();
		if (!client) {
			setError("Please connect your wallet first.");
			return;
		}
		setIsLoading(true);

		try {
			let tx: any; // AssembledTransaction
			let successMsg = "";

			if (action === "init") {
				if (!initToken) throw new Error("Token Address is required.");
				tx = await client.init({ token: initToken });
				successMsg = "Contract initialized successfully!";
			} else if (action === "create_game") {
				if (!gameId || !minBet || !maxPlayers) {
					throw new Error("All fields are required to create a game.");
				}
				tx = await client.create_game({
					game_id: gameIdToBuffer(gameId),
					_min_bet: BigInt(minBet),
					_max_players: Number(maxPlayers),
				});
				successMsg = `Game "${gameId}" created successfully!`;
			} else if (action === "resolve_game") {
				if (!gameId || resolveResult === "") {
					throw new Error("Game ID and Result are required.");
				}
				tx = await client.resolve_game({
					game_id: gameIdToBuffer(gameId),
					result: Number(resolveResult),
				});
				successMsg = `Game "${gameId}" resolved!`;
			}

			// Sign and send the transaction
			setResult("Waiting for signature...");
			await tx.signAndSend();
			setResult(successMsg);
		} catch (e) {
			console.error(e);
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinGame = async () => {
		clearStatus();
		if (!client || !publicKey) {
			setError("Please connect your wallet first.");
			return;
		}
		setIsLoading(true);

		try {
			if (!joinGameId || !joinAmount) {
				throw new Error("All fields are required to join a game.");
			}

			const tx = await client.join_game({
				game_id: gameIdToBuffer(joinGameId),
				player: publicKey, // Automatically use the connected wallet's public key
				choice: Number(joinChoice),
				amount: BigInt(joinAmount),
			});

			// This will prompt the user to approve both the token transfer AND
			// the contract call, all in one go.
			setResult("Waiting for signature to join and place bet...");
			await tx.signAndSend();
			setResult(`Successfully joined game "${joinGameId}"!`);
		} catch (e) {
			console.error(e);
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGetPot = async () => {
		clearStatus();
		setPotResult("");
		if (!client) {
			setError("Please connect your wallet first.");
			return;
		}
		setIsLoading(true);

		try {
			if (!queryGameId) throw new Error("Game ID is required.");

			// Read-only calls are simulated by default and return the result directly
			const tx = await client.get_pot({ game_id: gameIdToBuffer(queryGameId) });

			// The result is an i128 (BigInt). Convert to string for display.
			const potAmount = tx.result.toString();
			setPotResult(potAmount);
			setResult(`Pot for "${queryGameId}": ${potAmount}`);
		} catch (e) {
			console.error(e);
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	// --- 6. RENDER THE UI (JSX) ---

	return (
		<div className="flex justify-center min-h-screen bg-gray-900 text-white p-8 font-sans">
			<div className="w-full max-w-4xl">
				<h1 className="text-4xl font-bold mb-6 text-center text-blue-400">
					Soroban Game dApp
				</h1>

				{/* --- Connect & Status Panel --- */}
				<div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
					<button
						onClick={async () => {
							await kit.openModal({
									onWalletSelected: async (option) => {
									kit.setWallet(option.id);
									const { address } = await kit.getAddress();
									setPublicKey(address);
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

					{isLoading && (
						<p className="text-center mt-4 text-yellow-400">Loading...</p>
					)}
					{error && (
						<p className="text-center mt-4 text-red-400 wrap-break-word">
							{error}
						</p>
					)}
					{result && (
						<p className="text-center mt-4 text-green-400 wrap-break-word">
							{result}
						</p>
					)}
				</div>

				{/* --- UI Grids --- */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* --- Admin Panel --- */}
					<div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
						<h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">
							Admin Panel
						</h2>

						<div className="space-y-4">
							<h3 className="text-lg font-medium">
								Initialize Contract (Once)
							</h3>
							<input
								type="text"
								placeholder="Token Address"
								value={initToken}
								onChange={(e) => setInitToken(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<button
								onClick={() => handleAdminTx("init")}
								disabled={isLoading || !client}
								className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:bg-gray-600"
							>
								Initialize
							</button>
						</div>

						<hr className="border-gray-700" />

						<div className="space-y-4">
							<h3 className="text-lg font-medium">Create / Resolve Game</h3>
							<input
								type="text"
								placeholder="Game ID (e.g., 'game1')"
								value={gameId}
								onChange={(e) => setGameId(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<input
								type="number"
								placeholder="Min Bet (e.g., 10000000)"
								value={minBet}
								onChange={(e) => setMinBet(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<input
								type="number"
								placeholder="Max Players (e.g., 10)"
								value={maxPlayers}
								onChange={(e) => setMaxPlayers(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<button
								onClick={() => handleAdminTx("create_game")}
								disabled={isLoading || !client}
								className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:bg-gray-600"
							>
								Create Game
							</button>

							<input
								type="number"
								placeholder="Result (e.g., 0, 1, 2...)"
								value={resolveResult}
								onChange={(e) => setResolveResult(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded mt-4"
							/>
							<button
								onClick={() => handleAdminTx("resolve_game")}
								disabled={isLoading || !client}
								className="w-full p-2 bg-red-600 hover:bg-red-700 rounded disabled:bg-gray-600"
							>
								Resolve Game
							</button>
						</div>
					</div>

					{/* --- Player Panel --- */}
					<div className="space-y-8">
						<div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-4">
							<h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">
								Player Panel
							</h2>

							<input
								type="text"
								placeholder="Game ID to Join"
								value={joinGameId}
								onChange={(e) => setJoinGameId(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<input
								type="number"
								placeholder="Amount to Bet"
								value={joinAmount}
								onChange={(e) => setJoinAmount(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<select
								value={joinChoice}
								onChange={(e) => setJoinChoice(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							>
								<option value="0">Choice 0</option>
								<option value="1">Choice 1</option>
								<option value="2">Choice 2</option>
								{/* Add more choices as needed */}
							</select>
							<button
								onClick={handleJoinGame}
								disabled={isLoading || !client}
								className="w-full p-3 bg-green-600 hover:bg-green-700 rounded disabled:bg-gray-600 font-bold"
							>
								Join Game & Place Bet
							</button>
						</div>

						<div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-4">
							<h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">
								View Game Pot
							</h2>
							<input
								type="text"
								placeholder="Game ID to Query"
								value={queryGameId}
								onChange={(e) => setQueryGameId(e.target.value)}
								className="w-full p-2 bg-gray-700 rounded"
							/>
							<button
								onClick={handleGetPot}
								disabled={isLoading || !client}
								className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded disabled:bg-gray-600"
							>
								Get Pot Size
							</button>
							{potResult && (
								<p className="text-center text-xl mt-4">
									Pot:{" "}
									<span className="font-bold text-green-400">{potResult}</span>
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
