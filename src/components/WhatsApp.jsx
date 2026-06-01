import React, { useEffect, useState } from "react";
import { enviarWhatsapp, getEvolutionConfig, mascaraTelefone } from "../supabaseClient";

export default function WhatsApp() {
  const [num,setNum]=useState(""),[texto,setTexto]=useState("Teste Olitech WhatsApp 🚀"),[status,setStatus]=useState(null),[cfg,setCfg]=useState(null),[enviando,setEnviando]=useState(false);
  async function carregarCfg(){const c=await getEvolutionConfig(); setCfg(c); return c;}
  async function verStatus(){try{const c=await carregarCfg(); const r=await fetch(`${c.url}/instance/connectionState/${c.instance}`,{headers:{apikey:c.key}}); setStatus(await r.json());}catch(err){setStatus({erro:err.message});}}
  async function testar(){try{setEnviando(true); await enviarWhatsapp(num,texto); alert("Mensagem enviada.");}catch(err){alert("Erro ao enviar: "+err.message);}finally{setEnviando(false);}}
  useEffect(()=>{verStatus();},[]);
  return <div className="card"><h2>🟢 WhatsApp Evolution</h2><p>URL: {cfg?.url||"..."}</p><button className="btn secondary" onClick={verStatus}>Atualizar status</button><pre>{JSON.stringify(status,null,2)}</pre><label className="form-group">Número com DDD<input placeholder="(16) 99607-6918" value={mascaraTelefone(num)} onChange={e=>setNum(e.target.value)}/></label><label className="form-group">Mensagem<textarea value={texto} onChange={e=>setTexto(e.target.value)}/></label><button className="btn" onClick={testar} disabled={enviando}>{enviando?"Enviando...":"Enviar teste"}</button><p className="muted">Para conectar/trocar o celular, use a aba Configurações → WhatsApp da Loja.</p></div>;
}
