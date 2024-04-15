let ErrText = (props: {error: string | null}) => {
    if(props.error){
        return(<h1 className="bg-red-800 p-1 border-theme_gray border-2">{props.error}</h1>);
    }
    else {
        return(<></>);
    }
}

export default ErrText
