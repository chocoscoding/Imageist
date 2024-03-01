"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";

import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
import { formUrlQuery } from "@/lib/utils";

import { Button } from "../ui/button";

import { Search } from "./Search";
import { TransformationTypeKey } from "@/types";
import { ImageExtendedType } from "@/lib/actions/image.actions";
import { useSession } from "next-auth/react";

export const Collection = ({
  hasSearch = false,
  images,
  totalPages = 1,
  page,
}: {
  images: Array<ImageExtendedType>;
  totalPages?: number;
  page: number;
  hasSearch?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  // PAGINATION HANDLER
  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            <Card
              image={image}
              key={image.id}
            />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">{status === "authenticated" ? "Empty List" : "Login to create/edit images"}</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1}
              className="collection-btn"
              onClick={() => onPageChange("prev")}>
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages}>
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

const Card = ({ image }: { image: ImageExtendedType }) => {
  return (
    <li>
      <Link
        href={`/transformations/${image.id}`}
        className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width || 0}
          height={image.height || 0}
          {...(image.config as object)}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">{image.title}</p>
          <Image
            src={`/assets/icons/${transformationTypes[image.transformationType as TransformationTypeKey].icon}`}
            alt={image.title}
            width={24}
            height={24}
          />
        </div>
      </Link>
    </li>
  );
};
