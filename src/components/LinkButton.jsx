import { Link } from "react-router-dom";

const LinkButton = ({ route = null, children, newClass = null }) => {
    return (
        <>
            <div className="d-flex justify-content-center mb-3">
                <Link className={`w-50 btn btn-md btn-transparent border shadow ` + newClass} to={route}>{children}</Link>
            </div >
        </>
    )
}

export default LinkButton