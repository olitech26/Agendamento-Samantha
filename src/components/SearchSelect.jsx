import React, { useEffect, useMemo, useRef, useState } from "react";

export default function SearchSelect({
  label,
  items = [],
  value,
  onChange,
  getLabel = (x) => x?.nome || "",
  getValue = (x) => x?.id ?? getLabel(x),
  placeholder = "Digite para pesquisar...",
  showAllText = "Mostrar todos"
}) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const wrapRef = useRef(null);

  const selecionado = items.find((i) => String(getValue(i)) === String(value));
  const texto = aberto ? termo : (selecionado ? getLabel(selecionado) : termo);

  useEffect(() => {
    function fechar(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    document.addEventListener("touchstart", fechar, { passive: true });
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("touchstart", fechar);
    };
  }, []);

  const filtrados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (mostrarTodos && t.length < 2) return items.slice(0, 80);
    if (t.length < 2) return [];
    return items.filter((i) => getLabel(i).toLowerCase().includes(t)).slice(0, 80);
  }, [items, termo, getLabel, mostrarTodos]);

  function selecionar(item) {
    onChange(item);
    setTermo(getLabel(item));
    setAberto(false);
    setMostrarTodos(false);
  }

  function limpar() {
    onChange(null);
    setTermo("");
    setAberto(false);
    setMostrarTodos(false);
  }

  return (
    <label className="form-group combo-wrap" ref={wrapRef}>
      <span>{label}</span>
      <div className="combo-input-row">
        <input
          value={texto}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => { setAberto(true); setTermo(selecionado ? getLabel(selecionado) : ""); }}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); setMostrarTodos(false); }}
        />
        {(selecionado || termo) && <button type="button" className="combo-clear" onClick={limpar}>×</button>}
      </div>
      {aberto && (
        <div className="combo-list" role="listbox">
          <div className="combo-tools">
            <button type="button" onClick={() => setMostrarTodos(true)}>{showAllText}</button>
          </div>
          {termo.trim().length < 2 && !mostrarTodos && <div className="combo-empty">Digite pelo menos 2 caracteres</div>}
          {filtrados.map((item) => (
            <button type="button" key={String(getValue(item))} onMouseDown={(e)=>e.preventDefault()} onClick={() => selecionar(item)}>
              {getLabel(item)}
            </button>
          ))}
          {(termo.trim().length >= 2 || mostrarTodos) && filtrados.length === 0 && <div className="combo-empty">Nenhum resultado</div>}
        </div>
      )}
    </label>
  );
}
