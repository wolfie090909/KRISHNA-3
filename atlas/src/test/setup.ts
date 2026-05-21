import { beforeEach } from "vitest";

import { resetDbSingletonForTests } from "@/db/client";

beforeEach(() => {
  process.env.DATABASE_PATH = ":memory:";
  resetDbSingletonForTests();
});
