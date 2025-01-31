"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { showNewOrderToast } from "@/lib/functions";
import { useMutation, useQuery } from "convex/react";
import React, { useState, useEffect, useRef } from "react";

export default function NotificationText() {
  // Fetch messages (this will automatically update when new messages arrive)
  const messages = useQuery(api.users.get) || [];
  const order = useQuery(api.order.get) || [];

  const [text, setText] = useState("");
  const [status, setStatus] = useState(false);
  // Ref to keep track of the number of messages
  const previousMessagesRef = useRef(messages);

  // useEffect(() => {
  //   // Check if the length of messages has increased (indicating a new message)
  //   if (previousMessagesRef.current.length < messages.length) {
  //     const newMessage = messages[messages.length - 1];
  //     console.log("New message arrived:", newMessage.text);

  //     // Play notification sound
  //     const notificationSound = new Audio("/notification-sound.mp3");
  //     notificationSound.play().catch((error) => {
  //       console.error("Error playing sound:", error);
  //     });
  //   }

  //   // Update the ref to the latest messages
  //   previousMessagesRef.current = messages;
  // }, [messages]);

  const handleChange = (event) => {
    setText(event.target.value);
    setStatus(true);
  };

  // Mutation to create new message
  const createMessage = useMutation(api.users.put);
  const handleSubmit = async () => {
    try {
      await createMessage({ text, status });
      setText(""); // Clear input after submitting
      setStatus(false);
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  if (!messages) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="mt-20 p-2 flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={text}
          placeholder="Type message"
          onChange={handleChange}
        />
        <Button className="hover:bg-primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
      <Label className="mt-3 text-md">
        {/* Displaying messages */}
        {messages.map((item, idx) => (
          <h1 key={idx}>{item.text}</h1>
        ))}
      </Label>
    </div>
  );
}
