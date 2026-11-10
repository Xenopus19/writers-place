import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import LoginForm from "./LoginForm";
import type { LoginInfoType } from "./LoginSchema";

const Login = () => {
  const { login } = useLogin();

  const handleLogin = async (data: LoginInfoType) => {
    try {
      await login(data);
    } catch  {
    
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-220px)] items-center justify-center bg-[#fcfbf9] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e8e5de] bg-white p-8 shadow-sm transition-all sm:p-10">
        
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl font-normal tracking-tight text-[#2d3a2e]">
            Log into existing account
          </h1>
          <p className="text-sm text-[#6b7280]">
            If you don't have an account,{" "}
            <Link
              to="/signup"
              className="font-medium text-[#2d3a2e] underline underline-offset-4 transition-colors hover:text-[#374333]"
            >
              create one
            </Link>
            .
          </p>
        </div>

        {/* Форма */}
        <LoginForm onSubmit={handleLogin} />

      </section>
    </div>
  );
};

export default Login;