"use client";

import { useState, useEffect } from "react";
import { Client, EventPublicDetails } from "@/index";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventListProps {
  client: Client | null;
}

const EventList = ({ client }: EventListProps) => {
  const [events, setEvents] = useState<EventPublicDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!client) {
        setLoading(false);
        return;
      }

      try {
        const fetchedEvents: EventPublicDetails[] = [];
        for (let i = 1; i <= 10; i++) { // Still iterating, as we don't have a total event count
          try {
            const tx = await client.get_event({ event_id: i });
            if (tx.result) {
              fetchedEvents.push(tx.result);
            }
          } catch (e) {
            break; // Stop if event not found
          }
        }
        setEvents(fetchedEvents);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching events.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [client]);

  if (loading) {
    return <div className="text-center text-yellow-400">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-900 text-red-300 rounded">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Ongoing Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="bg-gray-700 border-gray-600 text-white">
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription className="text-gray-400">{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <img src={event.image_url} alt={event.name} className="rounded-md w-full h-auto" />
            </CardContent>
            <CardFooter className="flex justify-between items-center text-xs text-gray-400">
              <span>Remaining: {event.max_supply - event.minted_count}</span>
              <span className="truncate">Creator: {event.creator}</span>
            </CardFooter>
          </Card>
        ))}
        {events.length === 0 && !loading && (
          <p className="text-gray-400 col-span-full text-center">No events found.</p>
        )}
      </div>
    </div>
  );
};

export default EventList;