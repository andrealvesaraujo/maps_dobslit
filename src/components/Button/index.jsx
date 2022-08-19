import './Button.scss'

const Button = (props) => {
    return (
        <button {...props} type='button' onClick={props.onClick}>{props.children}</button>
    )
}

export default Button;