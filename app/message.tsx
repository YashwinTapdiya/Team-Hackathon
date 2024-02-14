"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import React from "react";
import { useEffect, experimental_useOptimistic as useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function Messages({
  messages,
}: {
  messages: MessageWithAuthor[];
}) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    MessageWithAuthor[],
    MessageWithAuthor
  >(messages, (currentOptimisticMessages, newMessage) => {
    const newOptimisticMessages = [...currentOptimisticMessages];

    const index = newOptimisticMessages.findIndex(
      (message) => message.id === newMessage.id
    );

    newOptimisticMessages[index] = newMessage;
    return newOptimisticMessages;
  });

  const supabase = createClientComponentClient();
  const router = useRouter();
  useEffect(() => {
    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return optimisticMessages?.map((message) => (
    <div
      key={message.id}
      className="border border-gray-800 border-t-0 px-4 py-8 flex"
    >
      <div className="h-12 w-12">
        <Image
          className="rounded-full"
          src={message.author.avatar_url}
          alt="messsage user avatar"
          width={48}
          height={48}
        />
      </div>
      <div className="ml-4">
        <p>
          <span className="font-bold">{message.author.name}</span>
          <span className="text-sm ml-2 text-gray-400">
            {message.author.username}
          </span>
        </p>
        <p>{message.title}</p>
        <Likes message={message} addOptimisticMessage={addOptimisticMessage} />
      </div>
    </div>
  ));
}
