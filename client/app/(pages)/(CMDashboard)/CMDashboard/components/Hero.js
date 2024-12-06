"use client"

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google'
import Button from './Button'
import Calendar from './Calendar'

const inter = Inter({
    subsets: ["latin"],
    weight: ["400"],
  })

const Hero = () => {
  const [allCourses, setAllCourses] = useState([
    { courseName: "Course 5", professor: "Prof E", taName: "TA V", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 1", professor: "Prof A", taName: "TA R", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 3", professor: "Prof C", taName: "TA T", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 10", professor: "Prof J", taName: "TA Q", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 2", professor: "Prof B", taName: "TA S", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 4", professor: "Prof D", taName: "TA U", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 7", professor: "Prof G", taName: "TA X", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 8", professor: "Prof H", taName: "TA Y", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 2", professor: "Prof B", taName: "TA S", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 4", professor: "Prof D", taName: "TA U", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 6", professor: "Prof F", taName: "TA W", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 7", professor: "Prof G", taName: "TA X", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 8", professor: "Prof H", taName: "TA Y", semester: "Fall 2024", applicationStatus: "Pending" },
    { courseName: "Course 9", professor: "Prof I", taName: "TA Z", semester: "Fall 2024", applicationStatus: "Pending" }
  ]);

  const coursesPerPage = 5;
  const totalCourses = allCourses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage);

  const [currentPage, setCurrentPage] = useState(1);

  const currentDataSets = allCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  const handleSort = (criteria) => {
    const sortedCourses = [...allCourses].sort((a, b) => {
      if (!a[criteria] || !b[criteria]) return 0;
      return a[criteria].localeCompare(b[criteria], 'en', { numeric: true, sensitivity: 'base' });
    });
    setAllCourses(sortedCourses);
    setCurrentPage(1);
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const buttonStyle = {
    fontSize: '0.8em',
    padding: '0.25em 0.5em'
  };

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
        {/* Left-aligned Sort text */}
        <span style={{ marginRight: '1em' }}>Sort by:</span>
        
        {/* A flex container that grows and centers the buttons */}
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          flexGrow: 1, 
          gap: '0.5em'
        }}>
          <button style={buttonStyle} onClick={() => handleSort('courseName')}>Course Name</button>
          <button style={buttonStyle} onClick={() => handleSort('professor')}>Professor</button>
          <button style={buttonStyle} onClick={() => handleSort('taName')}>TA Name</button>
          <button style={buttonStyle} onClick={() => handleSort('semester')}>Semester</button>
        </div>
      </div>

      {/* New Applicants to Review text */}
      <div style={{ textAlign: 'center', marginBottom: '1em', fontWeight: 'bold', fontSize: '1em' }}>
        New Applicants to Review
      </div>

      {/* Data columns (no labels, just data) */}
      <div style={{ display: 'flex', marginBottom: '1em' }}>
        {currentDataSets.map((dataset, colIndex) => {
          const datasetValues = Object.values(dataset);
          return (
            <div 
              key={colIndex} 
              style={{ 
                flex: 1, 
                border: '1px solid #eee', 
                padding: '0.5em', 
                margin: '0 0.5em' 
              }}
            >
              {datasetValues.map((value, valIndex) => (
                <div key={valIndex} style={{ marginBottom: '0.5em' }}>
                  {value}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Pagination at the bottom */}
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
    </div>
  );
};


export default Hero;
