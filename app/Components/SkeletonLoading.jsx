import React from 'react';

const SkeletonLoading = () => {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-900">
            {/* Sidebar Skeleton (User List) */}
            <div className="md:w-1/4 w-full bg-gray-800 border-r border-gray-700 flex flex-col">
                {/* Search Bar Skeleton */}
                <div className="p-4 border-b border-gray-700">
                    <div className="h-10 bg-gray-700 rounded-md w-full animate-pulse"></div>
                </div>

                {/* User Items Skeleton */}
                <div className="flex-1 overflow-hidden p-2 space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse bg-gray-800/50">
                            <div className="w-12 h-12 bg-gray-700 rounded-full shrink-0"></div>
                            <div className="flex flex-col flex-1 gap-2">
                                <div className="h-4 bg-gray-700 rounded w-[95%]"></div>
                                <div className="h-3 bg-gray-600 rounded w-[70%]"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton (Messages) */}
            <div className="flex-1 bg-gray-900 hidden md:flex flex-col">
                {/* Chat Header Skeleton */}
                <div className="h-20 bg-gray-800 border-b border-gray-700 flex items-center px-6 gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex flex-col gap-2 w-64">
                        <div className="h-5 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/4 animate-pulse"></div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col-reverse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`flex gap-3 items-end ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar for messages */}
                            <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0 animate-pulse"></div>

                            {/* Message Bubble */}
                            <div className={`
                                max-w-[50%] p-4 rounded-2xl animate-pulse min-w-[150px]
                                ${i % 2 === 0
                                    ? 'bg-indigo-900/40 rounded-br-sm'
                                    : 'bg-gray-800 rounded-bl-sm'}
                            `}>
                                <div className="h-3 bg-gray-600/50 rounded w-full mb-3"></div>
                                <div className="h-3 bg-gray-600/50 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area Skeleton */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <div className="h-12 bg-gray-700 rounded-lg w-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoading;
