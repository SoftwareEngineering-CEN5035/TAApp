'use client';

import { useState, useEffect } from "react";
import Select from 'react-select';
import { useRouter } from "next/navigation";
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

type SelectOption = {
    value: string; 
    label: string;
};

export default function Applications(){
    const router = useRouter();
    let [loading, setLoading] = useState(false);
    let [taFilter, setTAFilter] = useState('');
    let [taList, setTAList] = useState<SelectOption[]>([]);
    let [applications, setApplications] = useState<Array<Application>>([]);
    const baseUrl = 'http://localhost:9000';

    const fetchForms = async () => {
        try {
            setLoading(true)
            await axios.get(`${baseUrl}/newForms`, {
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

    const fetchUsersByRole = async (role: string) => {
        try {
            const response = await axios.get(`${baseUrl}/users/${role}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
              });
            return response.data;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error; 
        }
    };

    const fetchTaList = async () => {
        try {
            const taResult = await fetchUsersByRole('TA');
            setTAList([
            { value: "Clear", label: "Clear" }, 
            ...taResult.map(user => ({
                value: user.ID,
                label: user.Name
            }))
        ]);
        } catch (error) {
            console.error('Error fetching user roles:', error);
        }
    };
    
    useEffect(() => {
        fetchForms();
        fetchTaList();
        }, []);

    const handleTAChange = async (selectedOptions: SelectOption) => {
        if(selectedOptions.value === "Clear"){
            fetchForms();
        }
        setTAFilter(selectedOptions.value);

        try {
            setLoading(true)
            await axios.get(`${baseUrl}/departmentForms/${taFilter}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
              }).then((res: AxiosResponse) => {
            setApplications(res.data);
          });
        } catch (error) {
          console.error("Error fetching forms:", error);
        } finally {
          setLoading(false);
        }
    };

    const applicationRedirect = (formId: string) => {
        router.push(`/formView/${formId}`);
    }

    return (
        <div className="w-[100%] h-[100%] flex bg-slate-50 items-center flex-col">
        {loading && <p className='text-black text-xl font-bold'>Loading...</p>}
        {!loading &&
            <>
                <h1 className="capitalize text-3xl font-bold mt-3 absolute left-24 top-24 text-[#1C160C] tracking-light leading-tight ">Applications</h1>

                <div className="absolute left-24 top-48 items-start align-baseline justify-start">
                    <h1 className="text-lg font-normal tracking-light leading-tight">Sort By</h1>
                    <Select placeholder="Teacher's Assistant" className="w-[15vw] mt-2" onChange={handleTAChange}  closeMenuOnSelect={true} isClearable={true} options={taList}/>
                </div>

                <h1 className="text-2xl tracking-light leading-tight font-bold absolute left-24 top-72 mt-[5vh]">New Applications to Review</h1>
                
                <div className="absolute w-[100%] bg-slate-50 pl-14 pt-4 h-[100%] grid grid-cols-4 max-[1000px]:grid-cols-3 max-[500px]:grid-cols-1 gap-y-5 min-h-[50vh] mt-[40vh]">
                {applications?.map((form) => ( 
                    <div className="h-[425px] w-[250px] hover:bg-slate-300 hover:cursor-pointer text-center rounded-lg" onClick={() => applicationRedirect(form.ID)}>
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