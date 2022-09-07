import { NextPage } from "next";
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { trpc } from "../utils/trpc";

const DashboardPage: NextPage = () => {
  const { user } = useContext(UserContext);
  const getServers = trpc.useQuery(["user.getServers", { userId: user.id }]);

  return (
    <div className="h-full">
      {/* <div>
        DashboardPage Hello {user.name} {user.id} !
      </div> */}
      <div className="w-20 bg-gray-400 h-full flex justify-center pt-4">
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
    </div>
  );
};

export default DashboardPage;
