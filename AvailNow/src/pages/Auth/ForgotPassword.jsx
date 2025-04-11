import { SignIn } from "@clerk/clerk-react";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full">
        <SignIn
          routing="path"
          path="/forgot-password"
          signUpUrl="/register"
          initialStep="forgot_password"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
