"use client";

import Link from "next/link";
import React, {useState, useEffect} from "react";

export default function VerifyEmailPage(){
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);

    const verifyUserEmail = async () => {
        try{
            const response = await fetch(`http://localhost:4000/api/user/verifyemail/?token=${token}`, {
                method: "GET",
                headers: {
                    'Content-Type' : 'application/json'
                }
            })

            const res = await response.json();

            if(response.ok){
                alert(res.message);
                setVerified(true);
            }
            else{
                console.log(response.status);
            }
        }
        catch(error:any){
            setError(true);
            console.log(error);
        }
    }

    // const isVerified = async () => {
    //     try{
    //         const response = await fetch(`http://localhost:4000/api/user/isverified/?token=${token}`, {
    //             method: "GET",
    //             headers: {
    //                 'Content-Type' : 'application/json'
    //             }
    //         })

    //         const res = await response.json();

    //         console.log("response on verify email "+res );

    //         if(response.ok){
    //             alert(res.message);
    //             // setVerified(res.data.isverified);
    //         }
    //         else{
    //             console.log(response.status);
    //         }
    //     }
    //     catch(error){
    //         setError(true);
    //         console.log(error);
    //     }
    // }

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "");
    }, []);

    useEffect(() => {
        verifyUserEmail();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
            <h1 className="text-4xl my-2">{verified ? "Email Verified" : "First Verify Your Email"}</h1>
            <h2 className="p-2 bg-orange-500 text-black">{token ? token : "No token"}</h2>

            {
                verified && (
                    <div>
                        <Link href="/login" className="text-center">
                            Login
                        </Link>
                    </div>
                )
            }
            {
                error && (
                    <div>
                        <h2 className="text-2xl bg-red-500">Error</h2>
                    </div>
                )
            }
        </div>
    );
}
