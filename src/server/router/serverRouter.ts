import { createRouter } from "./context";
import { z } from "zod";

export const serverRouter = createRouter().mutation("createRoom", {
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
