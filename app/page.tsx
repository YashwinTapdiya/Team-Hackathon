import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./auth-button-server";
import { redirect } from "next/navigation";
import NewMessage from "./new-message";
import Messages from "./message";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("messages")
    .select("*, author: profiles(*),likes(user_id)")
    .order("created_at", { ascending: false });

  const messages =
    data?.map((message) => ({
      ...message,
      author: Array.isArray(message.author)
        ? message.author[0]
        : message.author,
      user_has_liked_message: !!message.likes.find(
        (like) => like.user_id === session.user.id
      ),
      likes: message.likes.length,
    })) ?? [];

  return (
    <div className="w-full max-w-xl mx-auto text-white">
      <div className="flex justify-between px-4 py-6 border-gray-800 border-t-0">
        <h1 className="text-xl font-bold">Home</h1>
        <AuthButtonServer />
      </div>
      <NewMessage user={session.user} />
      <Messages messages={messages} />
    </div>
  );
}
