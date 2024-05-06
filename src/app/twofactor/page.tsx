"use client"

import React, { useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserContext from '@/contexts/UserContext';
import {io} from 'socket.io-client';

interface FormData {
    code: string;
}

interface FormErrors {
    code?: string;
}

export default function TwoFactorPage() {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const router = useRouter();
    const {token, socket, setSocket} = useContext(UserContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {

            console.log(token);

            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/user/twofactor?code=${code}&socketId=${socket?.id}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization' : `Bearer ${token}`
                }
            });

            const res = await response.json();

            if (response.ok) {
                console.log("Login success", res.data);
                toast.success("Login success");
                localStorage.setItem('token', token);

                socket?.on('message', (data: any) => {
                    console.log(data);
                    // setActivities(prevActivities => [...prevActivities, data]); // Update activities state with received activity
                })

                router.push("/dashboard");
                setLoading(false);
            } else {
                console.log(response.status);
                setLoading(false);
            }
        }
        catch (error: any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Establish Socket connection
        const socket = io('http://localhost:4000');
        setSocket(socket); // Save socket to UserContext

        // Cleanup function
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>

                    <form className='w-[20%] md:w-[30%] lg:w-[40%] shadow-md shadow-gray-500 p-20' onSubmit={handleSubmit(onSubmit)}>
                        <h2 className='text-5xl mb-10 font-bold text-center'>{loading ? "Processing" : "Enter 2-Factor Authentication Code"}</h2>
                        <div className='flex flex-col justify-between'>
                            <div className='w-full'>
                                <input type="text" placeholder='2FA Code' className='w-full p-2 rounded border-2 border-gray-300 mx-1 text-xl' onChange={(e) => setCode(e.target.value)} value={code}/>
                                <p className='text-red-500 text-xl mb-4'>{errors.code?.message}</p>
                            </div>
                        </div>
                        <button className='w-full bg-black text-white p-2 rounded text-xl'>Submit</button>
                    </form>
            {/* {
                !token && (

                )
            } */}
            {/* {
                token && (
                    <div>
                        <p className='text-4xl font-bold my-5'>Already Logged In</p>
                        <button className='w-full bg-black text-white p-2 rounded text-xl' onClick={() => router.push("/dashboard")}>Continue to Dashboard</button>
                    </div>
                )
            } */}
        </div>
    );
}


