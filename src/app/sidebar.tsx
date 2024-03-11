'use client'

import { useState, Dispatch, SetStateAction } from 'react'

let RoomCard = (props: { room: string, key: string, selected: boolean, setSelectedRoom: Dispatch<SetStateAction<string>> }) => {
    let click = () => {
        props.setSelectedRoom(props.room);
    }
    return (
        <div onClick={click} className={`w-60 h-12 ${props.selected ? "bg-theme_gray text-theme_yellow shadow-selected_theme -translate-x-[5px] -translate-y-[5px]" : "border-2 border-theme_gray text-theme_gray hover:shadow-theme hover:-translate-x-[5px] hover:-translate-y-[5px]"} text-xl font-bold justify-center items-center flex transition-transform transition-dur`}>
            {props.room}
        </div>
    )
}

let RoomCards = () => {
    let rooms = ["PICT", "FRIENDS", "GUMMY BEARS", "MOVIEZ"]
    const [selectedRoom, setSelectedRoom] = useState("PICT")

    return (
        <div className="grid grid-flow-row gap-8 place-items-center pt-16">
            {
                rooms.map((room) => (<RoomCard room={room.toUpperCase()} key={room} selected={room === selectedRoom} setSelectedRoom={setSelectedRoom} />))
            }
        </div>
    )
}

export default function Sidebar() {
    return (
        <div className="w-72 h-screen fixed top-0 left-0 bg-theme_yellow items-center">
            <div className="text-2xl text-theme_yellow bg-theme_gray text-center p-6 font-bold">
                @AK1932
            </div>
            < RoomCards />
        </div>
    )

}
