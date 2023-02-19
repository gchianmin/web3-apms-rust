import { useUser } from "@auth0/nextjs-auth0/client";
import Loading from "../components/Loading";
import { useRouter } from "next/router";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) return alert(error.message);

  if (user) {
    router.push("/main");
  } else {
    router.push("/pre-login");
  }
}
