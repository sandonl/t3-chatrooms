import React from "react";
import { trpc } from "../../utils/trpc";

interface UserPanelProps {
  selectedRoomId: string;
}

export const UserPanel = ({ selectedRoomId }: UserPanelProps) => {
  const getUsersInRoom = trpc.useQuery([
    "server.getUsers",
    { roomId: selectedRoomId },
  ]);

  return (
    <div>
      <h1> Users in Room: </h1>
      {getUsersInRoom.data?.map((user) => (
        <div key={user.id}> {user.name}</div>
      ))}
    </div>
  );
};
