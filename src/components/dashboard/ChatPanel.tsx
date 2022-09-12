import { RtmChannel } from "agora-rtm-sdk";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { trpc } from "../../utils/trpc";
import { Button, Variant } from "../Button";
import { UserPanel } from "./UserPanel";

type ChatPanelProps = {
  selectedRoomName: string;
  selectedRoomId: string;
  token: string;
};

type Message = {
  text: string;
  userId: string;
  name: string;
};

export const ChatPanel = ({
  selectedRoomName,
  selectedRoomId,
  token,
}: ChatPanelProps) => {
  const { user } = useContext(UserContext);
  const [text, setText] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomChannel, setRoomChannel] = useState<RtmChannel>();

  const handleChatTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomChannel) return;
    if (!text) return;
    roomChannel.sendMessage({
      text: JSON.stringify({
        text,
        userId: user.id,
        name: user.name,
      }),
    });
    setMessages((prevMessages) => [
      {
        text,
        userId: user.id,
        name: user.name,
      },
      ...prevMessages,
    ]);
    setText("");
  };

  useEffect(() => {
    const connectToRoom = async () => {
      const { default: AgoraRTM } = await import("agora-rtm-sdk");

      // Create Agora client
      const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
      // Login with user ID
      await client.login({
        uid: user.id,
        token,
      });

      const channel = await client.createChannel(selectedRoomId);
      await channel.join();

      channel.on("ChannelMessage", (message, peerId) => {
        // Track messages
        if (!message.text) return;
        const messageObj = JSON.parse(message.text);
        setMessages((prevMessages) => [
          {
            ...messageObj,
          },
          ...prevMessages,
        ]);
      });
      setRoomChannel(channel);
      return { client, channel };
    };

    const clientPromise = connectToRoom();

    // Cleanup function for unmount of leaving the room.
    return () => {
      clientPromise.then(async (context) => {
        if (!context) return;
        const { channel, client } = context;
        await channel.leave();
        await client.logout();
        setRoomChannel(undefined);
      });
    };
  }, [selectedRoomId]);

  if (!selectedRoomId) return null;

  return (
    <div className="flex gap-4">
      <div className="w-8/12">
        <div>
          Current Room:
          <span className="text-blue-400 font-bold"> {selectedRoomName} </span>
        </div>
        <div className="h-56 bg-white rounded-md w-11/12 border m-1 flex flex-col-reverse">
          {messages.map((message, idx) => (
            <div key={idx} className="px-4 py-2">
              {message.name}: {message.text}
            </div>
          ))}
        </div>

        <div className="flex flex-nowrap gap-4 middle p-4 align-text-bottom items-center">
          <div> {user.name}</div>
          <form onSubmit={handleSendMessage} className="flex-grow">
            <input
              onChange={handleChatTyped}
              value={text}
              placeholder="Type a message here."
              className="h-10 rounded-md p-4 w-10/12 border"
            />
            <Button variant={Variant.Primary}>Send</Button>
          </form>
        </div>
      </div>
      <UserPanel selectedRoomId={selectedRoomId} />
    </div>
  );
};
