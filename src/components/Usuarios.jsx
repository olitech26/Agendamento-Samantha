import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Usuarios() {
  const [usuarios,setUsuarios]=useState([]);
  const [perfis,setPerfis]=useState([]);
  const [editando,setEditando]=useState(null);
  const [busca,setBusca]=useState("");
  const [mostrarTodos,setMostrarTodos]=useState(false);
  const [form,setForm]=useState({nome:"",usuario:"",senha:"",perfil:"Administrador",ativo:"Sim"});

  async function carregar(){
    const users=await supabase.from("usuarios").select("*").order("nome");
    const perf=await supabase.from("perfis").select("*").order("nome");
    if(users.error)return alert("Erro usuários: "+users.error.message);
    if(perf.error)return alert("Erro perfis: "+perf.error.message);
    setUsuarios(users.data||[]); setPerfis(perf.data||[]);
  }
  useEffect(()=>{carregar();},[]);

  const filtrados=useMemo(()=>{
    const t=busca.trim().toLowerCase();
    if(!mostrarTodos && t.length<2)return [];
    if(mostrarTodos && t.length<2)return usuarios;
    return usuarios.filter(u=>[u.nome,u.usuario,u.perfil].some(x=>String(x||"").toLowerCase().includes(t)));
  },[usuarios,busca,mostrarTodos]);

  function limparForm(){setEditando(null);setForm({nome:"",usuario:"",senha:"",perfil:perfis[0]?.nome||"Administrador",ativo:"Sim"});}
  function editar(u){setEditando(u.id);setForm({nome:u.nome||"",usuario:u.usuario||"",senha:u.senha||"",perfil:u.perfil||"Administrador",ativo:u.ativo===false?"Não":"Sim"});window.scrollTo({top:0,behavior:"smooth"});}
  async function salvar(){
    if(!form.nome||!form.usuario||!form.senha)return alert("Preencha nome, usuário e senha.");
    const payload={nome:form.nome.trim(),usuario:form.usuario.trim(),senha:form.senha.trim(),perfil:form.perfil||"Administrador",ativo:form.ativo==="Sim"};
    const resp=editando?await supabase.from("usuarios").update(payload).eq("id",editando):await supabase.from("usuarios").insert(payload);
    if(resp.error)return alert(resp.error.message);
    limparForm();setMostrarTodos(true);carregar();
  }

  return <div className="card">
    <h2>{editando?"Editar Usuário":"Cadastrar Usuário"}</h2>
    <div className="form-grid">
      <label className="form-group">Nome<input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
      <label className="form-group">Usuário<input value={form.usuario} onChange={e=>setForm({...form,usuario:e.target.value})}/></label>
      <label className="form-group">Senha<input value={form.senha} onChange={e=>setForm({...form,senha:e.target.value})}/></label>
      <label className="form-group">Perfil<select value={form.perfil} onChange={e=>setForm({...form,perfil:e.target.value})}>{perfis.length===0&&<option>Administrador</option>}{perfis.map(p=><option key={p.id} value={p.nome}>{p.nome}</option>)}</select></label>
      <label className="form-group">Ativo<select value={form.ativo} onChange={e=>setForm({...form,ativo:e.target.value})}><option>Sim</option><option>Não</option></select></label>
    </div>
    <div className="actions"><button className="btn" onClick={salvar}>{editando?"Salvar alteração":"Cadastrar"}</button>{editando&&<button className="btn secondary" onClick={limparForm}>Cancelar</button>}</div>
    <hr/>
    <h2>Pesquisar Usuários</h2>
    <div className="search-row"><input placeholder="Digite 2 caracteres ou Mostrar todos" value={busca} onChange={e=>{setBusca(e.target.value);setMostrarTodos(false);}}/><button className="btn secondary" onClick={()=>setMostrarTodos(true)}>Mostrar todos</button><button className="btn secondary" onClick={()=>{setBusca("");setMostrarTodos(false);}}>Limpar</button></div>
    {!mostrarTodos&&busca.trim().length<2&&<p className="muted">Usuários ocultos para deixar o sistema mais rápido.</p>}
    <div className="cards-list">{filtrados.map(u=><div key={u.id} className="mini-card"><b>Nome:</b> {u.nome}<br/><b>Usuário:</b> {u.usuario}<br/><b>Perfil:</b> {u.perfil}<br/><b>Ativo:</b> {u.ativo===false?"Não":"Sim"}<br/><button className="btn secondary" onClick={()=>editar(u)}>Editar</button></div>)}</div>
  </div>;
}
