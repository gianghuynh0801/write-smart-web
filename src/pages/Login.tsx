
import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import LoginPageContent from "@/components/auth/LoginPageContent";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LoginPageContent />
      <Footer />
    </div>
  );
};

export default Login;
