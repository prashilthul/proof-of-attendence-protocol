"use client";

import { useState, useEffect } from "react";
import { Client, EventPublicDetails } from "@/index";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MyPoapsProps {
  client: Client | null;
  publicKey: string | null;
}

const MyPoaps = ({ client, publicKey }: MyPoapsProps) => {
  const [claimedPoaps, setClaimedPoaps] = useState<EventPublicDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimedPoaps = async () => {
      if (!client || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        const fetchedPoaps: EventPublicDetails[] = [];
        for (let i = 1; i <= 10; i++) { // Still iterating
          try {
            const hasClaimedTx = await client.has_claimed({ event_id: i, addr: publicKey });

            if (hasClaimedTx.result) {
              const eventTx = await client.get_event({ event_id: i });
              if (eventTx.result) {
                fetchedPoaps.push(eventTx.result);
              }
            }
          } catch (e) {
            break; // Stop if event not found
          }
        }
        setClaimedPoaps(fetchedPoaps);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching your POAPs.");
      }
      setLoading(false);
    };

    fetchClaimedPoaps();
  }, [client, publicKey]);

  if (loading) {
    return <div className="text-center text-yellow-400">Loading your POAPs...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-900 text-red-300 rounded">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 mt-8">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">My POAPs</h2>
      {claimedPoaps.length === 0 ? (
        <p className="text-gray-400 text-center">You haven't claimed any POAPs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimedPoaps.map((event) => (
            <Card key={event.id} className="bg-gray-700 border-gray-600 text-white">
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={event.image_url} alt={event.name} className="rounded-md w-full h-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPoaps;