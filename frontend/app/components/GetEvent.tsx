"use client";

import { useState } from "react";
import { Client, networks, Event } from "@/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const GetEvent = () => {
  const [eventId, setEventId] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new Client({
    ...networks.testnet,
    rpcUrl: "https://soroban-testnet.stellar.org",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEvent(null);

    try {
      const tx = await client.get_event({ event_id: eventId });
      const result = await tx.signAndSend();

      if (result.result) {
        setEvent(result.result);
      } else {
        setError("Failed to fetch event details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the event.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Event Details</CardTitle>
        <CardDescription>Enter an event ID to view its details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventId-get">Event ID</Label>
            <Input
              id="eventId-get"
              type="number"
              value={eventId}
              onChange={(e) => setEventId(Number(e.target.value))}
              required
            />
          </div>
          <Button type="submit">Get Event</Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {event && (
          <div className="mt-4 p-4 bg-gray-100 rounded w-full">
            <h3 className="font-bold">Event Details</h3>
            <p><strong>ID:</strong> {event.id}</p>
            <p><strong>Name:</strong> {event.name}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Creator:</strong> {event.creator}</p>
            <p><strong>Max Supply:</strong> {event.max_supply}</p>
            <p><strong>Minted Count:</strong> {event.minted_count}</p>
            <img src={event.image_url} alt={event.name} className="mt-2 rounded max-w-xs" />
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 rounded w-full">
            Error: {error}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default GetEvent;