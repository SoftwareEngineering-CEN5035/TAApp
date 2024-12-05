"use client";

import { useEffect, useState } from "react";
import DepartmentNavbar from "../../navbars/departmentNavbar";
import Courses from "../pagesDirectory/courses";
import Applications from "../pagesDirectory/applications";
import { useRouter } from "next/navigation";

const DashboardPage = ({ params }) => {
  const item = params.item || "course";
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState(item);

  // useEffect(() => {
  //   const authToken = localStorage.getItem('authToken');
  //   if (!authToken) {
  //     router.push('/');
  //   }

  //   if (item) {
  //     localStorage.setItem("previousDashboardItem", item);
  //   }
  // }, [router, item]);

  const renderBodyContent = () => {
    switch (selectedPage) {
      case "course":
        return <Courses />;
      case "application":
        return <Applications />;
    }
  };

  return (
    <div className="h-[100%] absolute w-[100vw] flex flex-col items-center">
      <DepartmentNavbar
        setSelectedPage={setSelectedPage}
        selectedPage={selectedPage}
      />
      {renderBodyContent()}
    </div>
  );
};

export default DashboardPage;
