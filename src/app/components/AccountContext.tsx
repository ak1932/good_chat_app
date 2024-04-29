'use client'
import { useRouter } from 'next/navigation';
import { createContext, useState, ReactNode, useEffect, SetStateAction, Dispatch } from 'react';

export interface Room {
    id: number,
    name: string,
}

interface User {
    username: string,
    selectedRoom: Room | null,
    id: number,
    rooms: Room[],
}

type AccountContextType = {
    user: User | null,
    setUser: Dispatch<SetStateAction<User | null>>
}

export const AccountContext = createContext<AccountContextType>({ user: null, setUser: () => { } }); // BAD PRACTICE

const UserContext = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter()
    useEffect(() => {
        fetch("http://localhost:4000/auth/login", {
            credentials: "include",
        })
            .catch(err => {
                setUser(null);
                return;
            })
            .then(res => {
                console.log(`response => ${JSON.stringify(res)}`)
                if (!res || !res.ok || res.status >= 400) {
                    setUser(null)
                    return;
                }
                return res.json();
            })
            .then(data => {
                console.log(`data => ${JSON.stringify(data)}`)
                if (!data) { // CHANGES HERE
                    setUser(null);
                    return;
                }
                setUser(data.user);
                router.push("/")
            })
    }, []);

    return (
        <AccountContext.Provider value={{ user, setUser }}>
            {children}
        </AccountContext.Provider>
    );
}

export default UserContext;
