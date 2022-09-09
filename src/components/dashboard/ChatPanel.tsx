import { RtmChannel } from "agora-rtm-sdk";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { trpc } from "../../utils/trpc";
import { Button, Variant } from "../Button";

type ChatPanelProps = {
  selectedRoom: string | undefined;
};

export const ChatPanel = ({ selectedRoom }: ChatPanelProps) => {
  const { user } = useContext(UserContext);
  const [text, setText] = useState<string>();
  const [messages, setMessages] = useState<any[]>([]);
  const joinRoom = trpc.useMutation("server.joinRoom");
  const [roomChannel, setRoomChannel] = useState<RtmChannel>();

  const handleChatTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSendMessage = () => {
    if (!roomChannel) return;
    if (!text) return;
    roomChannel.sendMessage({ text: text });
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text,
        userId: user.id,
      },
    ]);
    setText("");
  };

  useEffect(() => {
    const connectToRoom = async () => {
      if (!selectedRoom) return;

      const { default: AgoraRTM } = await import("agora-rtm-sdk");

      const token = await joinRoom.mutateAsync({
        userId: user.id,
        roomId: selectedRoom,
      });

      // Create Agora client
      const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
      // Login with user ID
      await client.login({
        uid: user.id,
        token,
      });

      const channel = await client.createChannel(selectedRoom);
      await channel.join();

      channel.on("ChannelMessage", (message, peerId) => {
        // Track messages
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: message.text,
            userId: peerId,
          },
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
  }, [selectedRoom]);

  if (!selectedRoom) return null;

  return (
    <div>
      <div>Chat Panel {selectedRoom} </div>
      {messages.map((message, idx) => (
        <div key={idx}> {message.text} </div>
      ))}
      <input
        onChange={handleChatTyped}
        value={text}
        placeholder="Type a message here."
      />
      <Button onClick={handleSendMessage} variant={Variant.Primary}>
        Send
      </Button>
    </div>
  );
};
