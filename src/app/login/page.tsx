"use client"

import React, { useContext, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserContext from '@/contexts/UserContext';

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {setToken, token} = useContext(UserContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            setLoading(true);
            const response = await fetch("https://authproject-6dsi.onrender.com/api/user/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const res = await response.json();

            if (response.ok) {
                console.log("Login success", res.data);
                toast.success("Login success");
                if(res.data.loggedInUser.twoFA.enabled){
                    console.log(res.data.accessToken);
                    setToken(res.data.accessToken);
                    router.push('/twofactor');
                }
                else{
                    localStorage.setItem('token', res.data.accessToken);
                    router.push("/dashboard");
                }
            } else {
                console.log(response.status);
            }
        }
        catch (error: any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
        }
        finally {
            setLoading(false);
        }

        console.log(data);
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>

            {
                !token && (
                    <form className='w-[20%] md:w-[30%] lg:w-[40%] shadow-md shadow-gray-500 p-20' onSubmit={handleSubmit(onSubmit)}>
                        <h2 className='text-5xl mb-10 font-bold text-center'>{loading ? "Processing" : "Sign In"}</h2>
                        <div className='flex flex-col justify-between'>
                            <div className='w-full'>
                                <input type="email" placeholder='Enter Email' className='w-full p-2 rounded border-2 border-gray-300 mx-1 text-xl' {...register('email', {
                                    required: {
                                        value: true,
                                        message: "Email is required",
                                    },
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: "Invalid email format"
                                    }
                                })} />
                                <p className='text-red-500 text-xl mb-4'>{errors.email?.message}</p>
                            </div>
                            <div className='w-full'>
                                <input type="password" placeholder='Enter Password' className='w-full p-2 rounded border-2 border-gray-300 mx-1 text-xl' {...register('password', {
                                    required: {
                                        value: true,
                                        message: "Password is required"
                                    },
                                    pattern: {
                                        value: /^.{8,}$/,
                                        message: "Password should be at least 8 characters long"
                                    }
                                })} />
                                <p className='text-red-500 text-xl mb-4'>{errors.password?.message}</p>
                            </div>
                            {/* <div className='w-full'>
                                <input type="text" placeholder='2FA Code' className='w-full p-2 rounded border-2 border-gray-300 mx-1 text-xl' {...register('code')} />
                                <p className='text-red-500 text-xl mb-4'>{errors.code?.message}</p>
                            </div> */}
                        </div>
                        <button className='w-full bg-black text-white p-2 rounded text-xl'>Submit</button>
                        <p className='text-center text-gray-600 mt-3'>Don&apos;t have an Account? <Link href="/signup" className='underline hover:text-black cursor-pointer'>Sign up</Link></p>
                    </form>
                )
            }   
            {
                token && (
                    <div>
                        <p className='text-4xl font-bold my-5'>Already Logged In</p>
                        <button className='w-full bg-black text-white p-2 rounded text-xl' onClick={() => router.push("/dashboard")}>Continue to Dashboard</button>
                    </div>
                )
            }

        </div>
    );
}


