import React from "react";
import PesquisaCrudModulo from "./PesquisaCrudModulo";

export default function Produtos() {
  return (
    <PesquisaCrudModulo
      tabela="produtos"
      titulo="Produto"
      buscaCampos={['nome', 'categoria']}
      campos={[
        { nome: "nome", label: "Nome" }, { nome: "categoria", label: "Categoria" }, { nome: "estoque", label: "Estoque", tipo: "number" }, { nome: "custo", label: "Custo", tipo: "number" }, { nome: "valor", label: "Valor", tipo: "number" }, { nome: "comissao_percentual", label: "Comissão produto %", tipo: "number" }, { nome: "ativo", label: "Ativo", tipo: "select", opcoes: ["Sim","Não"] }
      ]}
    />
  );
}
