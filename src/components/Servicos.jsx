import React from "react";
import PesquisaCrudModulo from "./PesquisaCrudModulo";

export default function Servicos() {
  return (
    <PesquisaCrudModulo
      tabela="servicos"
      titulo="Serviço"
      buscaCampos={['nome', 'descricao']}
      campos={[
        { nome: "nome", label: "Nome" }, { nome: "descricao", label: "Descrição" }, { nome: "duracao", label: "Duração", tipo: "number" }, { nome: "custo", label: "Custo", tipo: "number" }, { nome: "valor", label: "Valor", tipo: "number" }, { nome: "comissao_percentual", label: "Comissão serviço %", tipo: "number" }, { nome: "ativo", label: "Ativo", tipo: "select", opcoes: ["Sim","Não"] }
      ]}
    />
  );
}
