import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const DEFAULT_EVOLUTION_URL = "https://evolution-api-production-07d9.up.railway.app";
export const DEFAULT_EVOLUTION_KEY = "olitech123";
export const DEFAULT_EVOLUTION_INSTANCE = "olitech";

export const MODULES = [
  ["dashboard", "📊 Dashboard"],
  ["agendamentos", "📅 Agendamentos"],
  ["clientes", "👤 Clientes"],
  ["servicos", "💅 Serviços"],
  ["produtos", "🧴 Produtos"],
  ["atendentes", "👩‍💼 Atendentes"],
  ["campanhas", "📣 Campanhas"],
  ["financeiro", "💰 Financeiro"],
  ["relatorios", "📈 Relatórios"],
  ["usuarios", "👥 Usuários"],
  ["perfis", "🔐 Perfis"],
  ["contatos", "📲 Contatos"],
  ["whatsapp", "🟢 WhatsApp"],
  ["configuracoes", "⚙️ Configurações"],
  ["backup", "💾 Backup"],
  ["personalizacao", "🎨 Personalização"]
];

export const TABELAS_BACKUP = [
  "usuarios","perfis","clientes","servicos","produtos","atendentes",
  "pagamentos","financeiro_movimentos","campanhas","agendamentos","configuracoes"
];

export const limpar = (v) => String(v || "").replace(/\D/g, "");

export function numeroBR(v) {
  const n0 = limpar(v);
  if (!n0) return "";
  if (n0.startsWith("55")) return n0;
  if (n0.length === 10 || n0.length === 11) return "55" + n0;
  return n0;
}

export function mascaraTelefone(v) {
  const n = limpar(v).replace(/^55/, "");
  if (!n) return "";
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

export function dataBR(data) {
  if (!data) return "";
  const p = String(data).split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(data);
}

export function moeda(v) {
  return Number(v || 0).toFixed(2);
}

export async function getConfig(chave, padrao = "") {
  const { data } = await supabase.from("configuracoes").select("valor").eq("chave", chave).maybeSingle();
  return data?.valor ?? padrao;
}

export async function setConfig(chave, valor) {
  return await supabase.from("configuracoes").upsert({ chave, valor, atualizado_em: new Date().toISOString() }, { onConflict: "chave" });
}

export async function getEvolutionConfig() {
  const [url, key, instance] = await Promise.all([
    getConfig("evolution_url", DEFAULT_EVOLUTION_URL),
    getConfig("evolution_key", DEFAULT_EVOLUTION_KEY),
    getConfig("evolution_instance", DEFAULT_EVOLUTION_INSTANCE)
  ]);
  return { url: url || DEFAULT_EVOLUTION_URL, key: key || DEFAULT_EVOLUTION_KEY, instance: instance || DEFAULT_EVOLUTION_INSTANCE };
}

export async function enviarWhatsapp(numero, texto) {
  const number = numeroBR(numero);
  if (!number || !texto) throw new Error("Informe número e mensagem.");
  const cfg = await getEvolutionConfig();
  const r = await fetch(`${cfg.url}/message/sendText/${cfg.instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: cfg.key },
    body: JSON.stringify({ number, text: texto, delay: 1200 })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.error) throw new Error(JSON.stringify(data));
  return data;
}

export async function enviarImagemWhatsapp(numero, texto, base64Image, mimetype = "image/jpeg") {
  const number = numeroBR(numero);
  if (!number || !base64Image) throw new Error("Informe número e imagem.");
  const cfg = await getEvolutionConfig();
  const r = await fetch(`${cfg.url}/message/sendMedia/${cfg.instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: cfg.key },
    body: JSON.stringify({ number, mediatype: "image", mimetype, caption: texto || "", media: base64Image, delay: 1200 })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.error) throw new Error(JSON.stringify(data));
  return data;
}
