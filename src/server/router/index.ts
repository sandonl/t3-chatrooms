// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./userRouter";
import { serverRouter } from "./serverRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("server.", serverRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
