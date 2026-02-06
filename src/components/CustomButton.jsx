
const CustomButton = ({ children, newClass, ...props }) => {
    return (
        <>
            <div className="d-flex justify-content-center mb-3">
                <button
                    className={`w-50 btn btn-md btn-transparent border shadow ` + newClass}
                    {...props}>{children}</button>
            </div >
        </>
    )
}

export default CustomButton