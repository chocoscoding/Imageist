"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

const Page = () => {
  const session = useSession();
  if (session.status === "authenticated") {
    redirect("/");
  }
  return (
    <Card className="max-w-[400px] w-[98%] m-auto p-4">
      <p className="font-medium text-center text-lg">Login to start enjoying the awesome ability of Imageist</p>
      <Button
        size="lg"
        className="w-[100%] mt-4 rounded-full"
        variant="outline"
        onClick={() => signIn("google")}>
        <span>Contiue with Google</span>
        <FcGoogle className="h-5 w-5 ml-2" />
      </Button>
    </Card>
  );
};

export default Page;
