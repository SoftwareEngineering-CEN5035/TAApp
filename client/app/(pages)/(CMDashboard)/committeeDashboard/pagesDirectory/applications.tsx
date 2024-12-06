'use client';

import { useState, useEffect } from "react";
import Select, { SingleValue } from 'react-select';
import axios, { AxiosResponse } from "axios";
import { FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

type Application = {
    ID: string;
    UploaderID: string;
    UploaderName: string;
    CourseAppliedID: string;
    CourseName: string;
    FileURL: string;
    PreviousExperience: boolean;
    Status: string;
};

type SelectOption = {
    value: string; 
    label: string;
};

export default function Applications(){
    // State Variables
    const [loading, setLoading] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('Pending'); // Default status
    const [statusOptions, setStatusOptions] = useState<SelectOption[]>([
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
        // Add more statuses if needed
    ]);
    const [applications, setApplications] = useState<Array<Application>>([]);
    const [error, setError] = useState<string | null>(null); // For error handling
    const baseUrl = 'http://localhost:9000';

    const router = useRouter();

    // Function to fetch applications by status
    const fetchApplicationsByStatus = async (status: string) => {
        try {
            setLoading(true);
            setError(null);
           await axios.get(`${baseUrl}/forms/status`, {
                params: { status }, // Pass status as query parameter
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Token")}`, // Include JWT token
                },
            }).then((res: AxiosResponse) => {
        setApplications(res.data);
            })
        } catch (error) {
            console.error("Error fetching applications by status:", error);
            setError("Failed to fetch applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // useEffect to fetch applications when the component mounts and when statusFilter changes
    useEffect(() => {
        fetchApplicationsByStatus(statusFilter);
    }, [statusFilter]);

    // Handle status selection from the dropdown
    const handleStatusChange = (selectedOption: SingleValue<SelectOption>) => {
        if (selectedOption) {
            setStatusFilter(selectedOption.value);
        } else {
            // Optionally, handle the case when no status is selected
            setStatusFilter('Pending'); // Reset to default or any other logic
        }
    };

    // Define the styling for buttons (optional)
    const buttonStyle: React.CSSProperties = {
        fontSize: '0.8em',
        padding: '0.25em 0.5em'
    };

    // Sorting function based on selected criteria
    const handleSort = (criteria: keyof Application) => {
        const sorted = [...applications].sort((a, b) => {
            const aValue = a[criteria] ? a[criteria].toString() : '';
            const bValue = b[criteria] ? b[criteria].toString() : '';
            return aValue.localeCompare(bValue, 'en', { numeric: true, sensitivity: 'base' });
        });
        setApplications(sorted);
    };

    const handleEdit = (formID: string) => {
        router.push(`/committeeDecision/${formID}`);
    };

    // Pagination state and handlers
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const applicationsPerPage = 5;

    if (applications != null)
    {
        useEffect(() => {
            setTotalPages(Math.ceil(applications.length / applicationsPerPage));
            setCurrentPage(1); // Reset to first page when applications change
        }, [applications]);
    } else {
        useEffect(() => {
            setTotalPages(1);
            setCurrentPage(1); // Reset to first page when applications change
        }, [applications]);
    }

    const handlePageClick = (pageNum: number) => {
        setCurrentPage(pageNum);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };
    
    // Calculate the applications to display on the current page
    const currentApplications = []
    if (applications != null)
     {
        console.log("test slice")
        const currentApplications = applications.slice(
            (currentPage - 1) * applicationsPerPage,
            currentPage * applicationsPerPage
        );
    } else {
        console.log("One of the properties in the chain is null or undefined");
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1em', width: '100%' }}>
            {/* Top row: "Sort by:" on the left, buttons centered */}
            <div 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1em'
                }}
            >
            </div>

            {/* Filter by Status Dropdown */}
            <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                <label htmlFor="statusFilter" style={{ marginRight: '0.5em' }}>Filter by Status:</label>
                <Select
                    id="statusFilter"
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === statusFilter)}
                    onChange={handleStatusChange}
                    isClearable
                    placeholder="Select Status..."
                    styles={{
                        container: (provided) => ({ ...provided, width: 200, margin: '0 auto' }),
                    }}
                />
            </div>
            
            
            {/* Loading Indicator */}
            {loading && <p style={{ textAlign: 'center' }}>Loading applications...</p>}

            {/* Error Message */}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {/* Applications List */}
            {!loading && applications != null && applications.length === 0 && !error && (
                <p style={{ textAlign: 'center' }}>No applications found for the selected status.</p>
            )}
            {console.log(currentApplications)}
            {!loading && applications != null && applications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1em' }}>
                    {applications.map((app) => (
                        <div 
                            key={app.ID} 
                            style={{ 
                                flex: '1 0 21%', // Adjust flex-basis as needed
                                border: '1px solid #eee', 
                                padding: '0.5em', 
                                margin: '0.5em',
                                boxSizing: 'border-box'
                            }}
                        >

                            <div style={{ marginBottom: '0.5em' }}><strong>Course:</strong> {app.CourseName}</div>
                            <div style={{ marginBottom: '0.5em' }}><strong>Uploader:</strong> {app.UploaderName}</div>
                            <div style={{ marginBottom: '0.5em' }}><strong>Status:</strong> {app.Status}</div>
                            <div style={{ marginBottom: '0.5em' }}>
                                <strong>Previous Experience:</strong> {app.PreviousExperience ? 'Yes' : 'No'}
                            </div>
                            <div style={{ marginBottom: '0.5em' }}>
                                <strong>File:</strong> <a href={app.FileURL} target="_blank" rel="noopener noreferrer">View CV</a>
                            </div>
                            {/* Add more fields or actions as needed */}
                            <button
                            className="bg-slate-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-slate-600"
                            onClick={() => handleEdit(app.ID)}
                            >
                            <FiEdit2 />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5em' }}>
                    {/* Previous Button */}
                    <button 
                        style={buttonStyle} 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            style={{
                                ...buttonStyle,
                                fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                            }}
                            onClick={() => handlePageClick(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button 
                        style={buttonStyle} 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};