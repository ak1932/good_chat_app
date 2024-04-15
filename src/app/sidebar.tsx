'use client'

import { Dispatch, SetStateAction, useContext } from 'react'
import { AccountContext } from './components/AccountContext'

let RoomCard = (props: { room: string, key: string, selected: boolean, setSelectedRoom: Dispatch<SetStateAction<string | null>> }) => {
    let { user, setUser } = useContext(AccountContext);
    let click = () => {
        props.setSelectedRoom(props.room);
        console.log(`changing room from ${user!.selectedRoom} to ${props.room}`)
        user!.selectedRoom = props.room;
        setUser(user)
    }
    return (
        <button onClick={click} className={`w-60 h-12 ${props.selected ? "bg-theme_gray text-theme_yellow shadow-selected_theme -translate-x-[5px] -translate-y-[5px]" : "border-2 border-theme_gray text-theme_gray hover:shadow-theme hover:-translate-x-[5px] hover:-translate-y-[5px]"} text-xl font-bold justify-center items-center flex transition-transform transition-dur`}>
            {props.room}
        </button>
    )
}

export default function Sidebar(props: { setRoom: Dispatch<SetStateAction<string | null>> }) {
    const { user } = useContext(AccountContext)
    let rooms = ["PICT"]
    const selectedRoom = user!.selectedRoom

    return (
        <div className="w-72 h-screen fixed top-0 left-0 bg-theme_yellow items-center">
            <div className="text-2xl text-theme_yellow bg-theme_gray text-center p-6 font-bold">
                {"@" + user!.username.toUpperCase()}
            </div>
            <div className="grid grid-flow-row gap-8 place-items-center pt-16">
                {
                    rooms.map((room) => (<RoomCard room={room.toUpperCase()} key={room} selected={room === selectedRoom} setSelectedRoom={props.setRoom} />))
                }
            </div>
        </div>
    )
}
