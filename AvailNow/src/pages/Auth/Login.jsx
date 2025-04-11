import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full">
        <SignIn routing="path" path="/login" signUpUrl="/register" />
      </div>
    </div>
  );
};

export default Login;
