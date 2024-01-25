"use server";

import { revalidatePath } from "next/cache";

import { handleError } from "../utils";
import { CreateUserParams, UpdateUserParams } from "@/types";
import { db } from "../db";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    const newUser = await db.user.create({ data: user });

    return newUser;
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateUser(userId: string, user: UpdateUserParams) {
  try {
    const updatedUser = await db.user.update({ where: { id: userId }, data: user });

    if (!updatedUser) throw new Error("User update failed");

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(userId?: string) {
  try {
    // Delete user
    const deletedUser = await db.user.delete({ where: { id: userId } });
    revalidatePath("/");

    return deletedUser ? deletedUser : null;
  } catch (error) {
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    const updatedUserCredits = await db.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: creditFee,
        },
      },
    });

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
