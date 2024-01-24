"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import { v2 as cloudinary } from "cloudinary";
import { AddImageParams, UpdateImageParams } from "@/types";

// ADD IMAGE
export async function _addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}
//////////
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    const author = await db.user.findUnique({ where: { id: userId } });

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author.id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE IMAGE
/*
export async function _updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(imageToUpdate._id, image, { new: true });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}*/
//////////
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
export async function getImageById(imageId: string) {
  try {
    const image = await db.image.findUnique({ where: { id: imageId } });

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES
export async function _getAllImages({ limit = 9, page = 1, searchQuery = "" }: { limit?: number; page: number; searchQuery?: string }) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imaginify";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search.expression(expression).execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    // const images = await populateUser(Image.find(query)).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      // data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}
// GET IMAGES

export async function getAllImages({ limit = 9, page = 1, searchQuery = "" }: { limit?: number; page: number; searchQuery?: string }) {
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
      orderBy: { updateAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalImages = await db.image.count({
      where: {
        AND: query,
      },
    });

    const savedImages = await db.image.count(); // Assuming you want to count all images

    return {
      data: images,
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}
export async function getUserImages({ limit = 9, page = 1, userId }: { limit?: number; page: number; userId: string }) {
  try {
    const skipAmount = (page - 1) * limit;

    const images = await db.image.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        updateAt: "desc",
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
  }
}
