import React, { useEffect, useState } from "react";
import { enviarImagemWhatsapp, enviarWhatsapp, supabase } from "../supabaseClient";

export default function Campanhas() {
  const [clientes,setClientes]=useState([]),[sel,setSel]=useState([]);
  const [msg,setMsg]=useState("Olá {nome}, temos uma promoção especial para você!");
  const [imagem,setImagem]=useState(null),[mimetype,setMimetype]=useState("image/jpeg"),[preview,setPreview]=useState("");
  const [enviando,setEnviando]=useState(false);

  async function carregar(){const cl=await supabase.from("clientes").select("*").order("nome"); if(cl.error)return alert(cl.error.message); setClientes(cl.data||[]);}
  useEffect(()=>{carregar();},[]);

  function carregarImagem(e){const file=e.target.files?.[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{const result=String(r.result||""); setPreview(result); setImagem(result.split(",")[1]); setMimetype(file.type||"image/jpeg");}; r.readAsDataURL(file);}
  async function disparar(){const lista=clientes.filter(c=>sel.includes(c.id)); if(!lista.length)return alert("Selecione contatos."); setEnviando(true); for(const c of lista){const texto=msg.replaceAll("{nome}",c.nome||"").replaceAll("{telefone}",c.telefone||""); try{ if(imagem) await enviarImagemWhatsapp(c.whatsapp||c.telefone,texto,imagem,mimetype); else await enviarWhatsapp(c.whatsapp||c.telefone,texto);}catch(e){console.error(e);} await new Promise(r=>setTimeout(r, Math.floor(Math.random()*5000)+3000));} setEnviando(false); alert("Campanha enviada.");}
  return <div className="card"><h2>📣 Campanhas WhatsApp</h2><label className="form-group">Mensagem<textarea value={msg} onChange={e=>setMsg(e.target.value)}/></label><div className="import-box"><label className="btn">Anexar imagem da campanha<input type="file" accept="image/*" onChange={carregarImagem} style={{display:"none"}}/></label>{preview&&<button className="btn secondary" onClick={()=>{setImagem(null);setPreview("");}}>Remover imagem</button>}</div>{preview&&<img src={preview} alt="Prévia" style={{maxWidth:280,borderRadius:14,marginTop:10,border:"1px solid #ddd"}}/>}<div className="actions"><button className="btn secondary" onClick={()=>setSel(clientes.map(c=>c.id))}>Selecionar todos</button><button className="btn secondary" onClick={()=>setSel([])}>Limpar seleção</button><button className="btn" disabled={enviando} onClick={disparar}>{enviando?"Enviando...":imagem?"Enviar campanha com imagem":"Enviar campanha"}</button></div><hr/><div className="cards-list">{clientes.map(c=><label className="permission-item" key={c.id}><input type="checkbox" checked={sel.includes(c.id)} onChange={()=>setSel(sel.includes(c.id)?sel.filter(x=>x!==c.id):[...sel,c.id])}/><span><b>{c.nome}</b><br/>{c.whatsapp||c.telefone}</span></label>)}</div></div>;
}
