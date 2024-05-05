"use client";
import { createContext, ReactNode, useEffect, useState } from "react";

// Define the type of your user object
interface User {
    [x: string]: any;
    // Define your user properties here
}

// Define the type of your context value
interface UserContextValue {
    user: User | null;
    ready: boolean; // New
    verified: boolean;
    token: string; // Updated
    setToken: (token: string) => void; // Updated
    setUser: (user: User | null) => void;
    setVerified: (verified: boolean) => void;
}

// Define the type of props for the context provider
interface UserContextProviderProps {
    children: ReactNode;
}

// Create the UserContext with the specified type
const UserContext = createContext<UserContextValue>({
    user: null,
    ready: false, // New
    verified: false,
    token: '', // Updated
    setToken: () => {}, // Updated
    setUser: () => {},
    setVerified: () => {}
});

// Define the UserContextProvider component
export function UserContextProvider({ children }: UserContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState<boolean>(false); // New
    const [verified, setVerified] = useState<boolean>(false);
    const [token, setToken] = useState<string>(''); // Updated

    useEffect(() => {
        getUser();
    }, [user]);

    const getUser = async () => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken || ''); // Updated

        if (!storedToken) {
            setReady(true); // Set ready to true if there's no stored token
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/user/getuser', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization' : `Bearer ${storedToken}`
                }
            });
    
            const res = await response.json();

            console.log(res);
    
            if(response.ok){
                setUser(res.data.user);
                setReady(true);
            }
            else{
                console.log(response.status);
            }
        } catch (error) {
            setReady(true);
            console.log(error);
        }
    }

    return (
        <UserContext.Provider value={{ user, ready, setUser, verified, setVerified, token, setToken }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContext;
