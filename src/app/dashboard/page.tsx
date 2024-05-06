"use client";

import UserContext from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import io from 'socket.io-client';

interface User {
    [x: string]: any;
    // Define your user properties here
}

interface Activity {
    userId: string;
    activityType: string;
    timestamp: string;
    deviceInfo: string;
}

export default function DashboardPage(){

    // states
    const [code, setCode] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>('');
    // const [socket, setSocket] = useState<any>(null);
    const [activities, setActivities] = useState<Activity[]>([]);

    const router = useRouter();
    const {socket, setSocket} = useContext(UserContext);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');  
        setToken(storedToken || '');  
        console.log(token);

        fetch(`https://authproject-6dsi.onrender.com/api/user/getuser`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${storedToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(res => {
            console.log(res);
            setUser(res.data.user);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    }, [token]);

    useEffect(() => {
        const socket = io('https://authproject-6dsi.onrender.com')

        console.log(socket);

        socket.on('message', (data) => {
            console.log("Message ", data);
        })

        socket.on('login', (data)=> {
            setActivities((prevActivities) => [...prevActivities, data]);
        })

        socket.on('twofactor', (data)=> {
            setActivities((prevActivities) => [...prevActivities, data]);
        })

        socket.on('logout', (data)=> {
            setActivities((prevActivities) => [...prevActivities, data]);
        })

        return () => {
            socket.disconnect();
        }
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
            const response = await fetch('https://authproject-6dsi.onrender.com/api/user/logout', {
                method: "POST",
                headers: {
                    'authorization' : `Bearer ${token}`
                }
            })
    
            const res = await response.json();

            console.log(res);
    
            if(response.ok){
                alert(res.message);
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
            const response = await fetch('https://authproject-6dsi.onrender.com/api/user/qrimage', {
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
            const response = await fetch(`https://authproject-6dsi.onrender.com/api/user/settwofa?code=${code}`, {
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
                <h2 className="text-4xl text-center my-5">Login and Logout Activities</h2>
                {
                    activities.map((activity, index) => (
                        <div>
                            {/* <div>hi</div> */}
                            <div key={index} className="my-2"><b>UserId : </b>{activity.userId}, <b>Activity Type: </b>{activity.activityType}, <b>Activity Timestamp : </b> {activity.timestamp}, <b>Device Info: </b>{activity.deviceInfo} </div>
                        </div>
                    ))
                }
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
