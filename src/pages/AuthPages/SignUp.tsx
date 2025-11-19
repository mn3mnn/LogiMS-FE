import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Kresh GmbH MS"
        description="Create an account for Kresh GmbH Management System"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
