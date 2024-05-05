"use client";
import UserContext from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

interface User {
    [x: string]: any;
    // Define your user properties here
}

// Define the type of your context value
interface UserData {
    user: User | null;
    ready: boolean;
    verified: boolean;
    token: string; 
    setToken: (token: string) => void; 
    setUser: (user: User | null) => void;
    setVerified: (verified: boolean) => void;
}

export default function DashboardPage(){

    // states
    const [code, setCode] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>('');

    const router = useRouter();
    // const {user, ready, setUser, setToken, setVerified} = useContext(UserContext);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');  
        setToken(storedToken || '');  
        console.log(token);

        fetch('http://localhost:4000/api/user/getuser', {
            method: "GET",
            headers: {
                'Content-Type' : 'application/json',
                'authorization': `Bearer ${storedToken}` 
            }
        })
        .then(response => response.json())
        .then(res => {
            console.log(res);
            setUser(res.data.user);
        })
    }, []);
    
    
    // If user is null, redirect to login
    if (!user) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                    <div className="text-6xl mb-10">
                        Loading...
                    </div>
                </div>
    }
    console.log(user);
    
    const logout = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/user/logout', {
                method: "POST",
                headers: {
                    'authorization' : `Bearer ${token}`
                }
            })
    
            const res = await response.json();

            console.log(res);
    
            if(response.ok){
                alert(res.message);
                // setToken("");
                // setVerified(false);
                // setUser(null);
                localStorage.removeItem('token');
                router.push("/");
            }
            else{
                console.log(res.message);
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getQR = async (e:any) => {

        e.preventDefault();

        var twofaqr = document.getElementById('twofaqr');
        if(twofaqr){
            twofaqr.classList.toggle('hidden');
        }
        try{
            const response = await fetch('http://localhost:4000/api/user/qrimage', {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json',
                    'authorization' : `Bearer ${token}`
                }
            })

            
            const res = await response.json();
            console.log(res);

            if(response.ok){

                const image = res.data.qrImage;

                const qrcode_image = document.getElementById('qrcode');

                qrcode_image?.setAttribute('src', image);
            }
        }
        catch(error){
            console.log("Error occured while generating the image: "+error);
        }
    }


    const submitQR = async (e:any) => {

        e.preventDefault();

        console.log(code);

        try{
            const response = await fetch(`http://localhost:4000/api/user/settwofa?code=${code}`, {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json',
                    'authorization' : `Bearer ${token}`
                }
            })

            const res = await response.json();
            console.log(res);

            if(response.ok){
                alert('Success: 2FA enabled/updated');
                setCode('');
            }
            else{
                alert('Error: Unable to update/enable 2FA'); 
                setCode('');  
            }
        }
        catch(error){
            console.log("Error while submitting the QR", error);
        }
    }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="text-6xl mb-10">
                Dashboard Page
            </div>

            <button className="text-xl bg-black px-5 py-3 text-white rounded-md my-2" onClick={logout}>Logout</button>

            <div className="w-fit">

                {
                        !user?.twoFA.enabled && (
                            <>
                                <div className="border-t-2 border-gray-600 w-full my-4 mr-4"></div>
                                <button className="text-xl bg-black px-5 py-3 text-white rounded-md my-2" onClick={getQR}>Enable 2FA</button>
                            </>
                        )
                }
            </div>

            {
                    !user?.twoFA.enabled && (
                        <div className="mt-4 flex flex-col items-center justify-center hidden" id="twofaqr">
                            <img id="qrcode" className="" alt="QR Code" />

                            <form className="mt-4">
                                <input onChange={(e) => setCode(e.target.value)} value={code} type="text" placeholder='Enter OTP' className='w-full p-2 rounded mb-4 border-2 border-gray-300 mx-2 text-xl'/>
                                <button className='w-full bg-black text-white p-2 rounded text-xl mx-2' onClick={submitQR}>Submit</button>
                            </form>
                        </div>
                    )
            }

        </div>
    );
}   