import React from "react";
import PesquisaCrudModulo from "./PesquisaCrudModulo";

export default function Atendentes() {
  return (
    <PesquisaCrudModulo
      tabela="atendentes"
      titulo="Atendente"
      buscaCampos={['nome', 'telefone', 'whatsapp', 'email', 'especialidade']}
      campos={[
        { nome: "nome", label: "Nome" }, { nome: "telefone", label: "Telefone" }, { nome: "whatsapp", label: "WhatsApp" }, { nome: "email", label: "E-mail" }, { nome: "especialidade", label: "Especialidade" }, { nome: "comissao_percentual", label: "Comissão geral %", tipo: "number" }, { nome: "comissao_servico_percentual", label: "Comissão serviços %", tipo: "number" }, { nome: "comissao_produto_percentual", label: "Comissão produtos %", tipo: "number" }, { nome: "ativo", label: "Ativo", tipo: "select", opcoes: ["Sim","Não"] }
      ]}
    />
  );
}
