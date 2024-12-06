"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import DepartmentNavbar from "../../navbars/departmentNavbar";
import Courses from "../pagesDirectory/courses";
import Applications from "../pagesDirectory/applications";
import { useRouter } from "next/navigation";
import PendingApplications from "../pagesDirectory/pendingApplications";

const DashboardPage = ({ params }) => {
  const item = params.item || "course";
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState(item);

  useEffect(() => {
    const auth = getAuth();
    if (item) {
      localStorage.setItem("previousDashboardItem", item);
    }
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log("logged in");
			} else {
				router.push('/login')
			}
		});

		return () => unsubscribe();
  }, [router, item]);

  const renderBodyContent = () => {
    switch (selectedPage) {
      case "course":
        return <Courses />;
      case "application":
        return <Applications />;
      case "pendingApplications":
        return <PendingApplications />;
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
