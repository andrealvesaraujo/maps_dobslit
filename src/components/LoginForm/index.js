import React from 'react';

import Button from '../Button';
import { toast } from 'react-toastify';

import './LoginForm.scss'

export default class LoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLogged: false,
            login: '',
            password: ''
        }
    }

    handleOnInputChange = (e) =>{
        this.setState({
           ...this.state,
          [e.target.name] : e.target.value
        })
    }

    handleLogin = (e)=> {
        e.preventDefault()
        if(!this.state.login || !this.state.password ){
          toast.error("Preencha o login e a senha", {
            theme: "colored", 
            autoClose: 2500
          })
          return
        }
        if(this.state.login === "dobslitmaps" && this.state.password === "dobslitmaps123"){
            window.sessionStorage.setItem("isLogged", true);
            this.props.updateMapState()
            return
        }
        toast.error("Login e Senha incorretos", {
          theme: "colored", 
          autoClose: 2500
        })
    }

    render(){
        return (
            <form className="container-login" onSubmit={this.handleLogin}>
              <label>Login</label>
              <input type='text' name='login' onChange={(e)=> this.handleOnInputChange(e)} />
              <label>Senha</label>
              <input type='password' name='password' onChange={(e)=> this.handleOnInputChange(e)} />
              <Button className="btn-info" type='submit'>Logar</Button>        
          </form>
        )
    }
}