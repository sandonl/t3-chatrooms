import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { Button, Variant } from "../Button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => void;
};

export const CreateRoomModal = ({
  isOpen,
  onClose,
  onCreateRoom,
}: ModalProps) => {
  const [roomName, setRoomName] = useState<string>("");

  const handleOnRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleCreateRoom = () => {
    onCreateRoom(roomName);
    setRoomName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded bg-white p-8 flex flex-col gap-2 ">
          <Dialog.Title className="text-xl">Create a New Room</Dialog.Title>

          <input
            value={roomName}
            onChange={handleOnRoomNameChange}
            placeholder="Your room name"
            className="border rounded p-2"
          />

          <div className="flex gap-2">
            <Button variant={Variant.Primary} onClick={handleCreateRoom}>
              Create Room
            </Button>
            <Button variant={Variant.Secondary} onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
