import React from "react";

export default function Login({ login, setLogin, doLogin }) {
  return (
    <div className="login">
      <div className="login-card">
        <h1>Agendamentos Olitech</h1>
        <p className="muted">Acesse o sistema.</p>
        <label>Usuário</label>
        <input autoFocus value={login.usuario} onChange={(e)=>setLogin({...login,usuario:e.target.value})}/>
        <label>Senha</label>
        <input type="password" value={login.senha} onChange={(e)=>setLogin({...login,senha:e.target.value})} onKeyDown={(e)=>{if(e.key==="Enter")doLogin();}}/>
        <button className="btn" onClick={doLogin}>🔐 Entrar</button>
      </div>
    </div>
  );
}
