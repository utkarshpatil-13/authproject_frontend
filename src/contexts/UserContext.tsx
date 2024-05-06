"use client";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

// Define the type of your user object
interface User {
    [x: string]: any;
    // Define your user properties here
}

// Define the type of your context value
interface UserContextValue {
    user: User | null;
    ready: boolean;
    verified: boolean;
    token: string; 
    socket: Socket | null;
    setToken: (token: string) => void; 
    setUser: (user: User | null) => void;
    setVerified: (verified: boolean) => void;
    setSocket: (socket: Socket | null) => void;
}

// Define the type of props for the context provider
interface UserContextProviderProps {
    children: ReactNode;
}

// Create the UserContext with the specified type
const UserContext = createContext<UserContextValue>({
    user: null,
    ready: false, 
    verified: false,
    token: '', 
    socket: null,
    setToken: () => {},
    setUser: () => {},
    setVerified: () => {},
    setSocket: () => {}
});

// Define the UserContextProvider component
export function UserContextProvider({ children }: UserContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [verified, setVerified] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');   
        setToken(storedToken || '');      
        console.log(token);

        fetch('https://authproject-6dsi.onrender.com/api/user/getuser', {
            method: "GET",
            headers: {
                'Content-Type' : 'application/json',
                'authorization': `Bearer ${storedToken}` 
            }
        })
        .then(response => response.json())
        .then(res => {
            setUser(res?.data?.user);
            setReady(true);
        })
    }, []);

    // useEffect(() => {
    //     getUser();
    // }, []);

    // const getUser = async () => {
    //     const storedToken = localStorage.getItem('token');

    //     console.log(token);

    //     setToken(storedToken || ''); 

    //     try {
    //         const response = await fetch('https://authproject-6dsi.onrender.com/api/user/getuser', {
    //             method: "GET",
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'authorization' : `Bearer ${storedToken}`
    //             }
    //         });
    
    //         const res = await response.json();

    //         console.log(res);
    
    //         if(response.ok){
    //             setUser(res.data.user);
    //             setReady(true);
    //         }
    //         else{
    //             console.log(response.status);
    //         }
    //     } catch (error) {
    //         setReady(true);
    //         console.log(error);
    //     }
    // }

    return (
        <UserContext.Provider value={{ user, setUser, ready, verified, setVerified, token, setToken, setSocket, socket }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContext;
