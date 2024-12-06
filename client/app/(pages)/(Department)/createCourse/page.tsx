'use client';
import axios from "axios";
import Select from 'react-select';
import { IoSaveOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "@firebase/auth";
import { auth } from "../../../_lib/firebase";
import { IoMdArrowBack } from "react-icons/io";

type CoursePostRequest = {
    Name: string;
    Type: string;
    InstructorName: string;
    InstructorID: string;
    TaList: Array<string>;
    TaIDList: Array<string>;
    Performance: string; // New field added
};

type SelectOption = {
    value: string;
    label: string;
};

export default function CreateCourse() {
    const router = useRouter();
    let [name, setName] = useState('');
    let [type, setType] = useState('');
    let [instructorName, setInstructorName] = useState('');
    let [instructorId, setInstructorId] = useState('');
    let [selectedTAs, setSelectedTAs] = useState([]);
    let [selectedIDs, setSelectedIDs] = useState([]);
    const baseUrl = "http://localhost:9000";

    let [taList, setTaList] = useState<SelectOption[]>([]);
    let [professorList, setProfessorList] = useState<SelectOption[]>([]);
    const [userRole, setUserRole] = useState<string>(''); // State to store user role
    const [performance, setPerformance] = useState<string>(''); // State to store performance value

    const typeList = [
        { value: 'core', label: 'Core' },
        { value: 'elective', label: 'Elective' }
    ];

    // Check user role in session storage and update the state
    useEffect(() => {
        const role = sessionStorage.getItem("userRole");
        if (role) {
            setUserRole(role); // Set user role from sessionStorage
        } else {
            // Default to some role or handle the case where no role is found
            setUserRole(''); // In case no role is found in sessionStorage
        }
    }, []);

    const fetchUsersByRole = async (role: string) => {
        try {
            const response = await axios.get(`${baseUrl}/users/${role}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching users by role:', role, error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch TAs and Professors data
                const taResult = await fetchUsersByRole('TA');
                const professorResult = await fetchUsersByRole('Instructor'); // Fetch "Instructor" for professors

                setTaList([
                    ...Array.isArray(taResult) ? taResult.map(user => ({
                        value: user.ID,
                        label: user.Name
                    })) : [{ value: "Empty", label: "Empty" }]
                ]);

                setProfessorList([
                    ...Array.isArray(professorResult) ? professorResult.map(user => ({
                        value: user.ID,
                        label: user.Name
                    })) : [{ value: "Empty", label: "Empty" }]
                ]);
            } catch (error) {
                console.error('Error fetching user roles:', error);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); 
        if (name.trim().length === 0 || type.trim().length === 0 || instructorName.trim().length === 0 || selectedTAs.length === 0) {
            return alert('Please Fill Inputs');
        }

        const data: CoursePostRequest = {
            Name: name,
            Type: type,
            InstructorName: instructorName,
            InstructorID: instructorId,
            TaList: selectedTAs,
            TaIDList: selectedIDs,
            Performance: performance || '', // Pass the performance (empty or updated)
        };

        try {
           await axios.post(`${baseUrl}/courses`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
            }).then(() => {
            router.push(`/departmentDashboard/course`);
            });

        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course. Please try again.');
        }
    };

    const handleTAChange = (selectedOptions: SelectOption[]) => {
        if (!selectedOptions || selectedOptions.some(option => option.value === "Empty")) {
            return;
        }

        const selectedValues = selectedOptions.map(option => option.value);
        const selectedLabel = selectedOptions.map(option => option.label);

        setSelectedIDs(selectedValues);
        setSelectedTAs(selectedLabel);
    };

    const handleProfessorChange = (selectedOption) => {
        const { value, label } = selectedOption;
        setInstructorName(label);
        setInstructorId(value);
    };

    const handleTypeChange = (selectedOption: SelectOption) => {
        setType(selectedOption.value);
    };

    const handleBackButton = () => {
        router.push(`/departmentDashboard/course`);
    };

    return (
        <div className='w-[100%] h-[100%] bg-slate-50 flex justify-center items-center'>
            <IoMdArrowBack className="absolute text-black text-3xl left-10 top-10 hover:cursor-pointer hover:text-gray-700" onClick={handleBackButton} />
            <form onSubmit={handleSubmit} className="max-[500px]:w-[90vw] gap-y-[1vh] border-black border-[1px] rounded-md items-center shadow-md h-[70vh] w-[50vw] max-[700px]:w-[70vw] flex flex-col">
                <label className='text-4xl font-light max-[500px]:text-3xl mt-2 underline underline-offset-8'>Create new Course</label>
                <label className="mt-5 text-lg font-extralight">Class Name</label>
                <input type="text" className="border-b-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-b-2 focus:border-blue-500 border-gray-600 mt-1" placeholder="Name" required onChange={(e) => setName(e.target.value)}></input>

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Professor</label>
                <Select
                    closeMenuOnSelect={true}
                    options={professorList}
                    onChange={handleProfessorChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select a Professor"
                />

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Class Type</label>
                <Select
                    closeMenuOnSelect={true}
                    options={typeList}
                    onChange={handleTypeChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select a class type"
                />

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Teacher's Assistants</label>
                <Select
                    closeMenuOnSelect={false}
                    isMulti
                    options={taList}
                    onChange={handleTAChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select TAs"
                />

                {/* Render performance field only if user is an instructor */}
                {userRole === 'instructor' && (
                    <div>
                        <label className="mt-5 text-lg font-extralight">Performance</label>
                        <input
                            type="text"
                            className="border-b-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-b-2 focus:border-blue-500 border-gray-600 mt-1"
                            placeholder="Enter performance data"
                            onChange={(e) => setPerformance(e.target.value)} // Manage performance value
                        />
                    </div>
                )}

                <button type="submit" className="bg-blue-500 max-[500px]:mt-10 max-[500px]:w-[20vw] hover:bg-blue-600 text-white text-2xl flex justify-center mt-7 items-center w-[10vw] h-[35px] rounded-lg pointer"> <IoSaveOutline /></button>
            </form>
        </div>
    );
}
