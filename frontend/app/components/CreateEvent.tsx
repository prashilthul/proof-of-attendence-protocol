"use client";

import { useState } from "react";
import { Client } from "@/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateEventProps {
  client: Client;
  publicKey: string;
  onTransaction: (promise: Promise<any>, successMessage: string) => void;
}

const CreateEvent = ({ 
  client, 
  publicKey, 
  onTransaction
}: CreateEventProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maxSupply, setMaxSupply] = useState(0);
  const [secret, setSecret] = useState("");

  const handleCreateEvent = async () => {
    if (!name || !description || !imageUrl || !maxSupply || !secret) {
      // In a real app, you'd use a form library for better validation
      alert("All fields are required!");
      return;
    }

    const promise = client.create_event({
      creator: publicKey,
      name,
      description,
      image_url: imageUrl,
      max_supply: maxSupply,
      secret,
    }).then(tx => tx.signAndSend());

    onTransaction(promise, "Event created successfully!");
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">Create Event</h2>
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-gray-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxSupply">Max Supply</Label>
        <Input id="maxSupply" type="number" value={maxSupply} onChange={(e) => setMaxSupply(Number(e.target.value))} className="bg-gray-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secret">Secret</Label>
        <Input id="secret" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} className="bg-gray-700" />
      </div>
      <Button onClick={handleCreateEvent} className="w-full bg-indigo-600 hover:bg-indigo-700">Create Event</Button>
    </div>
  );
};

export default CreateEvent;