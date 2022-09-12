import { z } from "zod";
import { createRouter } from "./context";

export const roomRouter = createRouter()
  .query("getMessages", {
    input: z.object({
      roomId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const messages = await ctx.prisma.message.findMany({
        where: {
          roomId: input.roomId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return messages;
    },
  })
  .mutation("saveMessage", {
    input: z.object({
      text: z.string(),
      name: z.string(),
      userId: z.string(),
      roomId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const newServer = await ctx.prisma.message.create({
        data: {
          text: input.text,
          name: input.name,
          userId: input.userId,
          roomId: input.roomId,
        },
      });
      return newServer;
    },
  });
