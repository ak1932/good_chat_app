'use client';
import Sidebar from "./sidebar";
import { useState, useLayoutEffect, useRef } from 'react';

import { useContext } from "react";
import { AccountContext } from "./components/AccountContext";
import LoadingScreen from "./load/page";
import { redirect } from "next/navigation";
import { Room } from "./components/AccountContext"

interface Chat {
    room: number,
    from: string,
    text: string,
}

import Peer, { DataConnection } from "peerjs"

let ChatBubble = (props: { from: string, text: string }) => {
    const { user } = useContext(AccountContext)
    let diff = (props.from === user!.username);
    return (
        <>
            <div className={`relative ${diff ? "border-theme_yellow place-self-end" : "place-self-start border-theme_red"} max-w-[60%] text-lg p-4 border-2`}>
                <p>{props.text}</p>
            </div>
            <h1 className={`${diff ? "text-theme_yellow place-self-end" : "text-theme_red"} font-bold`}>{`@${props.from}`}</h1>
        </>
    );
}

let MsgWin = (props: { room: Room | null }) => {
    const { user } = useContext(AccountContext)
    const [isRoomSelected, setIsRoomSelected] = useState(false)
    const inputElem = useRef<HTMLInputElement>(null)
    const chats_current = useRef<Chat[]>([])
    const dataConnections = useRef<DataConnection[]>([])
    const users = useRef<string[]>([])
    const chatsCurrentLen = useRef<number>(0)
    const [chatsLen, setChatsLen] = useState(0)

    const recievedMessage = (chatProps: {from: string, text: string, room: number}) => {
        chats_current.current = [{ from: chatProps.from.split(' ')[0], text: chatProps.text, room: chatProps.room }, ...chats_current.current]
        chatsCurrentLen.current += 1
        console.log(`current chats => ${JSON.stringify(chats_current.current)}`)
        setChatsLen(chatsCurrentLen.current)
    }

    const sendMessage = () => {
        const text = String(inputElem.current?.value)
        console.log(dataConnections)
        dataConnections.current.forEach(async (dataConnection, index) => {
            await dataConnection.send(text)
        })
        chats_current.current = [{ from: user!.username, text: text, room: user!.selectedRoom!.id}, ...chats_current.current]
        inputElem.current!.value = ""
        chatsCurrentLen.current += 1
        console.log(`current chats => ${JSON.stringify(chats_current.current)}`)
        setChatsLen(chatsCurrentLen.current)
    }

    useLayoutEffect(() => {
        if (!props.room) {
            return
        }
        else {
            setIsRoomSelected(true);
        }
        setChatsLen(0)

        console.log("in room new room")

        const peer = new Peer(`${user!.id} ${props.room!.id} ${user!.username}`, {
            host: "localhost",
            port: 4000,
            path: "/peerjs",
            config: {
                'iceServers': [
                    { url: 'stun:antisip.com:3478' },
                    {
                        url: 'turn:192.158.29.39:3478?transport=tcp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    }]

            }, // this is must for keeping the connection open
        });

        peer.on('open', (id) => {
            console.log(`${id}`)
            fetch("http://localhost:4000/rooms?" + new URLSearchParams({
                room: props.room!.id.toString()
            }), {
                method: "GET",
            })
                .catch(err => {
                    console.log(`Error when fetch room members => ${JSON.stringify(err)}`)
                })
                .then(res => {
                    if (!res || !res.ok || res.status >= 400) {
                        console.log(`response error`)
                    }
                    else {
                        return res.json();
                    }
                })
                .then(data => {
                    var possibleConnections: DataConnection[] = []
                    console.log(`people in room ${user!.selectedRoom} are ${JSON.stringify(data)}`)
                    data.forEach((value: string, index: number) => {
                        if (value !== `${user!.id} ${user!.selectedRoom} ${user!.username}`) {
                            const id_room_username = value.split(' ')
                            const username = id_room_username[2]
                            const userid = id_room_username[0]
                            console.log(`Attempting to connect to ${value}`)
                            possibleConnections.push(peer.connect(`${value}`, { reliable: true, metadata: {username: user!.username, room: user!.selectedRoom!.id} }))
                        }
                    })

                    possibleConnections.forEach((dataConnection: DataConnection) => {
                        console.log(`setting up connections for ${dataConnection.peer}`)
                        dataConnection.on('open', () => {
                            console.log(`connection is open to ${dataConnection.peer}`)
                            const username_room = dataConnection.peer.split(' ')
                            const username = username_room[0]
                            users.current.push(username)
                            dataConnections.current.push(dataConnection)
                        })
                        dataConnection.on('error', (error) => {
                            console.log(`error connecting to ${dataConnection.peer} with error ${JSON.stringify(error)}`)
                        })

                        dataConnection.on('data', (data) => {
                            console.log(`data recieved => ${JSON.stringify(data)} from room ${dataConnection.metadata.room}`)
                            recievedMessage({from: dataConnection.peer.split(' ')[2], text: String(data), room: dataConnection.metadata.room})
                        })
                    })

                    peer.on('connection', (dataConnection) => {
                        console.log(`new connection from ${dataConnection.peer}`)
                        dataConnection.on('data', (data) => {
                            console.log(`data recieved => ${JSON.stringify(data)} from room ${dataConnection.metadata.room}`)
                            recievedMessage({from: dataConnection.metadata.username, text: String(data), room: dataConnection.metadata.room})
                        })
                        dataConnection.on('error', (error) => {
                            console.log(`data recieved => ${JSON.stringify(data)}`)
                            console.log(`error connecting to ${dataConnection.peer} with error ${JSON.stringify(error)}`)
                        })
                        dataConnection.on('open', function() {
                            const username_room = dataConnection.peer.split(' ')
                            const username = username_room[0]
                            users.current.push(username)
                            dataConnections.current.push(dataConnection)
                            console.log(`connection is open to ${dataConnection.peer}`)
                        })
                    })
                    peer.on('disconnected', (peer) => {
                        const username_room = peer.split(' ')
                        const username = username_room[0]
                        users.current = users.current.filter(item => item !== username)
                        dataConnections.current = dataConnections.current.filter(item => item.peer !== peer)
                        console.log(`disconnection => ${JSON.stringify(peer)}`)
                    })
                });
        })
    }, [props.room])


    if (!isRoomSelected) {
        return (
                <h1 className="bg-black m-auto absolute left-[50%] right-[50%] top-[50%] bottom-[50%] text-3xl animate-pulse -translate-x-[50%] -translate-y-[50%] w-96 text-center justify-center font-bold text-theme_yellow">SELECT A ROOM.</h1>
        )
    }
    else {
        return (
            <div className="mx-8 mt-8 relative h-screen">
                <div className="flex gap-4 flex-col-reverse">
                    <div className="h-24 bg-theme_bg">
                    </div>
                    {chats_current.current.filter(chat => chat.room === user!.selectedRoom!.id).map((chat, index) => (
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
            <div className="h-screen ml-72 relative z-10 bg-theme_bg">
                <MsgWin room={room} />
            </div>
        </>
    );
}



export default function CheckAuth() {
    const { user } = useContext(AccountContext)
    const [loading, setLoading] = useState(true);
    useLayoutEffect(() => {
        if (!user) {
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
