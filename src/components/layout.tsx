import Blog from "@/app/blog/page";
import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      {children}

      {/* <Blog /> */}
    </>
  );
};
export default Layout;
