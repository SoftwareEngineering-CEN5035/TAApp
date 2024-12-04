'use client';
import { IoIosAdd } from "react-icons/io";
import { useState, useEffect } from 'react';
import { GrView } from "react-icons/gr";
import Select from 'react-select';
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import axios from "axios";

type Course = {
  ID: String,
  Name: String,
  Type: String,
  InstructorName: String,
  InstructorID: String, 
  TaList: Array<string>,
}

type CourseViewProps = {
  course: Course; 
  onClose: () => void; 
};

type SelectOption = {
  value: string; 
  label: string;
};

function CourseView({ course, onClose }: CourseViewProps){
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
            <h2 className="text-2xl font-bold mb-4">{course.Name}</h2>
            <p><strong>Course ID:</strong> {course.ID}</p>
            <p><strong>Type:</strong> {course.Type}</p>
            <p><strong>Instructor:</strong> {course.InstructorName}</p>
            <p><strong>TA List:</strong> {course.TaList.join(", ")}</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      );
}

export default function Courses(){
    let [loading, setLoading] = useState(false);
    let [course, selectedCourse] = useState<Course>();
    let [toggleView, setToggledView] = useState(false);
    let [taList, setTaList] = useState<SelectOption[]>([]);
    let [taFilter, setTaFilter] = useState('');
    const router = useRouter();
    let [courses, setCourses] = useState(
        [
            {
                ID: "C001",
                Name: "Introduction to Programming",
                Type: "Core",
                InstructorName: "Dr. John Doe",
                InstructorID: "I001",
                TaList: ["Alice Johnson", "Bob Smith"],
              },
              {
                ID: "C002",
                Name: "Data Structures and Algorithms",
                Type: "Core",
                InstructorName: "Dr. Jane Doe",
                InstructorID: "I002",
                TaList: ["Charlie Brown", "Dana White"],
              },
              {
                ID: "C005",
                Name: "Software Engineering",
                Type: "Core",
                InstructorName: "Dr. Peter Parker",
                InstructorID: "I005",
                TaList: ["Ivy Adams", "Jack Wilson"],
              },
        ]
    )

    const baseUrl = 'http://localhost:8080'

    const fetchCourses = async () => {
        try {
            setLoading(true)
          const response = await axios.get(`${baseUrl}/courses`);
          setCourses(response.data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
    };

    const fetchUsersByRole = async (role: string) => {
        try {
            const response = await axios.get(`${baseUrl}/users/${role}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error; 
        }
    };

    const fetchTAListData = async () => {
      try {
          const taResult = await fetchUsersByRole('TA');
          setTaList(taResult.map(user => ({
              value: user.ID, 
              label: user.Name
          })));
      } catch (error) {
          console.error('Error fetching user roles:', error);
      }
  };

    useEffect(() => {

    fetchTAListData();
    fetchCourses();
    
    }, [fetchCourses, fetchTAListData]);

    const handleView = (course: Course) => {
        setToggledView(true);
        selectedCourse(course);
      };
    
    const handleEdit = (courseID: string) => {
        router.push(`/editCourse/${courseID}`);
    };

    const handleDelete = async (courseID: string) => {
        try {
            await axios.delete(`${baseUrl}/courses/${courseID}`);
            
            const updatedCourses = courses.filter((course) => course.ID !== courseID);
            setCourses(updatedCourses);

            console.log(`Course ${courseID} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting course ${courseID}:`, error);
            alert("Failed to delete the course. Please try again.");
        }
    };

    const handleCloseView = () => {
        setToggledView(false);
        selectedCourse(null);
      };

    const handleAdd = () => {
        router.push('/createCourse');
    }
    
    const handleTAChange = async (selectedOptions: SelectOption) => {
        setTaFilter(selectedOptions.value);

        try {
            setLoading(true)
          const response = await axios.get(`${baseUrl}/coursesByTA/:${taFilter}`);
          setCourses(response.data);
        } catch (error) {
          console.error("Error fetching courses:", error);
          alert("Failed to fetch courses. Please try again later.");
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="w-[100%] h-[100%] flex bg-slate-50 text-center items-center flex-col">
            {loading && <p className='text-black text-xl font-bold'>Loading...</p>}
            {!loading &&
            <>
            <h1 className="capitalize text-3xl font-bold mt-3">Courses</h1>
            <button className="bg-green-500 hover:bg-green-600 left-20 max-[500px]:left-3 mt-[5vh] absolute cursor-pointer text-white px-3 py-1 rounded-lg"
                onClick={handleAdd}
            > <IoIosAdd/> </button>
            <div className="absolute mt-[3vh] right-20">
                <Select placeholder="Filter By TA" onChange={handleTAChange}  closeMenuOnSelect={true} isClearable={true} options={taList}/>
            </div>

            <table className="table-auto border-collapse border mt-6 max-[500px]:w-[95%] overflow-x-auto border-gray-400 w-[90%] text-left">
                <thead>
                <tr>
                    <th className="border border-gray-400 px-4 py-2 max-[500px]:px-1">Course ID</th>
                    <th className="border border-gray-400 px-4 py-2 max-[500px]:px-1">Course Type</th>
                    <th className="border border-gray-400 px-4 py-2 max-[500px]:px-1">Course Name</th>
                    <th className="border border-gray-400 px-4 py-2 max-[500px]:px-1">Instructor</th>
                </tr>
                </thead>
                <tbody>
                {courses.map((course) => (
                    <tr key={course.ID} className="hover:bg-gray-100">
                        <td className="border border-gray-400 px-4 py-2 max-[500px]:px-1">{course.ID}</td>
                        <td className="border border-gray-400 px-4 py-2 max-[500px]:px-1">{course.Type}</td>
                        <td className="border border-gray-400 px-4 py-2 max-[500px]:px-1">{course.Name}</td>
                        <td className="border border-gray-400 px-4 py-2 max-[500px]:px-1">{course.InstructorName}</td>
                        <td className="border border-gray-400 px-4 py-2 max-[500px]:px-1">
                            <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-blue-600"
                            onClick={() => handleView(course)}
                            >
                            <GrView />
                            </button>
                            <button
                            className="bg-slate-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-slate-600"
                            onClick={() => handleEdit(course.ID)}
                            >
                            <FiEdit2 />
                            </button>
                            <button
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                            onClick={() => handleDelete(course.ID)}
                            >
                            <RiDeleteBin5Line />
                            </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <p className="text-black text-sm font-light ml-[75vw] mt-3">Displaying {courses.length} entries</p>
            {toggleView && <CourseView course={course} onClose={handleCloseView}/>}
            </>}
        </div>
    )
}