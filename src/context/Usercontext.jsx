
import React,{createContext, useEffect, useState} from 'react'
import { auth } from '../firebase';
export const Usercontext = createContext();

export const UserProvider = ({ children }) => {
    const [user,setUser] =useState(null);

    useEffect(()=>{
        const unsubscribe =auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    },[])

    return (
        <Usercontext.Provider value={{ user,setUser}}>
            {children}
        </Usercontext.Provider>
    );
};



