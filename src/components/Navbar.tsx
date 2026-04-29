import {Link, useNavigate} from "react-router-dom";
import { useContext } from "react";
import {useAuth} from "../context/AuthContext";


export default function Navbar()
{
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () =>{
        await logout();
        navigate("/login");
    };

    return(
        <nav className="navbar">
            <div className="left">
                <Link to="/">TF-Calendar</Link>
            </div>

            <div className="right">
                {user ?(
                    <>
                    <span>{user.nomComplet}</span>
                    <button onClick={handleLogout}>Logout</button>
                    </>
                ):(
                    <Link to="/login">Login</Link>
                )
                }
            </div>
            </nav>
    );
}