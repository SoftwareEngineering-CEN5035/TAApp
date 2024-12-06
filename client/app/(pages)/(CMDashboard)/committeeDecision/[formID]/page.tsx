


'use client';
import axios, { AxiosResponse } from "axios";
import Select, { SingleValue } from 'react-select';
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { IoSaveOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";

// Define the Application type
type Application = {
    ID: string;
    UploaderID: string;
    UploaderName: string;
    CourseAppliedID: string;
    CourseName: string;
    FileURL: string;
    PreviousExperience: boolean;
    Status: string;
}

// Define the Select option type
type SelectOption = {
    value: string; 
    label: string;
};

// Define the component props
type CommitteeDecisionProps = {
    params: {
        formID: string;
    };
};

// Define the component
export default function CommitteeDecision({ params }: CommitteeDecisionProps) {
    const router = useRouter();
    const formId = params.formID;

    // State management
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<SelectOption | null>(null); 
    const [form, setForm] = useState<Application | undefined>(undefined);
    const baseUrl = "http://localhost:9000";

    // Status options for the dropdown
    const statusOptions: SelectOption[] = [
        { value: 'Approve', label: 'Approve' },
        { value: 'Decline', label: 'Decline' }
    ];

    // Authentication check
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("logged in");
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch form data by ID
    const fetchFormById = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/forms/${formId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
            });
            setForm(response.data);
            // Initialize the status state with the fetched form's status
            const currentStatus = statusOptions.find(option => option.value === response.data.Status) || null;
            setStatus(currentStatus);
        } catch (error) {
            console.error("Error fetching form:", error);
            alert('Failed to fetch the form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch the form data when the component mounts
    useEffect(() => {
        fetchFormById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle status change from the Select component
    const handleStatusChange = (selectedOption: SingleValue<SelectOption>) => {
        setStatus(selectedOption);
    };

    // Handle form submission
    const handleSubmit = async (update: string) => {   
        // Prepare the data to be updated
        const editedData = {
            Status: update
        };

        try {
            setLoading(true);
            // Send PATCH request to update only the Status field
            await axios.patch(`${baseUrl}/forms/${formId}`, editedData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Token")}`,
                },
            }).then((res: AxiosResponse) => {
                console.log('Status updated successfully:', res.data);
                alert('Status updated successfully!');
                router.push(`/departmentDashboard/course`);
            });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Handle back button click
    const handleBackButton = () => {
        router.push(`/committeeDashboard/applications`);
    }

    return (
        <div className='w-full h-full flex bg-gray-400 justify-center items-center'>
            <IoMdArrowBack 
                className="absolute text-black text-3xl left-10 top-10 hover:cursor-pointer hover:text-gray-700" 
                onClick={handleBackButton}
            />
            <form 
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (status) {
                        handleSubmit(status.value); // Pass the selected status to handleSubmit
                    } else {
                        alert('Please select a status before submitting.');
                    }
                }} 
                className="bg-slate-100 max-[500px]:w-[90vw] border-black border-4 rounded-md items-center shadow-md h-auto w-[30vw] flex flex-col p-6"
            >
                {loading ? (
                    <p className="text-2xl text-center mt-10">Loading...</p>
                ) : (
                    form && (
                        <>
                            <h2 className='text-4xl font-light max-[500px]:text-3xl mt-2 underline underline-offset-8'>Update Status</h2>
                            
                            <label className="mt-5 text-lg font-extralight">Status</label>
                            <Select
                                closeMenuOnSelect={true}
                                options={statusOptions}
                                value={status}
                                onChange={handleStatusChange}
                                className="mt-1 w-full max-w-xs"
                                required
                                placeholder="Select Status"
                            />
                            
                            <button 
                                type="submit"  
                                disabled={loading}
                                className={`bg-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} text-white text-2xl flex justify-center mt-7 items-center w-full max-w-xs h-12 rounded-lg`}
                            > 
                                <IoSaveOutline className="mr-2" />
                                Submit
                            </button>
                        </>
                    )
                )}
            </form>
        </div>
    );
}
