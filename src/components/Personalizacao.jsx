import React, { useEffect, useState } from "react";

export default function Personalizacao() {
  const [tema,setTema]=useState(localStorage.getItem("olitech_tema")||"#ec4899");
  useEffect(()=>{document.documentElement.style.setProperty("--primary",tema);localStorage.setItem("olitech_tema",tema);},[tema]);
  return <div className="card"><h2>🎨 Personalização</h2><label className="form-group">Cor principal<input type="color" value={tema} onChange={e=>setTema(e.target.value)}/></label></div>;
}
