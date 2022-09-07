import { createRouter } from "./context";
import { z } from "zod";

export const serverRouter = createRouter()
  .query("getRooms", {
    input: z.object({
      serverId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const rooms = await ctx.prisma.room.findMany({
        where: {
          serverId: input.serverId,
        },
      });
      return rooms;
    },
  })
  .mutation("createRoom", {
    input: z.object({
      name: z.string(),
      serverId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const newRoom = await ctx.prisma.room.create({
        data: {
          serverId: input.serverId,
          name: input.name,
        },
      });
      return newRoom;
    },
  });
