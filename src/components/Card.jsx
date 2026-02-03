const Card = ({ children }) => {
    return (
        <div className="card p-2 border shadow-sm">
            {children}
        </div>
    )
}

export default Card;