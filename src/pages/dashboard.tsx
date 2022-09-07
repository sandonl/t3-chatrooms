import { NextPage } from "next";
import { useContext, useState } from "react";
import { Button, Variant } from "../components/Button";
import { ChatPanel } from "../components/dashboard/ChatPanel";
import { CreateRoomModal } from "../components/dashboard/CreateRoomModal";
import { UserContext } from "../context/UserContext";
import { serverRouter } from "../server/router/serverRouter";
import { trpc } from "../utils/trpc";

const SERVER_ID = "cl7r1sb4x0010fxv77cupvfg4";

const DashboardPage: NextPage = () => {
  const { user } = useContext(UserContext);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const getServers = trpc.useQuery(["user.getServers", { userId: user.id }]);
  const createRoom = trpc.useMutation(["server.createRoom"]);
  const getRooms = trpc.useQuery(["server.getRooms", { serverId: SERVER_ID }]);

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

  const handleRoomSelected = (roomId: string) => {
    setSelectedRoom(roomId);
  };

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
          <div>Current Server: {SERVER_ID}</div>
          <div className="flex flex-col text-left gap-4 p-4 ">
            {getRooms.data?.map((room) => (
              <div key={room.id}>
                <button
                  className="hover:text-blue-100"
                  onClick={() => handleRoomSelected(room.id)}
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
        <div className="flex-grow bg-gray-300 h-full p-4">
          <ChatPanel selectedRoom={selectedRoom} />
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
