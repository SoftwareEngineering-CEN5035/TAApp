'use client';

import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

type Application = {
    ID: string;
	UploaderID: string;
	UploaderName: string;
	CourseAppliedID: string;
    CourseName: string
	FileURL: string;
    PreviousExperience: boolean;
	Status: string;
}

export default function PendingApplications(){
    let [loading, setLoading] = useState(false);
    let [applications, setApplications] = useState<Array<Application>>([]);
    const baseUrl = 'http://localhost:9000';

    const fetchForms = async () => {
        try {
            setLoading(true)
            await axios.get(`${baseUrl}/departmentPendingForms`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
              }).then((res: AxiosResponse) => {
          setApplications(res.data);
          });
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchForms();
        }, []);

    return (
        <div className="w-[100%] h-[100%] flex bg-slate-50 items-center flex-col">
        {loading && <p className='text-black text-xl font-bold'>Loading...</p>}
        {!loading &&
            <>
                <h1 className="capitalize text-3xl font-bold mt-3 absolute left-24 top-24 text-[#1C160C] tracking-light leading-tight ">Reviewed Applications</h1>
                <div className="absolute w-[100%] bg-slate-50 pl-14 pt-4 h-[100%] grid grid-cols-4 max-[1000px]:grid-cols-3 max-[500px]:grid-cols-1 gap-y-5 min-h-[50vh] mt-[10vh]">
                {applications?.map((form) => ( 
                    <div className="h-[375px] w-[250px] hover:bg-slate-300 hover:cursor-pointer text-center rounded-lg">
                        <iframe src={form.FileURL} className="rounded-xl hover:cursor-pointer w-[100%] h-[70%]"/>
                        <p className="text-xl text-[#1C160C] font-normal leading-normal">Application</p>
                        <p className="text-md text-base font-medium leading-normal">{form.UploaderName}</p>
                        <p className="text-md text-base font-medium leading-normal">{form.CourseAppliedID}</p>
                        <p className="text-md text-base font-medium leading-normal">{form.Status}</p>
                    </div>
                ))}
                </div>
            </>
        }
    </div>
    )
}