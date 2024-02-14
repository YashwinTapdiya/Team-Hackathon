"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Likes({
  message,
  addOptimisticMessage,
}: {
  message: MessageWithAuthor;
  addOptimisticMessage: (newMessage: MessageWithAuthor) => void;
}) {
  const router = useRouter();
  const handleLikes = async () => {
    const supabase = createClientComponentClient<Database>();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (message.user_has_liked_message) {
        addOptimisticMessage({
          ...message,
          likes: message.likes - 1,
          user_has_liked_message: !message.user_has_liked_message,
        });
        await supabase.from("likes").delete().match({
          user_id: user.id,
          message_id: message.id,
        });
      } else {
        addOptimisticMessage({
          ...message,
          likes: message.likes + 1,
          user_has_liked_message: !message.user_has_liked_message,
        });
        await supabase
          .from("likes")
          .insert({ user_id: user.id, message_id: message.id });
      }
      router.refresh();
    }
  };

  return (
    <button onClick={handleLikes} className="group flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`group-hover:fill-red-600 group-hover:stroke-red-600 ${
          message.user_has_liked_message
            ? "fill-red-600 stroke-red-600"
            : "fill-none stroke-gray-500"
        }`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span
        className={`ml-2 text-sm group-hover:text-red-600 ${
          message.user_has_liked_message ? "text-red-600" : "text-gray-500"
        }`}
      >
        {message.likes}
      </span>
    </button>
  );
}
