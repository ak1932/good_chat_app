let ChatBubble = (props: { from: string, text: string }) => {
    let diff = (props.from === "ak1932");
    return (
        <>
            <div className={`relative ${diff ? "border-theme_yellow shadow-chat_yellow_theme" : "border-theme_red shadow-chat_red_theme"} text-lg max-w-full p-4 border-2`}>
                <p>{props.text}</p>
            </div>
            <h1 className={`${diff ? "text-theme_yellow" : "text-theme_red"} font-bold`}>{`@${props.from}`}</h1>
        </>
    );
}

interface Chat {
    from: string,
    text: string,
}

let MsgWin = () => {


    let chats: Chat[] = [
        {
            from: "ak1932",
            text: "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."
        },
        {
            from: "uwu",
            text: "Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat."
        },
        {
            from: "sahil",
            text: "Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat."
        }
    ]

    return (
        <div className="ml-8 mr-8 relative h-screen">
            <div className="flex gap-4 flex-col-reverse">
                <div className="h-24 bg-theme_bg">
                </div>
                {chats.map((chat) => (
                    <ChatBubble from={chat.from} text={chat.text} />
                ))}
            </div>
            <div className="origin-bottom h-16 border-theme_yellow fixed whitespace-normal bottom-5 bg-theme_gray flex flex-row w-[calc(100%-22em)]">
                <input className="bg-theme_gray focus:outline-0 focus:outline-none pl-8 inline-block]"></input>
                <div className="h-12 w-32 border-4 m-2 border-theme_yellow font-bold flex justify-center items-center hover:bg-theme_yellow hover:text-theme_gray">SEND
                </div>
            </div>
        </div>
    )
}

export default function Home() {
    return (
        <div className="h-screen ml-72 mt-8 relative">
            <MsgWin />
        </div>
    );
}
