import { SignUp } from "@clerk/clerk-react";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full">
        <SignUp routing="path" path="/register" signInUrl="/login" />
      </div>
    </div>
  );
};

export default Register;
