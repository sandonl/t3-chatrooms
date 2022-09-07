import { create } from "domain";
import { NextPage } from "next";
import { useContext, useState } from "react";
import { Button, Variant } from "../components/Button";
import { CreateRoomModal } from "../components/dashboard/CreateRoomModal";
import { UserContext } from "../context/UserContext";
import { trpc } from "../utils/trpc";

const SERVER_ID = "cl7r1sb4x0010fxv77cupvfg4";

const DashboardPage: NextPage = () => {
  const { user } = useContext(UserContext);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
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

  return (
    <>
      <div className="h-full flex">
        {/* <div>
        DashboardPage Hello {user.name} {user.id} !
      </div> */}
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
          {getRooms.data?.map((room) => (
            <div key={room.id}> {room.name} </div>
          ))}
          <Button onClick={handleShowCreateRoomModal} variant={Variant.Primary}>
            Create Room
          </Button>
        </div>
      </div>
      {showCreateRoomModal && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          isOpen={showCreateRoomModal}
          onClose={handleCloseCreateRoomModal}
        />
      )}
    </>
  );
};

export default DashboardPage;
