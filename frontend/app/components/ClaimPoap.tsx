"use client";

import { useState } from "react";
import { Client } from "@/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClaimPoapProps {
  client: Client;
  publicKey: string;
  onTransaction: (promise: Promise<any>, successMessage: string) => void;
}

const ClaimPoap = ({ 
  client, 
  publicKey, 
  onTransaction
}: ClaimPoapProps) => {
  const [eventId, setEventId] = useState(0);
  const [secret, setSecret] = useState("");

  const handleClaimPoap = async () => {
    if (!eventId || !secret) {
      alert("Event ID and Secret are required!");
      return;
    }

    const promise = client.claim_poap({
      to: publicKey,
      event_id: eventId,
      provided_secret: secret,
    }).then(tx => tx.signAndSend());

    onTransaction(promise, `Successfully claimed POAP for event ${eventId}!`);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">Claim POAP</h2>
      <div className="space-y-2">
        <Label htmlFor="eventId-claim">Event ID</Label>
        <Input id="eventId-claim" type="number" value={eventId} onChange={(e) => setEventId(Number(e.target.value))} className="bg-gray-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secret-claim">Secret</Label>
        <Input id="secret-claim" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} className="bg-gray-700" />
      </div>
      <Button onClick={handleClaimPoap} className="w-full bg-green-600 hover:bg-green-700">Claim POAP</Button>
    </div>
  );
};

export default ClaimPoap;