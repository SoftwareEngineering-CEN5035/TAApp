'use client';
import { IoIosAdd } from "react-icons/io";
import { useState, useEffect } from 'react';
import { GrView } from "react-icons/gr";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useRouter } from "next/navigation";

// Course Object for reference
// type Course {
//     ID: String,
//     Name: String,
//     Type: String,
//     InstructorName: String,
//     InstructorId: String, 
//     TaList: Array,
// }

function CourseView({ course, onClose }){
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
    let [course, selectedCourse] = useState();
    let [toggleView, setToggledView] = useState(false);
    const router = useRouter();
    let [courses, setCourses] = useState(
        [
            {
                ID: "C001",
                Name: "Introduction to Programming",
                Type: "Core",
                InstructorName: "Dr. John Doe",
                InstructorId: "I001",
                TaList: ["Alice Johnson", "Bob Smith"],
              },
              {
                ID: "C002",
                Name: "Data Structures and Algorithms",
                Type: "Core",
                InstructorName: "Dr. Jane Doe",
                InstructorId: "I002",
                TaList: ["Charlie Brown", "Dana White"],
              },
              {
                ID: "C005",
                Name: "Software Engineering",
                Type: "Core",
                InstructorName: "Dr. Peter Parker",
                InstructorId: "I005",
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
          alert("Failed to fetch courses. Please try again later.");
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleView = (course) => {
        setToggledView(true);
        selectedCourse(course);
      };
    
    const handleEdit = (courseID) => {
        console.log(`Edit clicked for course: ${courseID}`);
    };

    const handleDelete = async (courseID) => {
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
    
    return (
        <div className="w-[100%] h-[100%] flex bg-slate-200 text-center items-center flex-col">
            {loading && <p className='text-black text-xl font-bold'>Loading...</p>}
            {!loading &&
            <>
            <h1 className="capitalize text-3xl font-bold mt-3">Courses</h1>
            <button className="bg-green-500 hover:bg-green-600 left-20 mt-[5vh] absolute cursor-pointer text-white px-3 py-1 rounded-lg"
                onClick={handleAdd}
            > <IoIosAdd/> </button>
            <table className="table-auto border-collapse border mt-6 border-gray-400 w-[90%] text-left">
                <thead>
                <tr>
                    <th className="border border-gray-400 px-4 py-2">Course ID</th>
                    <th className="border border-gray-400 px-4 py-2">Course Type</th>
                    <th className="border border-gray-400 px-4 py-2">Course Name</th>
                    <th className="border border-gray-400 px-4 py-2">Instructor</th>
                </tr>
                </thead>
                <tbody>
                {courses.map((course) => (
                    <tr key={course.ID} className="hover:bg-gray-100">
                        <td className="border border-gray-400 px-4 py-2">{course.ID}</td>
                        <td className="border border-gray-400 px-4 py-2">{course.Type}</td>
                        <td className="border border-gray-400 px-4 py-2">{course.Name}</td>
                        <td className="border border-gray-400 px-4 py-2">{course.InstructorName}</td>
                        <td className="border border-gray-400 px-4 py-2">
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