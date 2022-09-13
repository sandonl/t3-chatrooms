import { useEffect } from "react";
import { trpc } from "../../utils/trpc";

interface UserPanelProps {
  selectedRoomId: string;
}

export const UserPanel = ({ selectedRoomId }: UserPanelProps) => {
  const getUsersInRoom = trpc.useQuery([
    "server.getUsers",
    { roomId: selectedRoomId },
  ]);

  // useEffect(() => {
  //   const refetchUsers = async () => {
  //     await getUsersInRoom.refetch();
  //   };
  //   refetchUsers();
  // }, [selectedRoomId]);

  return (
    <div className="w-[10rem] bg-gray-200 h-full pt-4 px-6 flex-grow ">
      <h1 className="text-blue-400 font-bold"> Users in Room: </h1>
      <div className="flex-flex-col gap-2 mb-2">
        {getUsersInRoom.data?.map((user) => (
          <div key={user.id}> {user.name}</div>
        ))}
      </div>
    </div>
  );
};
