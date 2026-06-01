import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function PesquisaCrudModulo({ tabela, titulo, campos, buscaCampos = ["nome"], orderBy = "nome" }) {
  const vazio = useMemo(() => {
    const obj = {};
    campos.forEach((c)=>{ obj[c.nome] = c.tipo === "select" ? c.opcoes[0] : ""; });
    return obj;
  }, [campos]);

  const [lista,setLista] = useState([]);
  const [form,setForm] = useState(vazio);
  const [editando,setEditando] = useState(null);
  const [busca,setBusca] = useState("");
  const [mostrarTodos,setMostrarTodos] = useState(false);
  const [carregando,setCarregando] = useState(false);

  async function carregar() {
    setCarregando(true);
    let q = supabase.from(tabela).select("*");
    if (orderBy) q = q.order(orderBy);
    const {data,error} = await q;
    setCarregando(false);
    if (error) return alert(`Erro ao carregar ${titulo}: ${error.message}`);
    setLista(data || []);
  }
  useEffect(()=>{carregar();},[tabela]);

  const listaFiltrada = useMemo(()=>{
    const t = busca.trim().toLowerCase();
    if (!mostrarTodos && t.length < 2) return [];
    if (mostrarTodos && t.length < 2) return lista;
    return lista.filter((item)=>buscaCampos.some((campo)=>String(item[campo] || "").toLowerCase().includes(t)));
  }, [lista,busca,mostrarTodos,buscaCampos]);

  function editar(item) {
    const novo = {};
    campos.forEach((c)=>{ novo[c.nome] = c.nome==="ativo" ? (item[c.nome] ? "Sim" : "Não") : item[c.nome] ?? ""; });
    setEditando(item.id); setForm(novo); window.scrollTo({top:0, behavior:"smooth"});
  }
  function cancelar(){ setEditando(null); setForm(vazio); }

  async function salvar() {
    const payload = {};
    campos.forEach((c)=>{
      if (c.nome === "ativo") payload[c.nome] = form[c.nome] === "Sim";
      else if (c.tipo === "number") payload[c.nome] = Number(form[c.nome] || 0);
      else payload[c.nome] = form[c.nome];
    });
    const resp = editando ? await supabase.from(tabela).update(payload).eq("id", editando) : await supabase.from(tabela).insert(payload);
    if (resp.error) return alert(resp.error.message);
    cancelar(); setMostrarTodos(true); carregar();
  }

  return (
    <div className="card">
      <h2>{editando ? `Editar ${titulo}` : `Cadastrar ${titulo}`}</h2>
      <div className="form-grid">
        {campos.map((c)=>(
          <label key={c.nome} className="form-group">
            {c.label}
            {c.tipo === "select" ? (
              <select value={form[c.nome]} onChange={(e)=>setForm({...form,[c.nome]:e.target.value})}>
                {c.opcoes.map((o)=><option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type={c.tipo || "text"} value={form[c.nome]} onChange={(e)=>setForm({...form,[c.nome]:e.target.value})}/>
            )}
          </label>
        ))}
      </div>
      <div className="actions">
        <button className="btn" onClick={salvar}>{editando ? "Salvar alteração" : "Cadastrar"}</button>
        {editando && <button className="btn secondary" onClick={cancelar}>Cancelar</button>}
      </div>
      <hr/>
      <h2>Pesquisar {titulo}</h2>
      <div className="search-row">
        <input placeholder="Digite 2 caracteres ou clique em Mostrar todos" value={busca} onChange={(e)=>{setBusca(e.target.value); setMostrarTodos(false);}}/>
        <button className="btn secondary" onClick={()=>setMostrarTodos(true)}>Mostrar todos</button>
        <button className="btn secondary" onClick={()=>{setBusca("");setMostrarTodos(false);}}>Limpar</button>
      </div>
      {carregando && <p>Carregando...</p>}
      {!mostrarTodos && busca.trim().length < 2 && <p className="muted">A lista fica oculta para deixar o sistema mais rápido.</p>}
      <div className="cards-list">
        {listaFiltrada.map((item)=>(
          <div key={item.id} className="mini-card">
            {campos.map((c)=><div key={c.nome}><b>{c.label}:</b> {c.nome==="ativo" ? (item[c.nome] ? "Sim" : "Não") : String(item[c.nome] ?? "")}</div>)}
            <button className="btn secondary" onClick={()=>editar(item)}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
