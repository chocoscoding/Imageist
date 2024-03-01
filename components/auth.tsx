"use client";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  if (status === "authenticated") return <div className="w-full">{children}</div>;
  return <></>;
};
export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  if (status === "unauthenticated") return <div className="w-full">{children}</div>;
  return <></>;
};

export const UserButton = ({ afterSignOutUrl, showName }: { afterSignOutUrl: string; showName?: boolean }) => {
  const { data } = useSession();
  return (
    <div className="flex gap-x-3 items-center">
      <Avatar>
        <AvatarImage src={data?.user.image || ""} />
        <AvatarFallback>{`${data?.user.username[0]}`}</AvatarFallback>
      </Avatar>
      {showName ? <p className="text-xl font-medium text-gray-700">{data?.user.username}</p> : null}
    </div>
  );
};
