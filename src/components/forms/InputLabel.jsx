
const InputLabel = ({text, htmlFor, required}) => {
    return <label htmlFor={htmlFor} className="form-label">{text} {required ? <span className="text-danger">*</span> : null}</label>
}

export default InputLabel;