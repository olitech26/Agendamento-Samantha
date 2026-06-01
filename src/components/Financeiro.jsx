import React, { useEffect, useMemo, useState } from "react";
import { dataBR, moeda, supabase } from "../supabaseClient";
import SearchSelect from "./SearchSelect";

const hoje = () => new Date().toISOString().slice(0, 10);
const mesInicio = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

function parseValor(v) {
  return Number(String(v ?? 0).replace(".", "").replace(",", ".")) || 0;
}

function exportarCSV(nomeArquivo, linhas) {
  if (!linhas.length) return alert("Não há dados para exportar.");
  const headers = Object.keys(linhas[0]);
  const csv = [headers.join(";"), ...linhas.map((l) => headers.map((h) => `"${String(l[h] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

function imprimirRelatorio(titulo, html) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>${titulo}</title><style>body{font-family:Arial;padding:24px;color:#111}h1{margin:0 0 14px}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}.totais{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.box{border:1px solid #ddd;border-radius:10px;padding:10px}.box b{display:block;font-size:18px;margin-top:6px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Imprimir</button>${html}<script>setTimeout(()=>window.print(),300)</script></body></html>`);
  win.document.close();
}

export default function Financeiro() {
  const [aba, setAba] = useState("movimentos");
  const [movimentos, setMovimentos] = useState([]);
  const [formas, setFormas] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState({ inicio: mesInicio(), fim: hoje(), tipo: "", categoria: "", status: "", texto: "" });
  const [form, setForm] = useState({
    data_movimento: hoje(), tipo: "entrada", descricao: "", categoria: "Serviços", valor: "", forma_pagamento: "", status: "pago", atendente_id: "", atendente_nome: "", observacoes: ""
  });
  const [formaForm, setFormaForm] = useState({ nome: "", tipo: "Pix", taxa_percentual: 0, desconto_percentual: 0, ativo: "Sim" });
  const [formaEditando, setFormaEditando] = useState(null);

  async function carregar() {
    const [mov, pag, ate] = await Promise.all([
      supabase.from("financeiro_movimentos").select("*").order("data_movimento", { ascending: false }).order("criado_em", { ascending: false }),
      supabase.from("pagamentos").select("*").order("nome"),
      supabase.from("atendentes").select("*").order("nome")
    ]);
    if (mov.error) alert("Erro financeiro: " + mov.error.message);
    if (pag.error) alert("Erro formas de pagamento: " + pag.error.message);
    setMovimentos(mov.data || []);
    setFormas(pag.data || []);
    setAtendentes(ate.data || []);
  }
  useEffect(() => { carregar(); }, []);

  const lista = useMemo(() => {
    const t = filtro.texto.trim().toLowerCase();
    return movimentos.filter((m) =>
      !(filtro.inicio && String(m.data_movimento || "") < filtro.inicio) &&
      !(filtro.fim && String(m.data_movimento || "") > filtro.fim) &&
      !(filtro.tipo && m.tipo !== filtro.tipo) &&
      !(filtro.categoria && m.categoria !== filtro.categoria) &&
      !(filtro.status && m.status !== filtro.status) &&
      !(t && ![m.descricao, m.categoria, m.forma_pagamento, m.atendente_nome, m.observacoes].some((x) => String(x || "").toLowerCase().includes(t)))
    );
  }, [movimentos, filtro]);

  const resumo = useMemo(() => {
    const entradas = lista.filter((m) => m.tipo === "entrada").reduce((s, m) => s + Number(m.valor || 0), 0);
    const saidas = lista.filter((m) => m.tipo === "saida").reduce((s, m) => s + Number(m.valor || 0), 0);
    const prolabore = lista.filter((m) => m.tipo === "prolabore").reduce((s, m) => s + Number(m.valor || 0), 0);
    const pendente = lista.filter((m) => m.status !== "pago").reduce((s, m) => s + Number(m.valor || 0), 0);
    return { entradas, saidas, prolabore, pendente, lucro: entradas - saidas - prolabore };
  }, [lista]);

  const porCategoria = useMemo(() => {
    const mapa = {};
    for (const m of lista) {
      const k = `${m.tipo || "outros"}|${m.categoria || "Sem categoria"}`;
      if (!mapa[k]) mapa[k] = { tipo: m.tipo || "", categoria: m.categoria || "Sem categoria", total: 0, qtd: 0 };
      mapa[k].qtd += 1;
      mapa[k].total += Number(m.valor || 0);
    }
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [lista]);

  function limparForm() {
    setEditando(null);
    setForm({ data_movimento: hoje(), tipo: "entrada", descricao: "", categoria: "Serviços", valor: "", forma_pagamento: "", status: "pago", atendente_id: "", atendente_nome: "", observacoes: "" });
  }
  function editar(m) {
    setEditando(m.id);
    setForm({
      data_movimento: m.data_movimento || hoje(), tipo: m.tipo || "entrada", descricao: m.descricao || "", categoria: m.categoria || "", valor: Number(m.valor || 0), forma_pagamento: m.forma_pagamento || "", status: m.status || "pago", atendente_id: m.atendente_id || "", atendente_nome: m.atendente_nome || "", observacoes: m.observacoes || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function salvarMovimento() {
    if (!form.descricao) return alert("Informe a descrição.");
    if (!parseValor(form.valor)) return alert("Informe o valor.");
    const payload = { ...form, valor: parseValor(form.valor) };
    const resp = editando ? await supabase.from("financeiro_movimentos").update(payload).eq("id", editando) : await supabase.from("financeiro_movimentos").insert(payload);
    if (resp.error) return alert(resp.error.message);
    limparForm();
    carregar();
    alert(editando ? "Movimento atualizado." : "Movimento cadastrado.");
  }
  async function excluirMovimento(id) {
    if (!confirm("Excluir este lançamento financeiro?")) return;
    const resp = await supabase.from("financeiro_movimentos").delete().eq("id", id);
    if (resp.error) return alert(resp.error.message);
    carregar();
  }

  function editarForma(p) {
    setFormaEditando(p.id);
    setFormaForm({ nome: p.nome || "", tipo: p.tipo || "", taxa_percentual: Number(p.taxa_percentual || 0), desconto_percentual: Number(p.desconto_percentual || 0), ativo: p.ativo === false ? "Não" : "Sim" });
  }
  async function salvarForma() {
    if (!formaForm.nome) return alert("Informe o nome da forma de pagamento.");
    const payload = { ...formaForm, taxa_percentual: Number(formaForm.taxa_percentual || 0), desconto_percentual: Number(formaForm.desconto_percentual || 0), ativo: formaForm.ativo === "Sim" };
    const resp = formaEditando ? await supabase.from("pagamentos").update(payload).eq("id", formaEditando) : await supabase.from("pagamentos").insert(payload);
    if (resp.error) return alert(resp.error.message);
    setFormaEditando(null); setFormaForm({ nome: "", tipo: "Pix", taxa_percentual: 0, desconto_percentual: 0, ativo: "Sim" }); carregar();
  }

  function imprimir() {
    const linhas = lista.map((m) => `<tr><td>${dataBR(m.data_movimento)}</td><td>${m.tipo}</td><td>${m.descricao || ""}</td><td>${m.categoria || ""}</td><td>${m.forma_pagamento || ""}</td><td>${m.status || ""}</td><td>R$ ${moeda(m.valor)}</td></tr>`).join("");
    imprimirRelatorio("Relatório Financeiro", `<h1>Relatório Financeiro</h1><p>Período: ${dataBR(filtro.inicio)} até ${dataBR(filtro.fim)}</p><div class="totais"><div class="box">Entradas<b>R$ ${moeda(resumo.entradas)}</b></div><div class="box">Saídas<b>R$ ${moeda(resumo.saidas)}</b></div><div class="box">Pró-labore<b>R$ ${moeda(resumo.prolabore)}</b></div><div class="box">Lucro<b>R$ ${moeda(resumo.lucro)}</b></div></div><table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Forma</th><th>Status</th><th>Valor</th></tr></thead><tbody>${linhas}</tbody></table>`);
  }

  const categorias = ["Serviços", "Produtos", "Sinal", "Recebimento", "Aluguel", "Conta de luz", "Internet", "Telefone", "Material", "Salário", "Comissão", "Pró-labore", "Manutenção", "Imposto", "Marketing", "Outros"];

  return <div className="card financeiro-page">
    <h2>💰 Financeiro Completo</h2>
    <div className="tab-row">
      <button className={`btn ${aba === "movimentos" ? "" : "secondary"}`} onClick={() => setAba("movimentos")}>Entradas / Saídas</button>
      <button className={`btn ${aba === "prolabore" ? "" : "secondary"}`} onClick={() => setAba("prolabore")}>Pró-labore</button>
      <button className={`btn ${aba === "formas" ? "" : "secondary"}`} onClick={() => setAba("formas")}>Formas de pagamento</button>
      <button className={`btn ${aba === "relatorios" ? "" : "secondary"}`} onClick={() => setAba("relatorios")}>Relatórios</button>
    </div>

    {(aba === "movimentos" || aba === "prolabore") && <>
      <h2>{editando ? "Editar lançamento" : aba === "prolabore" ? "Cadastrar Pró-labore / Retirada" : "Cadastrar Entrada ou Saída"}</h2>
      <div className="form-grid">
        <label className="form-group">Data<input type="date" value={form.data_movimento} onChange={(e) => setForm({ ...form, data_movimento: e.target.value })} /></label>
        <label className="form-group">Tipo<select value={aba === "prolabore" ? "prolabore" : form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, categoria: e.target.value === "prolabore" ? "Pró-labore" : form.categoria })} disabled={aba === "prolabore"}><option value="entrada">Entrada</option><option value="saida">Saída</option><option value="prolabore">Pró-labore</option></select></label>
        <label className="form-group">Descrição<input value={form.descricao} placeholder="Ex: pagamento cliente, aluguel, retirada do dono" onChange={(e) => setForm({ ...form, descricao: e.target.value, tipo: aba === "prolabore" ? "prolabore" : form.tipo, categoria: aba === "prolabore" ? "Pró-labore" : form.categoria })} /></label>
        <label className="form-group">Categoria<select value={aba === "prolabore" ? "Pró-labore" : form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} disabled={aba === "prolabore"}>{categorias.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="form-group">Valor<input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></label>
        <label className="form-group">Forma de pagamento<select value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}><option value="">Selecione</option>{formas.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}</select></label>
        <label className="form-group">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option></select></label>
        <SearchSelect label="Atendente / Responsável" items={atendentes} value={form.atendente_id} onChange={(a) => setForm({ ...form, atendente_id: a?.id || "", atendente_nome: a?.nome || "" })} />
        <label className="form-group full">Observações<textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></label>
      </div>
      <div className="actions"><button className="btn" onClick={() => { if (aba === "prolabore") setForm((x) => ({ ...x, tipo: "prolabore", categoria: "Pró-labore" })); setTimeout(salvarMovimento, 0); }}>{editando ? "Salvar alteração" : "Cadastrar lançamento"}</button>{editando && <button className="btn secondary" onClick={limparForm}>Cancelar</button>}</div>
    </>}

    {aba === "formas" && <>
      <h2>{formaEditando ? "Editar forma de pagamento" : "Cadastrar forma de pagamento"}</h2>
      <div className="form-grid">
        <label className="form-group">Nome<input value={formaForm.nome} onChange={(e) => setFormaForm({ ...formaForm, nome: e.target.value })} /></label>
        <label className="form-group">Tipo<select value={formaForm.tipo} onChange={(e) => setFormaForm({ ...formaForm, tipo: e.target.value })}><option>Pix</option><option>Dinheiro</option><option>Débito</option><option>Crédito</option><option>Boleto</option><option>Transferência</option><option>Outro</option></select></label>
        <label className="form-group">Taxa %<input type="number" value={formaForm.taxa_percentual} onChange={(e) => setFormaForm({ ...formaForm, taxa_percentual: e.target.value })} /></label>
        <label className="form-group">Desconto %<input type="number" value={formaForm.desconto_percentual} onChange={(e) => setFormaForm({ ...formaForm, desconto_percentual: e.target.value })} /></label>
        <label className="form-group">Ativo<select value={formaForm.ativo} onChange={(e) => setFormaForm({ ...formaForm, ativo: e.target.value })}><option>Sim</option><option>Não</option></select></label>
      </div>
      <div className="actions"><button className="btn" onClick={salvarForma}>{formaEditando ? "Salvar alteração" : "Cadastrar"}</button>{formaEditando && <button className="btn secondary" onClick={() => { setFormaEditando(null); setFormaForm({ nome: "", tipo: "Pix", taxa_percentual: 0, desconto_percentual: 0, ativo: "Sim" }); }}>Cancelar</button>}</div>
      <hr />
      <div className="cards-list">{formas.map((p) => <div key={p.id} className="mini-card"><b>{p.nome}</b><br />Tipo: {p.tipo}<br />Taxa: {p.taxa_percentual || 0}%<br />Desconto: {p.desconto_percentual || 0}%<br />Ativo: {p.ativo === false ? "Não" : "Sim"}<br /><button className="btn secondary" onClick={() => editarForma(p)}>Editar</button></div>)}</div>
    </>}

    <hr />
    <h2>Filtros e Resumo</h2>
    <div className="form-grid">
      <label className="form-group">Data inicial<input type="date" value={filtro.inicio} onChange={(e) => setFiltro({ ...filtro, inicio: e.target.value })} /></label>
      <label className="form-group">Data final<input type="date" value={filtro.fim} onChange={(e) => setFiltro({ ...filtro, fim: e.target.value })} /></label>
      <label className="form-group">Tipo<select value={filtro.tipo} onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}><option value="">Todos</option><option value="entrada">Entrada</option><option value="saida">Saída</option><option value="prolabore">Pró-labore</option></select></label>
      <label className="form-group">Categoria<select value={filtro.categoria} onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}><option value="">Todas</option>{categorias.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="form-group">Status<select value={filtro.status} onChange={(e) => setFiltro({ ...filtro, status: e.target.value })}><option value="">Todos</option><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option></select></label>
      <label className="form-group">Pesquisar<input placeholder="Descrição, forma, atendente..." value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} /></label>
    </div>
    <div className="actions"><button className="btn secondary" onClick={() => setFiltro({ inicio: mesInicio(), fim: hoje(), tipo: "", categoria: "", status: "", texto: "" })}>Limpar filtros</button><button className="btn secondary" onClick={imprimir}>Imprimir/PDF</button><button className="btn secondary" onClick={() => exportarCSV("financeiro.csv", lista.map((m) => ({ data: dataBR(m.data_movimento), tipo: m.tipo, descricao: m.descricao, categoria: m.categoria, forma: m.forma_pagamento, status: m.status, valor: moeda(m.valor), atendente: m.atendente_nome })))}>Exportar CSV</button></div>
    <div className="grid-dashboard finance-summary"><div className="dashboard-card entrada"><h2>Entradas</h2><h1>R$ {moeda(resumo.entradas)}</h1></div><div className="dashboard-card saida"><h2>Saídas</h2><h1>R$ {moeda(resumo.saidas)}</h1></div><div className="dashboard-card prolabore"><h2>Pró-labore</h2><h1>R$ {moeda(resumo.prolabore)}</h1></div><div className="dashboard-card lucro"><h2>Lucro líquido</h2><h1>R$ {moeda(resumo.lucro)}</h1></div><div className="dashboard-card"><h2>Pendente</h2><h1>R$ {moeda(resumo.pendente)}</h1></div></div>

    {(aba === "relatorios" || aba === "movimentos" || aba === "prolabore") && <>
      <hr />
      <h2>Relatório por categoria</h2>
      <div className="table-wrap"><table><thead><tr><th>Tipo</th><th>Categoria</th><th>Quantidade</th><th>Total</th></tr></thead><tbody>{porCategoria.map((r) => <tr key={`${r.tipo}-${r.categoria}`}><td data-label="Tipo">{r.tipo}</td><td data-label="Categoria">{r.categoria}</td><td data-label="Quantidade">{r.qtd}</td><td data-label="Total">R$ {moeda(r.total)}</td></tr>)}</tbody></table></div>
      <hr />
      <h2>Lançamentos</h2>
      <div className="cards-list">{lista.map((m) => <div key={m.id} className={`mini-card mov-${m.tipo}`}><b>{dataBR(m.data_movimento)} - {m.descricao}</b><br />Tipo: {m.tipo}<br />Categoria: {m.categoria}<br />Forma: {m.forma_pagamento || "-"}<br />Status: {m.status}<br />Valor: R$ {moeda(m.valor)}<br />Responsável: {m.atendente_nome || "-"}<br />Obs: {m.observacoes || "-"}<div className="actions"><button className="btn secondary" onClick={() => editar(m)}>Editar</button><button className="btn danger" onClick={() => excluirMovimento(m.id)}>Excluir</button></div></div>)}</div>
    </>}
  </div>;
}
