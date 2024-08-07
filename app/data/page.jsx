import React from 'react'

function page() {
  return (
    <div className="max-w-lg mx-auto mt-20 bg-red-100 border border-red-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-center ">
          <svg className="h-8 w-8 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-red-700 text-lg font-semibold">The link entered by the user does not work</p>
        </div>
      </div>
  )
}

export default page