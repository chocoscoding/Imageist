import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { currentUser } from "@/lib/auth";
import { SearchParamProps, TransformationTypeKey } from "@/types";
import { redirect } from "next/navigation";

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const current_user = await currentUser();
  const transformation = transformationTypes[type];

  if (!current_user) redirect("/sign-in");

  const user = await getUserById(current_user.id);

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={current_user.id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user?.creditBalance || 0}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
