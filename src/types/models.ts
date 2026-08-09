import type { Database } from "../lib/database.types";

// Shared domain types, consumed by two or more modules. Per TypeScript
// placement practice (colocate single-use, share only what crosses modules),
// only these belong here; single-use types live in their defining file.

export type Source = { title: string; url: string };

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export type Message = Pick<
  MessageRow,
  "id" | "role" | "content" | "created_at" | "sources"
> & {
  order_index: number;
};
