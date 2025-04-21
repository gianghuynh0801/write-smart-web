
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      aria-label="Back to top"
      onClick={handleClick}
      className={`fixed right-5 bottom-8 z-40 bg-primary text-white rounded-full shadow-lg p-3 transition-all duration-300 hover:scale-110
        ${show ? "opacity-100 pointer-events-auto animate-fade-in" : "opacity-0 pointer-events-none"}
      `}
      style={{ boxShadow: "0 6px 24px 0 rgba(30,44,92,0.12)" }}
      tabIndex={show ? 0 : -1}
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTop;
