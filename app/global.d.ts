import { Database as DB } from "@/lib/database.types";

type Message = DB["public"]["Tables"]["messages"]["Row"];
type Profile = DB["public"]["Tables"]["profiles"]["Row"];

declare global {
  type Database = DB;
  type MessageWithAuthor = Message & {
    author: Profile;
    likes: number;
    user_has_liked_message: boolean;
  };
}
