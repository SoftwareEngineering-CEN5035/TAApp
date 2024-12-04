'use client';
import axios from "axios";
import Select from 'react-select';
import { IoSaveOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";

//  type Course {
    //     ID: String,
    //     Name: String,
    //     Type: String,
    //     InstructorName: String,
    //     InstructorId: String, 
    //     TaList: Array,
    // }

// Create base form, figure out how to get list of Ta Names - probably create new endpoint
export default function CreateCourse(){
    const router = useRouter();
    let [name, setName] = useState('');
    let [type, setType] = useState('');
    let [instructorName, setInstructorName] = useState('');
    let [instructorId, setInstructorId] = useState('');
    let [selectedTAs, setSelectedTAs] = useState([]);
    const baseUrl = "http://localhost:8080";

    let [taList, setTaList] = useState([
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]);
    let[professorList, setProfessorList] = useState([
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]);   

    const typeList = [
        { value: 'core', label: 'Core' },
        { value: 'elective', label: 'Elective' }
    ]

    const fetchUsersByRole = async (role) => {
        try {
            const response = await axios.get(`${baseUrl}/users/${role}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error; 
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const taResult = await fetchUsersByRole('TA');
                const professorResult = await fetchUsersByRole('Professor');

                setTaList(taResult.map(user => ({
                    value: user.ID, 
                    label: user.Name
                })));

                setProfessorList(professorResult.map(user => ({
                    value: user.ID, 
                    label: user.Name
                })));
            } catch (error) {
                console.error('Error fetching user roles:', error);
            }
        };

        fetchData();
    }, []);


    const handleSubmit = async () => {
        if(name.trim().length === 0 || type.trim().length() === 0 || instructorName.trim().length() === 0 || selectedTAs.length() === 0){
            return alert('Please Fill Inputs')
        }
        const data = {
            Name: name,
            Type: type,
            InstructorName: instructorName,
            TaList: selectedTAs,
            InstructorID: instructorId
        }

        try {
            const response = await axios.post(`${baseUrl}/courses`, data);
    
            console.log('Course created successfully:', response.data);
            router.push(`/departmentDashboard`);
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course. Please try again.');
        }
    }

    const handleTAChange = (selectedOptions) => {
        setSelectedTAs(selectedOptions || []);
        console.log("Selected TAs: ", selectedOptions);
      };

    const handleProfessorChange = (selectedOption) => {
        const { value, label } = selectedOption;
        setInstructorName(label);
        setInstructorId(value);
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption);
    }

    const handleBackButton = () => {
        let item = localStorage.getItem("previousDashboardItem");
        router.push(`/departmentDashboard/${item}`)
    }

    return (
        <div className='w-[100%] h-[100%] flex bg-blue-400 justify-center items-center'>
            <IoMdArrowBack className="absolute text-black text-3xl left-10 top-10 hover:cursor-pointer hover: hover:text-gray-700" onClick={handleBackButton}/>
            <form onSubmit={handleSubmit} className="bg-slate-100 max-[500px]:w-[90vw] border-black border-4 rounded-md items-center shadow-md h-[70vh] w-[30vw] flex flex-col">
                <label className='text-4xl font-light max-[500px]:text-3xl mt-2 underline underline-offset-8'>Create new Course</label>
                <label className="mt-5 text-lg font-extralight">Class Name</label>
                <input type="text" className="border-b-2 bg-slate-100 focus:bg-white focus:outline-none focus:border-b-2 focus:border-blue-500 border-gray-600 mt-1" placeholder="Name" required onChange={(e) => setName(e.target.value)}></input>

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Professor</label>
                <Select
                    closeMenuOnSelect={false}
                    options={professorList}
                    onChange={handleProfessorChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select a Professor"
                />

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Class Type</label>
                <Select
                    closeMenuOnSelect={false}
                    options={typeList}
                    onChange={handleTypeChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select a class type"
                />

                <label className="mt-5 text-lg font-extralight max-[500px]:mt-7">Teacher's Assitants</label>
                <Select
                    closeMenuOnSelect={false}
                    isMulti
                    options={taList}
                    onChange={handleTAChange}
                    className="mt-1 w-[20vw] max-[500px]:w-[55vw]"
                    required
                    placeholder="Please select TAs"
                />
                <button type="submit" className="bg-blue-500 max-[500px]:mt-10 max-[500px]:w-[20vw] hover:bg-blue-600 text-white text-2xl flex justify-center mt-7 items-center w-[5vw] h-[35px] rounded-lg pointer"> <IoSaveOutline/></button>
            </form>
        </div>
    )
}