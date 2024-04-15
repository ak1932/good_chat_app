'use client';
import Sidebar from "./sidebar";
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

import { useContext } from "react";
import { AccountContext } from "./components/AccountContext";
import LoadingScreen from "./load/page";
import { redirect } from "next/navigation";
interface Chat {
    from: string,
    text: string,
}

import Peer, { DataConnection } from "peerjs"

let ChatBubble = (props: { from: string, text: string }) => {
    const { user } = useContext(AccountContext)
    let diff = (props.from === user!.username);
    return (
        <>
            <div className={`relative ${diff ? "border-theme_yellow place-self-end" : "border-theme_red"} max-w-[60%] text-lg p-4 border-2`}>
                <p>{props.text}</p>
            </div>
            <h1 className={`${diff ? "text-theme_yellow place-self-end" : "text-theme_red"} font-bold`}>{`@${props.from}`}</h1>
        </>
    );
}

let MsgWin = (props: { room: string | null }) => {
    const { user } = useContext(AccountContext)
    const [isRoomSelected, setIsRoomSelected] = useState(false)
    const inputElem = useRef<HTMLInputElement>(null)
    const chats_current = useRef<Chat[]>([])
    const chatsCurrentLen = useRef<number>(0)
    const [chatsLen, setChatsLen] = useState(0)
    const [dataConnections, setDataConnections] = useState<DataConnection[]>([])

    const recievedMessage = (from: string, text: string) => {
        chats_current.current = [{ from: from, text: text }, ...chats_current.current]
        chatsCurrentLen.current += 1
        setChatsLen(chatsCurrentLen.current)
    }

    const sendMessage = () => {
        const text = String(inputElem.current?.value)
        console.log(dataConnections)
        dataConnections.forEach((dataConnection, index) => {
            dataConnection.send(text)
        })
        chats_current.current = [{ from: user!.username, text: text }, ...chats_current.current]
        inputElem.current!.value = ""
        chatsCurrentLen.current += 1
        setChatsLen(chatsCurrentLen.current)
    }

    useLayoutEffect(() => {
        if (!props.room) {
            return
        }
        else {
            setIsRoomSelected(true);
        }

        console.log("in room new room")

        const peer = new Peer(user!.username, {
            key: props.room,
            host: "localhost",
            port: 4000,
            path: "/peerjs",
            config: {
                'iceServers': [
                    { 'url': 'stun:stun.l.google.com:19302' },
                    { 'url': 'turn:numb.viagenie.ca', credential: 'xxxx', username: 'xxxx@gmail.com' }]
            }, // this is must for keeping the connection open
            debug: 3
        });

        fetch("http://localhost:4000/peerjs/PICT/peers", {
            method: "GET",
        })
            .catch(err => {
                console.log(`error when getting peers in room ${JSON.stringify(err, null, 4)}`);
            })
            .then(res => {
                if (!res || !res.ok || res.status >= 400) {
                    return;
                }
                return res.json();
            })
            .then(data => {
                var possibleConnections: DataConnection[] = []
                console.log(`people in room ${user!.selectedRoom} are ${JSON.stringify(data)}`)
                data.forEach((value: string, index: number) => {
                    if (value !== user!.username) {
                        console.log(`Attempting to connect to ${value}`)
                        possibleConnections.push(peer.connect(value, { reliable: true }))
                    }
                })

                possibleConnections.forEach((dataConnection: DataConnection) => {
                    console.log(`setting up connections for ${dataConnection.peer}`)
                    dataConnection.on('open', () => {
                        console.log(`connection is open to ${dataConnection.peer}`)
                        dataConnections.push(dataConnection)
                    })
                    dataConnection.on('error', (error) => {
                        console.log(`error connecting to ${dataConnection.peer} with error ${JSON.stringify(error)}`)
                    })

                    dataConnection.on('data', (data) => {
                        recievedMessage(dataConnection.peer, String(data))
                    })
                })

                peer.on('connection', (dataConnection) => {
                    console.log(`new connection from ${dataConnection.peer}`)
                    dataConnection.on('data', (data) => {
                        recievedMessage(dataConnection.peer, String(data))
                    })
                    dataConnection.on('error', (error) => {
                        console.log(`error connecting to ${dataConnection.peer} with error ${JSON.stringify(error)}`)
                    })
                    dataConnection.on('open', function() {
                        dataConnections.push(dataConnection)
                        console.log(`connection is open to ${dataConnection.peer}`)
                    })
                })
            });
        return () => { };
    }, [props.room])


    if (!isRoomSelected) {
        return (
            <h1 className="text-[6rem]"> Select something dude. 🙄</h1>
        )
    }
    else {
        return (
            <div className="ml-8 mr-8 relative h-screen">
                <div className="flex gap-4 flex-col-reverse">
                    <div className="h-24 bg-theme_bg">
                    </div>
                    {chats_current.current.map((chat, index) => (
                        <ChatBubble from={chat.from} text={chat.text} key={index} />
                    ))}
                </div>
                <div className="origin-bottom h-16 border-theme_yellow fixed whitespace-normal bottom-5 bg-theme_gray flex flex-row w-[calc(100%-22em)]">
                    <input ref={inputElem} className="bg-theme_gray focus:outline-0 focus:outline-none pl-8 w-full"></input>
                    <button onClick={sendMessage} className="h-12 w-32 border-4 m-2 border-theme_yellow font-bold flex justify-center items-center hover:bg-theme_yellow hover:text-theme_gray active:bg-white active:text-theme_gray">SEND
                    </button>
                </div>
            </div>
        )
    }
}

function Home() {
    const { user } = useContext(AccountContext)
    const [room, setRoom] = useState(user!.selectedRoom)
    return (
        <>
            <Sidebar setRoom={setRoom} />
            <div className="h-screen ml-72 mt-8 relative">
                <MsgWin room={room} />
            </div>
        </>
    );
}



export default function CheckAuth() {
    const { user } = useContext(AccountContext)
    const [loading, setLoading] = useState(true);
    useLayoutEffect(() => {
        if (user === null) {
            console.log("user is null")
            redirect('/login');
        }
        else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        <LoadingScreen />
    }
    else {
        return (
            <Home />
        );
    }
}
