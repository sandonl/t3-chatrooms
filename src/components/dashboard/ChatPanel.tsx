import React from "react";

type ChatPanelProps = {
  selectedRoom: string | undefined;
};

export const ChatPanel = ({ selectedRoom }: ChatPanelProps) => {
  return <>{selectedRoom}</>;
};
