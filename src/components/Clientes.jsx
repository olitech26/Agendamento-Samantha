import React from "react";
import PesquisaCrudModulo from "./PesquisaCrudModulo";

export default function Clientes() {
  return (
    <PesquisaCrudModulo
      tabela="clientes"
      titulo="Cliente"
      buscaCampos={['nome', 'telefone', 'whatsapp', 'email', 'observacoes']}
      campos={[
        { nome: "nome", label: "Nome" }, { nome: "telefone", label: "Telefone" }, { nome: "whatsapp", label: "WhatsApp" }, { nome: "email", label: "E-mail" }, { nome: "observacoes", label: "Observações" }, { nome: "ativo", label: "Ativo", tipo: "select", opcoes: ["Sim","Não"] }
      ]}
    />
  );
}
