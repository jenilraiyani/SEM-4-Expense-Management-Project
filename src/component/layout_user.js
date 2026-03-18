import { Outlet } from "react-router-dom";
import SidebarUser from "./sidebar_user";
function LayoutUser() {
    return (
        <>
            <div className='app-container'>
                <SidebarUser />
                <Outlet />
            </div>
        </>
    )
}
export default LayoutUser;