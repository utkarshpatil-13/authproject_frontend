"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {SubmitHandler, useForm} from 'react-hook-form'
import toast from 'react-hot-toast'

interface FormData{
    firstname : string;
    lastname: string;
    email : string;
    password: string;
}

interface FormErrors {
    firstname? : string;
    lastname? : string;
    email? : string;
    password? : string;
}


export default function SignUpPage(){

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {

        try{
            setLoading(true);
            const response = await fetch("http://localhost:4000/api/user/register", {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(data)
            });

            const res = await response.json();

            console.log("response on signup: "+res);

            if(response.ok){
                console.log(res.data);
                router.push("/verifyemail");
            }
            else{
                console.log(response.status);
            }
        }
        catch(error:any){
            console.log("Signup failed", error.message);
            
            toast.error(error.message);
        }
        finally{
            setLoading(false);
        }

        console.log(data);
    }


    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>
            <form className='w-[20%] md:w-[30%] lg:w-[40%] shadow-md shadow-gray-500 p-20' onSubmit={handleSubmit(onSubmit)}>
            <h2 className='text-5xl mb-10 font-bold text-center'>{loading ? "Processing" : "Sign Up"}</h2>
                <div className='flex justify-between'>
                    <div className='w-full'>
                        <input type="text" placeholder='First Name' className='w-full p-2 rounded mb-4 border-2 border-gray-300 mx-1 text-xl' {...register('firstname', {
                            required: {
                                value: true,
                                message: "First Name is required"
                            }                          
                        })} />
                        <p className='text-red-500 text-xl'>{errors.firstname?.message}</p>
                    </div>
                    <div className='w-full'>
                        <input type="text" placeholder='Last Name' className='w-full p-2 rounded mb-4 border-2 border-gray-300 mx-2 text-xl' {...register('lastname', {
                            required: {
                                value: true,
                                message: "Last Name is required"
                            }
                        })}/>
                        <p className='text-red-500 text-xl'>{errors.lastname?.message}</p>
                    </div>
                </div>
                <div className='flex'>
                <div className='w-full'>
                        <input type="email" placeholder='Enter Email' className='w-full p-2 rounded mb-4 border-2 border-gray-300 mx-1 text-xl' {...register('email', {
                            required: {
                            value: true,
                            message: "Email is required",
                            },
                            pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email format"
                            }
                        })} />
                        <p className='text-red-500 text-xl'>{errors.email?.message}</p>
                    </div>
                    <div className='w-full'>
                        <input type="password" placeholder='Enter Password' className='w-full p-2 rounded mb-4 border-2 border-gray-300 mx-2 text-xl' {...register('password', {
                            required: {
                                value: true,
                                message: "Password is required"
                            },
                            pattern: {
                                value: /^.{8,}$/,
                                message: "Password should be atleast 8 characters long"
                            }
                        })}/>
                        <p className='text-red-500 text-xl'>{errors.password?.message}</p>
                    </div>
                </div>
                <button className='w-full bg-black text-white p-2 rounded text-xl'>Submit</button>
                <p className='text-center text-gray-600 mt-3'>Already have an Account? <span className='underline hover:text-black cursor-pointer'>Sign in</span></p>
            </form>

        </div>
    );
}
