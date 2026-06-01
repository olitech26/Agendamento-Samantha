import React, { useEffect, useState } from "react";
import { supabase, moeda } from "../supabaseClient";

export default function Dashboard() {
  const [dados, setDados] = useState({clientes:0, agendamentos:0, atendentes:0, produtos:0, servicos:0, recebido:0, saldo:0});

  useEffect(() => {
    async function carregar() {
      const tabelas = ["clientes","agendamentos","atendentes","produtos","servicos"];
      const novo = {};
      for (const tabela of tabelas) {
        const res = await supabase.from(tabela).select("*", { count: "exact", head: true });
        novo[tabela] = res.count || 0;
      }
      const fin = await supabase.from("agendamentos").select("valor_sinal,valor_recebido,saldo");
      novo.recebido = (fin.data || []).reduce((s,a)=>s+Number(a.valor_sinal||0)+Number(a.valor_recebido||0),0);
      novo.saldo = (fin.data || []).reduce((s,a)=>s+Number(a.saldo||0),0);
      setDados(novo);
    }
    carregar();
  }, []);

  return (
    <div className="grid-dashboard">
      <div className="dashboard-card"><h2>👤 Clientes</h2><h1>{dados.clientes}</h1></div>
      <div className="dashboard-card"><h2>📅 Agendamentos</h2><h1>{dados.agendamentos}</h1></div>
      <div className="dashboard-card"><h2>👩‍💼 Atendentes</h2><h1>{dados.atendentes}</h1></div>
      <div className="dashboard-card"><h2>🧴 Produtos</h2><h1>{dados.produtos}</h1></div>
      <div className="dashboard-card"><h2>💅 Serviços</h2><h1>{dados.servicos}</h1></div>
      <div className="dashboard-card"><h2>💰 Recebido</h2><h1>R$ {moeda(dados.recebido)}</h1></div>
      <div className="dashboard-card"><h2>⏳ Saldo</h2><h1>R$ {moeda(dados.saldo)}</h1></div>
    </div>
  );
}
