'use client';

import { useEffect, useState } from 'react';
import DepartmentNavbar from '../navbars/departmentNavbar';
import Courses from './pagesDirectory/courses';
import Applications from './pagesDirectory/applications';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState('course'); 

  // useEffect(() => {
  //   const authToken = localStorage.getItem('authToken');
  //   if (!authToken) {
  //     router.push('/'); // Redirect to home if not authenticated
  //   }
  // }, [router]);

  const renderBodyContent = () => {
    switch (selectedPage) {
      case 'course':
        return <Courses/>;
      case 'application':
        return <Applications />;
    }
  };
    
  return (
    <div className="h-[100%] absolute w-[100vw] flex flex-col items-center">
      <DepartmentNavbar setSelectedPage={setSelectedPage}  selectedPage={selectedPage}/>
      {renderBodyContent()}
    </div>
  );
};

export default DashboardPage;
