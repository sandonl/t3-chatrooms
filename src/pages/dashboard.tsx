import { Room } from "@prisma/client";
import { RtmClient } from "agora-rtm-sdk";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Button, Variant } from "../components/Button";
import { ChatPanel } from "../components/dashboard/ChatPanel";
import { CreateRoomModal } from "../components/dashboard/CreateRoomModal";
import { UserContext } from "../context/UserContext";
import { trpc } from "../utils/trpc";

const SERVER_ID = "cl7r1sb4x0010fxv77cupvfg4";

const DashboardPage: NextPage = () => {
  const { user } = useContext(UserContext);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>();
  const [selectedRoomName, setSelectedRoomName] = useState<string>();
  const getServers = trpc.useQuery(["user.getServers", { userId: user.id }]);
  const createRoom = trpc.useMutation(["server.createRoom"]);
  const joinRoom = trpc.useMutation("server.joinRoom");
  const getToken = trpc.useMutation("server.getToken");
  const [client, setClient] = useState<RtmClient>();
  const getRooms = trpc.useQuery(["server.getRooms", { serverId: SERVER_ID }]);
  const router = useRouter();

  useEffect(() => {
    if (!user.id) {
      router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    if (!user.id) return;
    const login = async () => {
      const token = await getToken.mutateAsync({
        userId: user.id,
      });
      const { default: AgoraRTM } = await import("agora-rtm-sdk");

      // Create Agora client
      const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
      // Login with user ID
      await client.login({
        uid: user.id,
        token,
      });
      setClient(client);
      return client;
    };
    const loginPromise = login();

    return () => {
      const logout = async () => {
        const client = await loginPromise;
        await client.logout();
        setClient(undefined);
      };
      logout();
    };
  }, [user]);

  const handleShowCreateRoomModal = () => {
    setShowCreateRoomModal(true);
  };

  const handleCloseCreateRoomModal = () => {
    setShowCreateRoomModal(false);
  };

  const handleCreateRoom = async (roomName: string) => {
    await createRoom.mutateAsync({
      name: roomName,
      serverId: SERVER_ID, //TODO: undo hardcode
    });
    await getRooms.refetch();
  };

  const handleRoomSelected = async (room: Room) => {
    setSelectedRoomId(undefined);
    await joinRoom.mutateAsync({
      roomId: room.id,
      userId: user.id,
    });
    setSelectedRoomId(room.id);
    setSelectedRoomName(room.name);
  };

  const showChatPanel = selectedRoomId && selectedRoomName && client;

  return (
    <>
      <div className="h-full flex">
        <div className="w-20 bg-gray-500 h-full flex justify-center pt-4">
          {getServers.data?.map((server) => (
            <div
              key={server.serverId}
              className="rounded-full bg-blue-400 w-12 h-12 flex justify-center items-center
          hover:bg-blue-300 cursor-pointer
          "
            >
              {server.serverId.charAt(0)}
            </div>
          ))}
        </div>
        <div className="w-80 bg-gray-400 h-full p-4">
          <div className="font-bold px-4 py-2">Rooms: </div>
          <div className="flex flex-col text-left gap-4 p-4 ">
            {getRooms.data?.map((room) => (
              <div key={room.id}>
                <button
                  className="hover:text-blue-100"
                  onClick={() => handleRoomSelected(room)}
                >
                  {room.name}
                </button>
              </div>
            ))}
          </div>
          <Button onClick={handleShowCreateRoomModal} variant={Variant.Primary}>
            Create Room
          </Button>
        </div>
        <div className="flex-grow bg-gray-300 h-full">
          {showChatPanel && (
            <ChatPanel
              refetchRooms={getRooms.refetch}
              setSelectedRoomId={setSelectedRoomId}
              client={client}
              selectedRoomName={selectedRoomName}
              selectedRoomId={selectedRoomId}
            />
          )}
        </div>
      </div>
      <CreateRoomModal
        onCreateRoom={handleCreateRoom}
        isOpen={showCreateRoomModal}
        onClose={handleCloseCreateRoomModal}
      />
    </>
  );
};

export default DashboardPage;
