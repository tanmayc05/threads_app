import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";

async function Page() {
    const user = await currentUser();
    console.log(user?.id);

    if (!user) {
        redirect("/sign-in");
        return;
    }

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    }

    return (
        <>
        <h1 className="head-text">Create Thread</h1>
        <PostThread userId = {userInfo._id}/>
        </>
    );
}

export default Page;