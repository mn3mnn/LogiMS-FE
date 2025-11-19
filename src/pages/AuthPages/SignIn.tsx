import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {


  return (
    <>
      <PageMeta
        title="Sign In | Kresh GmbH MS"
        description="Sign in to Kresh GmbH Management System"
      />
      
      <AuthLayout>
        <SignInForm />
      </AuthLayout>

    </>
  );
}
