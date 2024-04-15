'use client'

import { useState, useEffect } from "react"

let LoadingScreen = () => {
    // const [dots, setDots] = useState("loading bitch.")

    // function updator() {
    //     setDots(dots+".")
    // }


    // useEffect(() => {
    //     setInterval(updator, 10000);
    // }, [])
    // return <h1 className="text-theme_yellow text-[8rem] animate-pulse">{dots}</h1>

    const [time, setTime] = useState("loading bitch .");

    useEffect(() => {
        const interval = setInterval(() => setTime((time) => time + "."), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return <h1 className="text-theme_yellow text-[10rem] break-words break-after-page">{time}</h1>

}

export default LoadingScreen;
