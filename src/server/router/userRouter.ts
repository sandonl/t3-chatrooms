import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter().mutation("createUser", {
  input: z.object({
    name: z.string(),
  }),
  async resolve({ input, ctx }) {
    const existingUser = await ctx.prisma.user.findFirst({
      where: {
        name: input.name,
      },
    });

    if (existingUser) {
      return existingUser;
    } else {
      const createdUser = await ctx.prisma.user.create({
        data: {
          name: input.name,
        },
      });
      return createdUser;
    }
  },
});
