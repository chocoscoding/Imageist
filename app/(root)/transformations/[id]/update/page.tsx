import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";
import { currentUser } from "@/lib/auth";
import { SearchParamProps, TransformationTypeKey } from "@/types";

const Page = async ({ params: { id } }: SearchParamProps) => {
  const current_user = await currentUser();
  if (!current_user) redirect("/sign-in");

  const user = await getUserById(current_user.id);
  const image = await getImageById(id);

  if (!image) return <p>No image data found</p>;

  const transformation = transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user!.id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user!.creditBalance}
          config={JSON.parse(JSON.stringify(image.config))}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
