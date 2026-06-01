import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { MODULES, supabase } from "./supabaseClient";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Agendamentos from "./components/Agendamentos";
import Clientes from "./components/Clientes";
import Servicos from "./components/Servicos";
import Produtos from "./components/Produtos";
import Atendentes from "./components/Atendentes";
import Campanhas from "./components/Campanhas";
import Financeiro from "./components/Financeiro";
import Relatorios from "./components/Relatorios";
import Usuarios from "./components/Usuarios";
import Perfis from "./components/Perfis";
import Contatos from "./components/Contatos";
import WhatsApp from "./components/WhatsApp";
import Configuracoes from "./components/Configuracoes";
import Backup from "./components/Backup";
import Personalizacao from "./components/Personalizacao";

function ModuloSimples({ page }) {
  return <div className="card"><h2>{MODULES.find((m)=>m[0]===page)?.[1] || page}</h2><p>Módulo em manutenção.</p></div>;
}

function App() {
  const [session,setSession]=useState(()=>{try{const s=localStorage.getItem("olitech_session");return s?JSON.parse(s):null;}catch{return null;}});
  const [login,setLogin]=useState({usuario:"",senha:""});
  const [page,setPage]=useState("dashboard");
  const [menuAberto,setMenuAberto]=useState(false);

  async function doLogin(){
    const u=String(login.usuario||"").trim().toLowerCase();
    const s=String(login.senha||"").trim();
    if(!u||!s)return alert("Informe usuário e senha.");
    const {data,error}=await supabase.from("usuarios").select("*");
    if(error)return alert("Erro ao consultar usuários: "+error.message);
    if(!data || data.length===0)return alert("Nenhum usuário cadastrado no banco. Rode o script criar_admin_primeiro_acesso.sql no Supabase desta empresa.");
    const user=(data||[]).find(x=>String(x.usuario||"").trim().toLowerCase()===u && String(x.senha||"").trim()===s && x.ativo!==false);
    if(!user)return alert("Usuário ou senha inválidos.");
    const sess={...user,perfil:user.perfil||"Administrador",permissoes:MODULES.map(m=>m[0])};
    localStorage.setItem("olitech_session",JSON.stringify(sess)); setSession(sess);
  }

  function sair(){localStorage.removeItem("olitech_session");setSession(null);}
  function temPermissao(m){return session?.perfil==="Administrador"||session?.perfil==="admin"||(session?.permissoes||MODULES.map(x=>x[0])).includes(m);}

  if(!session)return <Login login={login} setLogin={setLogin} doLogin={doLogin}/>;

  const telas={
    dashboard:<Dashboard/>,
    agendamentos:<Agendamentos/>,
    clientes:<Clientes/>,
    servicos:<Servicos/>,
    produtos:<Produtos/>,
    atendentes:<Atendentes/>,
    campanhas:<Campanhas/>,
    financeiro:<Financeiro/>,
    relatorios:<Relatorios/>,
    usuarios:<Usuarios/>,
    perfis:<Perfis/>,
    contatos:<Contatos/>,
    whatsapp:<WhatsApp/>,
    configuracoes:<Configuracoes session={session}/>,
    backup:<Backup session={session}/>,
    personalizacao:<Personalizacao/>
  };

  return <div className={`app ${menuAberto ? "menu-open" : ""}`}><button className="mobile-menu-btn" onClick={()=>setMenuAberto(!menuAberto)}>☰ Menu</button>{menuAberto&&<div className="menu-backdrop" onClick={()=>setMenuAberto(false)}></div>}<aside className="side"><div className="brand"><div className="logo">AO</div><div><h2>Agendamentos Olitech</h2><p>Sistema fácil e prático</p></div></div><p className="muted user-box">Usuário: <b>{session.nome}</b><br/>Perfil: <b>{session.perfil}</b></p><nav className="nav">{MODULES.filter(([k])=>temPermissao(k)).map(([k,l])=><button key={k} onClick={()=>{setPage(k);setMenuAberto(false);}} className={page===k?"on":""}>{l}</button>)}</nav><button className="btn secondary sair" onClick={sair}>Sair</button></aside><main className="main"><h1>{MODULES.find(m=>m[0]===page)?.[1]||page}</h1>{telas[page]||<ModuloSimples page={page}/>}</main></div>;
}

createRoot(document.getElementById("root")).render(<App/>);
