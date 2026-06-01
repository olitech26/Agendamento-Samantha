import React, { useEffect, useState } from "react";
import { MODULES, supabase } from "../supabaseClient";

export default function Perfis() {
  const [lista,setLista]=useState([]),[nome,setNome]=useState(""),[permissoes,setPermissoes]=useState([]),[editando,setEditando]=useState(null);
  async function carregar(){const {data,error}=await supabase.from("perfis").select("*").order("nome"); if(error)return alert(error.message); setLista(data||[]);}
  useEffect(()=>{carregar();},[]);
  function toggle(k){setPermissoes(a=>a.includes(k)?a.filter(x=>x!==k):[...a,k]);}
  function editar(p){setEditando(p.id);setNome(p.nome||"");setPermissoes(p.permissoes||[]);window.scrollTo({top:0,behavior:"smooth"});}
  async function salvar(){if(!nome.trim())return alert("Informe o perfil."); const payload={nome:nome.trim(),permissoes}; const resp=editando?await supabase.from("perfis").update(payload).eq("id",editando):await supabase.from("perfis").insert(payload); if(resp.error)return alert(resp.error.message); setNome("");setPermissoes([]);setEditando(null);carregar();}
  return <div className="card"><h2>{editando?"Editar Perfil":"Cadastrar Perfil"}</h2><label className="form-group">Nome do perfil<input value={nome} onChange={e=>setNome(e.target.value)}/></label><div className="permissions-grid">{MODULES.map(([k,l])=><label className="permission-item" key={k}><input type="checkbox" checked={permissoes.includes(k)} onChange={()=>toggle(k)}/><span>{l}</span></label>)}</div><div className="actions"><button className="btn" onClick={salvar}>{editando?"Salvar alteração":"Cadastrar Perfil"}</button>{editando&&<button className="btn secondary" onClick={()=>{setEditando(null);setNome("");setPermissoes([]);}}>Cancelar</button>}</div><hr/><div className="cards-list">{lista.map(p=><div className="mini-card" key={p.id}><b>{p.nome}</b><p>Permissões: {(p.permissoes||[]).join(", ")}</p><button className="btn secondary" onClick={()=>editar(p)}>Editar</button></div>)}</div></div>;
}
