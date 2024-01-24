"use client";

import { useSession, signIn, signOut } from "next-auth/react";

const Page = () => {
  const session = useSession();
  console.log(session);
  return (
    <div>
      Page
      <button
        className="bg-red-500"
        onClick={() => signIn("google")}>
        Sign In Button with google
      </button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

export default Page;
