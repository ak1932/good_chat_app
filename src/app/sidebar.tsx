'use client'

import { Dispatch, SetStateAction, useContext, useRef, useState } from 'react'
import { Room } from "./components/AccountContext"
import { AccountContext } from './components/AccountContext'
import { useRouter } from 'next/navigation';

let RoomCard = (props: { room: Room, key: string, setSelectedRoom: Dispatch<SetStateAction<Room | null>> }) => {
    let { user, setUser } = useContext(AccountContext);
    let button = useRef<HTMLButtonElement>(null);
    const [roomButtonText, setRoomButtonText] = useState(props.room.name)

    let toggleText = () => {
        if (roomButtonText == props.room.name) {
            setRoomButtonText(`id: ${props.room.id.toString()}`)
        }
        else {
            setRoomButtonText(props.room.name)
        }
    }

    let click = () => {
        props.setSelectedRoom(props.room);
        console.log(`changing room from ${user!.selectedRoom} to ${props.room}`)
        user!.selectedRoom = props.room;
        setUser(user)
    }

    const selected = user!.selectedRoom === props.room

    return (
        <button onClick={click} onMouseEnter={toggleText} onMouseLeave={toggleText} ref={button} className={`w-60 h-12 ${selected ? "bg-theme_gray text-theme_yellow shadow-selected_theme -translate-x-[5px] -translate-y-[5px]" : "border-2 border-theme_gray text-theme_gray hover:shadow-theme hover:-translate-x-[5px] hover:-translate-y-[5px]"} text-xl font-bold justify-center items-center flex transition-transform transition-dur`}>
            {roomButtonText}
        </button>
    )
}

export default function Sidebar(props: { setRoom: Dispatch<SetStateAction<Room | null>> }) {
    const { user, setUser } = useContext(AccountContext)
    const [rooms, setRooms] = useState<Room[]>(user!.rooms)
    const selectedRoom = user!.selectedRoom
    const hiddenDivElem = useRef<HTMLDivElement>(null)
    const inputElem = useRef<HTMLInputElement>(null)
    const plusButton = useRef<HTMLButtonElement>(null)
    const createButton = useRef<HTMLButtonElement>(null)
    const joinButton = useRef<HTMLButtonElement>(null)
    const router = useRouter()

    const toggleInputElem = () => {
        const classList = hiddenDivElem.current!.classList
        if (classList.contains("left-[-100%]")) {
            hiddenDivElem.current!.classList.remove("left-[-100%]")
            hiddenDivElem.current!.classList.add("left-6")
            inputElem.current!.focus()
            plusButton.current!.classList.add("left-[100%]")
        }
        else {
            hiddenDivElem.current!.classList.remove("left-6")
            hiddenDivElem.current!.classList.add("left-[-100%]")
            plusButton.current!.classList.remove("left-[100%]")
        }
    }

    const createRoom = () => {
        fetch("http://localhost:4000/create?" + new URLSearchParams({
            room_name: inputElem.current?.value!,
            user_id: user!.id.toString(),
        }), {
            method: "POST",
        })
            .catch(err => {
                console.log(`Error when creating room. => ${JSON.stringify(err)}`)
            })
            .then(res => {
                if (!res || !res.ok || res.status >= 400) {
                    console.log(`response error for creating room`)
                }
                else {
                    return res.json();
                }
            })
            .then(data => {
                setRooms([...rooms, data.room])
                inputElem.current!.value = ""
                toggleInputElem()
            })
    }

    const joinRoom = () => {
        fetch("http://localhost:4000/join?" + new URLSearchParams({
            room_id: inputElem.current?.value!,
            user_id: user!.id.toString(),
        }), {
            method: "POST",
        })
            .catch(err => {
                console.log(`Error when joining room. => ${JSON.stringify(err)}`)
            })
            .then(res => {
                if (!res || !res.ok || res.status >= 400) {
                    console.log(`response error for joining room`)
                }
                else {
                    return res.json();
                }
            })
            .then(data => {
                setRooms([...rooms, data.room])
                inputElem.current!.value = ""
                toggleInputElem()
            })
    }

    const usernameElement = useRef<HTMLButtonElement>(null)

    const [titleText, setTitleText] = useState("@" + user!.username.toUpperCase())

    let toggleText = () => {
        if (titleText === `@${user!.username.toUpperCase()}`) {
            setTitleText("LOGOUT")
        }
        else {
            setTitleText(`@${user!.username.toUpperCase()}`)
        }
    }
    
    const logout = () => {
        setUser(null);
        router.replace('/login');
    }



    return (
        <div className="w-72 h-screen fixed top-0 left-0 bg-theme_yellow items-center">
            <button ref={usernameElement} onMouseEnter={toggleText} onClick={logout} onMouseLeave={toggleText} className="text-2xl w-72 text-theme_yellow bg-theme_gray text-center p-6 font-bold">
                {titleText}
            </button>
            <div className="grid grid-flow-row gap-8 place-items-center pt-16">
                {
                    rooms.map((room) => (<RoomCard room={room} key={room.name} setSelectedRoom={props.setRoom} />))
                }
                <div>
                    <div ref={hiddenDivElem} className="absolute left-[-100%] transition-all duration-500 ease-in-out">
                        <input ref={inputElem} onKeyUp={(key) => {
                            if (key.key == "Enter") {
                                setRooms([...rooms, { name: inputElem.current?.value!, id: 145 }])
                                inputElem.current!.value = ""
                                toggleInputElem()
                            }
                        }} className="bg-theme_gray uppercase text-theme_yellow font-bold focus:outline-0 focus:outline-none px-8 h-12 w-60"></input>
                        <div className="grid grid-flow-col mt-2 gap-4">
                            <button onClick={createRoom} ref={createButton} className="bg-theme_gray text-theme_yellow text-xl p-2 h-12 text-center font-bold">Create</button>
                            <button onClick={joinRoom} ref={joinButton} className="bg-theme_gray text-theme_yellow text-xl p-2 h-12 text-center font-bold">Join</button>
                            <button onClick={toggleInputElem} ref={createButton} className="bg-theme_gray text-theme_yellow text-xl p-2 aspect-square h-12 text-center font-bold">x</button>
                        </div>
                    </div>
                    <button onClick={toggleInputElem} ref={plusButton} className="absolute -z-10 m-auto left-0 transition-all duration-500 right-0 text-theme_yellow bg-theme_gray text-3xl p-2 aspect-square h-12 text-center font-bold">+</button>
                </div>
            </div>
        </div>
    )
}
