"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { SettingsSchema } from "@/schemas";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useToast } from "@/components/ui/use-toast";
import { deleteUser } from "@/lib/actions/user.actions";

import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const SettingsPage = () => {
  const { data, status } = useSession();
  const { toast } = useToast();
  //function to handle deleting the user
  const handleDelete = async () => {
    try {
      const progress = toast({
        title: "Processing!",
        description: "",
        duration: 3000,
        className: "progress-toast",
      });
      const del = await deleteUser(data?.user.id);
      progress.dismiss();
      if (!del) {
        //if there was nothing to delete
        toast({
          title: "Deletion failed!",
          description: "Something went wrong, check your internet and try again",
          duration: 5000,
          className: "error-toast",
        });
      } else {
        //show success
        toast({
          title: "Deleted Successfully",
          description: "It was nice having you here 🥲",
          duration: 5000,
          className: "success-toast",
        });
      }
    } catch (error) {
      //throw error
      toast({
        title: "Deletion failed!",
        description: "Something went wrong, check your internet and try again",
        duration: 5000,
        className: "error-toast",
      });
    }
  };

  if (status === "unauthenticated") redirect("/sign-in");

  return (
    <Card className="max-w-[1000px] w-[98%] m-auto">
      <CardHeader>
        <p className="text-4xl font-semibold text-left mb-3">⚙️ Account</p>
        <p className="text-xl font-medium text-left text-gray-500">Manage your account</p>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <p className="font-semibold text-xl">Profile</p>
          <hr className="h-0.5 bg-gray-200 rounded-full" />
          <div className="flex gap-2 items-center pt-2">
            <Avatar className="w-12 h-12 rounded-full overflow-hidden">
              <AvatarImage src={data?.user.image || ""} />
              <AvatarFallback>{`${data?.user.username[0]}`}</AvatarFallback>
            </Avatar>

            <p className="text-2xl text-gray-700">{`${data?.user.username}`}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="font-semibold text-xl">Email Address</p>
          <hr className="h-0.5 bg-gray-200 rounded-full" />
          <div className="flex pt-2">
            <p className="text-2xl text-gray-700">{`${data?.user.email}`}</p>
          </div>
        </div>
        <div className="mb-8">
          <p className="font-semibold text-xl">Account Control</p>
          <hr className="h-0.5 bg-gray-200 rounded-full" />
          <div className="flex gap-2">
            <Button
              size={"lg"}
              variant={"default"}
              className="rounded-full mt-4"
              onClick={() => signOut()}>
              Log Out
            </Button>
            <Button
              size={"lg"}
              variant={"destructive"}
              className="rounded-full mt-4"
              onClick={handleDelete}>
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
