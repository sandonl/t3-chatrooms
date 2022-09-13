import { RtmChannel, RtmClient } from "agora-rtm-sdk";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { trpc } from "../../utils/trpc";
import { Button, Variant } from "../Button";
import { UserPanel } from "./UserPanel";

type ChatPanelProps = {
  refetchRooms: () => void;
  setSelectedRoomId: (roomId: string | undefined) => void;
  selectedRoomName: string;
  selectedRoomId: string;
  client: RtmClient;
};

type Message = {
  text: string;
  userId: string;
  name: string;
};

export const ChatPanel = ({
  refetchRooms,
  setSelectedRoomId,
  selectedRoomName,
  selectedRoomId,
  client,
}: ChatPanelProps) => {
  const { user } = useContext(UserContext);
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomChannel, setRoomChannel] = useState<RtmChannel>();
  const deleteRoom = trpc.useMutation(["room.deleteRoom"]);
  const sendMessage = trpc.useMutation(["room.saveMessage"]);
  const getMessage = trpc.useQuery(
    [
      "room.getMessages",
      {
        roomId: selectedRoomId,
      },
    ],
    {
      enabled: false,
      onSuccess: (initialMessages: Message[]) => {
        setMessages(initialMessages);
      },
    }
  );

  const handleDeleteRoom = async () => {
    await deleteRoom.mutateAsync({
      roomId: selectedRoomId,
    });
    refetchRooms();
    setSelectedRoomId(undefined);
  };

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
    sendMessage.mutate({
      roomId: selectedRoomId,
      text,
      userId: user.id,
      name: user.name,
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
      await getMessage.refetch();
      const channel = await client.createChannel(selectedRoomId);
      await channel.join();

      channel.on("ChannelMessage", (message) => {
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
      return { channel };
    };

    const clientPromise = connectToRoom();

    // Cleanup function for unmount of leaving the room.
    return () => {
      clientPromise.then(async (context) => {
        if (!context) return;
        const { channel } = context;
        await channel.leave();
        setRoomChannel(undefined);
      });
    };
  }, [selectedRoomId]);

  if (!selectedRoomId) return null;

  return (
    <div className="flex gap-4 h-full justify-center">
      <div className="w-8/12 p-4 flex flex-col items-center">
        <div>
          <span className="font-bold"> Current Room: </span>
          <span className="text-blue-400 font-bold"> {selectedRoomName} </span>
          <span>
            <Button onClick={handleDeleteRoom} variant={Variant.InLine}>
              Delete
            </Button>
          </span>
        </div>
        <div className="h-4/5 bg-white rounded-md w-11/12 border m-1 flex flex-col-reverse overflow-auto">
          {messages.map((message, idx) => (
            <div key={idx} className="px-4 py-2">
              {message.name}: {message.text}
            </div>
          ))}
        </div>

        <div className="flex flex-nowrap gap-4 middle p-4 align-text-bottom items-center w-11/12">
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
