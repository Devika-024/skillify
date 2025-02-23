"use client";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import React, { useEffect, useState, useCallback } from "react";
import InterviewItemCard from "./InterviewItemCard";

const InterviewList = () => {
    const { user, isLoaded } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getInterviewList = useCallback(async () => {
        if (!user?.primaryEmailAddress?.emailAddress) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const result = await db
                .select()
                .from(MockInterview)
                .where(
                    eq(
                        MockInterview.createdBy,
                        user.primaryEmailAddress.emailAddress
                    )
                )
                .orderBy(desc(MockInterview.id));
            
            setInterviewList(result);
        } catch (err) {
            console.error('Failed to fetch interviews:', err);
            setError('Failed to load interviews. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.primaryEmailAddress?.emailAddress]);

    useEffect(() => {
        if (isLoaded && user) {
            getInterviewList();
        }
    }, [isLoaded, user, getInterviewList]);

    if (!isLoaded) {
        return <div className="animate-pulse">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 rounded-md bg-red-50">
                {error}
                <button 
                    onClick={getInterviewList}
                    className="ml-4 text-sm underline hover:text-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="font-medium text-xl mb-4">Previous Mock Interviews</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, index) => (
                        <div 
                            key={index}
                            className="h-40 bg-gray-200 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            ) : interviewList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    No interviews found. Start your first mock interview!
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {interviewList.map((interview) => (
                        <InterviewItemCard
                            key={interview.id}
                            interview={interview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(InterviewList);
