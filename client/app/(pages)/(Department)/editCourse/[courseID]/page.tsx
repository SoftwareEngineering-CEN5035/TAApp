'use client';
import axios, { AxiosResponse } from "axios";
import Select from 'react-select';
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { IoSaveOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";

type Course = {
    ID: string,
    Name: string,
    Type: string,
    InstructorName: string,
    InstructorID: string, 
    TaList: Array<string>,
    TaIDList: Array<string>,
}

type SelectOption = {
    value: string; 
    label: string;
};

// Create base form, figure out how to get list of Ta Names - probably create new endpoint
export default function EditCourse({ params }){
    const router = useRouter();
    const courseId = params.courseID;
    let [name, setName] = useState('');
    let [type, setType] = useState('');
    let [instructorName, setInstructorName] = useState('');
    let [instructorId, setInstructorId] = useState('');
    let [selectedTAs, setSelectedTAs] = useState([]);
    let [selectedTAIDs, setSelectedIDs] = useState([]);
    let [loading, setLoading] = useState(false);

    let [course, setCourse] = useState<Course>();
    const baseUrl = "http://localhost:9000";

    let [taList, setTaList] = useState<SelectOption[]>([])   

    let [professorList, setProfessorList] = useState<SelectOption[]>([]);   

    const typeList = [
        { value: 'core', label: 'Core' },
        { value: 'elective', label: 'Elective' }
    ]

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log("logged in");
                } else {
                    router.push('/login')
                }
            });
    
            return () => unsubscribe();
      }, [router]);

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

    const fetchCourse = async (courseId: string) => {
        try {
            await axios.get(`${baseUrl}/courses/${courseId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
              }).then((res: AxiosResponse) => {
                const courseData: Course = res.data; 
                setCourse(courseData); 
                setName(courseData?.Name || ""); 
                setType(courseData?.Type || "");
                setInstructorName(courseData?.InstructorName || "");
                setInstructorId(courseData?.InstructorID || "");
                setSelectedTAs(courseData?.TaList || []);
            });
        } catch (error) {
            console.error('Error fetching course by ID:', error);
            throw error; 
        }
    };

    useEffect(() => {
        const fetchOptionsData = async () => {
            try {
                
                const taResult = await fetchUsersByRole('TA');
                const professorResult = await fetchUsersByRole('Professor');

                setTaList([
                    ...Array.isArray(taResult) ? taResult.map(user => ({
                        value: user.ID,
                        label: user.Name
                    })) : [{ value: "Empty", label: "Empty" }]
                ]);
        
                // Ensure professorResult is an array
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
        setLoading(false);
        fetchOptionsData();

        fetchCourse(courseId);
    }, []);


    const handleSubmit = async () => {   
        const editedData: Course = {
            ID: courseId,
            Name: name,
            Type: type,
            InstructorName: instructorName,
            TaList: selectedTAs,
            InstructorID: instructorId,
            TaIDList: selectedTAIDs
        };

        try {
            await axios.patch(`${baseUrl}/courses`, editedData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
              }).then((res : AxiosResponse) => {
                console.log('Course created successfully:', res.data);
                router.push(`/departmentDashboard/course`);
            });
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course. Please try again.');
        }
    }

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
        if(selectedOption.value === "Empty"){
            return;
        }
        const { value, label } = selectedOption;
        setInstructorName(label);
        setInstructorId(value);
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption.value);
    }

    const handleBackButton = () => {
        router.push(`/departmentDashboard/course`);
    }

    const isFormChanged = () => {
        return (
            name !== course?.Name &&
            type !== course?.Type &&
            instructorName !== course?.InstructorName &&
            instructorId !== course?.InstructorID &&
            JSON.stringify(selectedTAs) !== JSON.stringify(course?.TaList)
        );
    };

    const mapTaList = (taIds: string[]) => {
        return taIds.map(taId => {
            const ta = taList.find(ta => ta.value === taId);
            return ta ? ta : null; 
        }).filter(ta => ta !== null); 
    };

    return (
        <div className='w-[100%] h-[100%] flex bg-gray-400 justify-center items-center'>
            <IoMdArrowBack className="absolute text-black text-3xl left-10 top-10 hover:cursor-pointer hover: hover:text-gray-700" onClick={handleBackButton}/>
            <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}} className="bg-slate-100 max-[500px]:w-[90vw] border-black border-4 rounded-md items-center shadow-md h-[70vh] w-[30vw] flex flex-col">
                {loading && <p className="text-2xl text-center mt-10">Loading...</p>}
                {!loading && course !== undefined && 
                <>
                    <label className='text-4xl font-light max-[500px]:text-3xl mt-2 underline underline-offset-8'>Edit Course</label>
                    <label className="mt-5 text-lg font-extralight">Class Name</label>
                    <input value={name} type="text" className="border-b-2 bg-slate-100 focus:bg-white focus:outline-none focus:border-b-2 focus:border-blue-500 border-gray-600 mt-1" placeholder="Name" required onChange={(e) => setName(e.target.value)}></input>

                    <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Professor</label>
                    <Select
                        closeMenuOnSelect={true}
                        options={professorList}
                        defaultValue={ {value: course?.InstructorID, label: course?.InstructorName}}
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
                        defaultValue={ {value: course?.Type, label: course?.Type} }
                        required
                        placeholder="Please select a class type"
                    />

                    <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Teacher's Assitants</label>
                    <Select
                        closeMenuOnSelect={false}
                        isMulti
                        options={taList}
                        defaultValue={mapTaList(course?.TaList)}
                        onChange={handleTAChange}
                        className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                        required
                        placeholder="Please select TAs"
                    />
                    <button type="submit"  className="bg-blue-500 hover:cursor-pointer max-[500px]:mt-10 max-[500px]:w-[20vw] hover:bg-blue-600 text-white text-2xl flex justify-center mt-7 items-center w-[15vw] h-[35px] rounded-lg pointer"> <IoSaveOutline/></button>
                </>
                }
            </form>
        </div>
    )
}