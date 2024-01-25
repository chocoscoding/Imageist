"use server";

import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import { v2 as cloudinary } from "cloudinary";
import { AddImageParams, UpdateImageParams } from "@/types";
import { Image as ImageType, User as UserType } from "@prisma/client";


export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    const newImage = await db.image.create({
      data: {
        ...image,
        authorId: userId,
      },
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}


export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    const imageToUpdate = await db.image.update({ where: { id: image.id, authorId: userId }, data: image });

    revalidatePath(path);

    return imageToUpdate;
  } catch (error) {
    handleError(error);
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await db.image.delete({ where: { id: imageId } });
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// GET IMAGE
export async function getImageById(imageId: string): Promise<ImageType | null> {
  try {
    const image = await db.image.findUnique({ where: { id: imageId }, include: { author: true } });

    if (!image) throw new Error("Image not found");

    return image;
  } catch (error) {
    handleError(error);
    return null;
  }
}

// GET IMAGES

export interface ImageExtendedType extends ImageType {
  author?: { id: string; firstName: string; lastName: string };
}

export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}): Promise<{
  data: ImageExtendedType[];
  totalPage: number;
  savedImages: number;
}> {
  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imageist";
    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search.expression(expression).execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);
    const query = searchQuery ? [{ publicId: { in: resourceIds } }] : [];
    const images = await db.image.findMany({
      where: {
        AND: query,
      },

      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalImages = await db.image.count({
      where: {
        AND: query,
      },
    });

    const savedImages = await db.image.count(); // Assuming you want to count all images
    console.log(images);
    return {
      data: images,
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
    return {data:[], totalPage: 0, savedImages: 0};
  }
}

export async function getUserImages({ limit = 9, page = 1, userId }: { limit?: number; page: number; userId: string }): Promise<{
  data: ImageType[];
  totalPages: number;
}> {
  try {
    const skipAmount = (page - 1) * limit;

    const images = await db.image.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: skipAmount,
      take: limit,
    });

    const totalImages = await db.image.count({
      where: {
        authorId: userId,
      },
    });

    return {
      data: images,
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
    return {data:[], totalPages: 0};
  }
}
