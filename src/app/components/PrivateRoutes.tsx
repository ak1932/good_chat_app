import { useContext } from "react";
import { AccountContext } from "./AccountContext";

const useAuth = () => {
    const { user } = useContext(AccountContext)
    return user && user.loggedIn;
}

const PrivateRoutes = () => {
    const isAuth = useAuth();
    return <></>
}

export default PrivateRoutes
