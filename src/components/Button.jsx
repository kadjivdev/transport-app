
const Button = ({ route, children,newClass }) => {
    return (
        <>
            <div className="d-flex justify-content-center mb-3">
                <Button className={`w-50 btn btn-md btn-transparent border shadow ` + newClass} to={route}>{children}</Button>
        </div >
        </>
    )
}

export default Button