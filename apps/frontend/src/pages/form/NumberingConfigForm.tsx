import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import api from "../../services/api";

const DOC_TYPES = [
  { value: "INVOICE",          label: "Facture client",      icon: "🧾", prefix: "FAC" },
  { value: "QUOTE",            label: "Devis",               icon: "📋", prefix: "DEV" },
  { value: "CREDIT_NOTE",      label: "Avoir",               icon: "↩️", prefix: "AVO" },
  { value: "DELIVERY_NOTE",    label: "Bon de livraison",    icon: "🚚", prefix: "BL"  },
  { value: "SHIPPING_NOTE",    label: "Bordereau d'expéd.", icon: "📦", prefix: "BE"  },
  { value: "PURCHASE_ORDER",   label: "Bon de commande",     icon: "🛒", prefix: "BC"  },
  { value: "SUPPLIER_INVOICE", label: "Facture fournisseur", icon: "🏭", prefix: "FAF" },
  { value: "RECEIPT_NOTE",     label: "Bon de réception",   icon: "✅", prefix: "BR"  },
  { value: "RETURN_NOTE",      label: "Bon de retour",       icon: "🔄", prefix: "BRT" },
];

const SEPARATORS = [
  { value: "-", label: "Tiret  —  FAC-2026-0001" },
  { value: "/", label: "Slash  —  FAC/2026/0001" },
  { value: "_", label: "Underscore  —  FAC_2026_0001" },
  { value: "",  label: "Aucun  —  FAC20260001" },
];

const YEAR_FORMATS = [
  { value: "YYYY", label: "4 chiffres  —  2026" },
  { value: "YY",   label: "2 chiffres  —  26" },
];

const RESET_PERIODS = [
  { value: "YEARLY",  label: "Annuelle  —  repart à 1 chaque année" },
  { value: "MONTHLY", label: "Mensuelle  —  repart à 1 chaque mois" },
  { value: "NEVER",   label: "Jamais  —  séquence continue" },
];

const PADDINGS = [3, 4, 5, 6];

// Génère l'aperçu du numéro
function buildPreview(cfg: Config): string {
  const now   = new Date();
  const sep   = cfg.separator;
  const year  = cfg.includeYear
    ? cfg.yearFormat === "YY" ? String(now.getFullYear()).slice(-2) : String(now.getFullYear())
    : null;
  const month = cfg.includeMonth ? String(now.getMonth() + 1).padStart(2, "0") : null;
  const seq   = String((cfg.currentSeq ?? 0) + 1).padStart(cfg.padding, "0");
  const parts = [cfg.prefix || "???"];
  if (year && !month) parts.push(year);
  if (year && month)  parts.push(`${year}${month}`);
  parts.push(seq);
  return parts.join(sep);
}

interface Config {
  docType:      string;
  prefix:       string;
  separator:    string;
  includeYear:  boolean;
  yearFormat:   string;
  includeMonth: boolean;
  padding:      number;
  resetPeriod:  string;
  currentSeq:   number;
}

const defaultConfig = (docType: string): Config => ({
  docType,
  prefix:       DOC_TYPES.find(d => d.value === docType)?.prefix ?? "DOC",
  separator:    "-",
  includeYear:  true,
  yearFormat:   "YYYY",
  includeMonth: false,
  padding:      4,
  resetPeriod:  "YEARLY",
  currentSeq:   0,
});

const iCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-800 transition-colors";

export default function NumberingConfigForm() {
  const [configs,  setConfigs]  = useState<Record<string, Config>>({});
  const [selected, setSelected] = useState<string>("INVOICE");
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const current = configs[selected] ?? defaultConfig(selected);
  const preview = buildPreview(current);

  // Simule le chargement des configs existantes
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // En prod : api.get("/invoices/numbering").then(r => ...)
      const initial: Record<string, Config> = {};
      DOC_TYPES.forEach(d => { initial[d.value] = defaultConfig(d.value); });
      setConfigs(initial);
      setLoading(false);
    }, 600);
  }, []);

  const update = (key: keyof Config, val: unknown) => {
    setConfigs(prev => ({
      ...prev,
      [selected]: { ...current, [key]: val },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    try {
      // En prod : await api.put(`/invoices/numbering/${selected}`, current);
        //   await new Promise(r => setTimeout(r, 800));

        api.get("/invoices/numbering")
        .then(r => {
            const map: Record<string, Config> = {};
            DOC_TYPES.forEach(d => { map[d.value] = defaultConfig(d.value); });
            (r.data as Config[]).forEach(c => { map[c.docType] = c; });
            setConfigs(map);
        })

        // Sauvegarde
        await api.put(`/invoices/numbering/${selected}`, current);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    update("currentSeq", 0);
  };

  return (
    <div style={{}}>
      <div style={{}}>

        {/* Header */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", background: "linear-gradient(to right, #EFF6FF, #EEF2FF)", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: 8, background: "linear-gradient(135deg, #3B82F6, #4F46E5)", borderRadius: 10, boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
              <Settings size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Numérotation des documents</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Configurez le format des numéros pour chaque type de document</p>
            </div>
          </div>

          {/* Sélection du type */}
          <div style={{ padding: "16px 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Type de document</p>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 14 }}>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Chargement...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {DOC_TYPES.map(d => (
                  <button key={d.value} onClick={() => { setSelected(d.value); setSaved(false); }}
                    style={{
                      padding: "10px 8px", borderRadius: 10, border: selected === d.value ? "1.5px solid #3B82F6" : "1px solid #E2E8F0",
                      background: selected === d.value ? "#EFF6FF" : "#fff",
                      color: selected === d.value ? "#1D4ED8" : "#64748B",
                      cursor: "pointer", fontSize: 12, fontWeight: selected === d.value ? 600 : 400,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s",
                    }}>
                    <span style={{ fontSize: 18 }}>{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire config */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>

            {/* Gauche — champs */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFF" }}>
                <div style={{ width: 4, height: 20, borderRadius: 4, background: "#3B82F6" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  {DOC_TYPES.find(d => d.value === selected)?.icon} {DOC_TYPES.find(d => d.value === selected)?.label}
                </span>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Préfixe + Séparateur */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Préfixe <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input value={current.prefix} onChange={e => update("prefix", e.target.value.toUpperCase())}
                      placeholder="Ex: FAC" maxLength={8} className={iCls}
                      style={{ width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "monospace", fontWeight: 600 }} />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8" }}>Lettres uniquement, max 8</p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Séparateur</label>
                    <div style={{ position: "relative" }}>
                      <select value={current.separator} onChange={e => update("separator", e.target.value)}
                        style={{ width: "100%", padding: "8px 32px 8px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", appearance: "none", background: "#fff", cursor: "pointer" }}>
                        {SEPARATORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>

                {/* Année */}
                <div style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFF" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: current.includeYear ? 12 : 0 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#374151" }}>Inclure l'année</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Ex: FAC-2026-0001</p>
                    </div>
                    <div onClick={() => { update("includeYear", !current.includeYear); if (current.includeYear) update("includeMonth", false); }}
                      style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", background: current.includeYear ? "#3B82F6" : "#CBD5E1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: current.includeYear ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                    </div>
                  </div>
                  {current.includeYear && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748B", marginBottom: 4 }}>Format année</label>
                        <div style={{ position: "relative" }}>
                          <select value={current.yearFormat} onChange={e => update("yearFormat", e.target.value)}
                            style={{ width: "100%", padding: "7px 28px 7px 10px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", appearance: "none", background: "#fff", cursor: "pointer" }}>
                            {YEAR_FORMATS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                          </select>
                          <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748B", marginBottom: 4 }}>Inclure le mois</label>
                        <div onClick={() => update("includeMonth", !current.includeMonth)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", borderRadius: 8, border: "1px solid #E2E8F0", background: current.includeMonth ? "#EFF6FF" : "#fff" }}>
                          <div style={{ width: 36, height: 20, borderRadius: 10, background: current.includeMonth ? "#3B82F6" : "#CBD5E1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                            <div style={{ position: "absolute", top: 2, left: current.includeMonth ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                          </div>
                          <span style={{ fontSize: 12, color: current.includeMonth ? "#1D4ED8" : "#64748B" }}>
                            {current.includeMonth ? "Oui — 202604" : "Non"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Padding + Reset */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Longueur séquence</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {PADDINGS.map(p => (
                        <button key={p} onClick={() => update("padding", p)}
                          style={{
                            flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            border: current.padding === p ? "1.5px solid #3B82F6" : "1px solid #E2E8F0",
                            background: current.padding === p ? "#EFF6FF" : "#fff",
                            color: current.padding === p ? "#1D4ED8" : "#64748B",
                            fontFamily: "monospace",
                          }}>
                          {"0".repeat(p - 1)}1
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Remise à zéro</label>
                    <div style={{ position: "relative" }}>
                      <select value={current.resetPeriod} onChange={e => update("resetPeriod", e.target.value)}
                        style={{ width: "100%", padding: "8px 28px 8px 10px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", appearance: "none", background: "#fff", cursor: "pointer" }}>
                        {RESET_PERIODS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>

                {/* Séquence actuelle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "#F8FAFF", border: "1px solid #E2E8F0" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#374151" }}>Séquence actuelle</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Prochain numéro = {current.currentSeq + 1}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="number" min={0} value={current.currentSeq}
                      onChange={e => update("currentSeq", +e.target.value)}
                      style={{ width: 80, padding: "6px 10px", fontSize: 14, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", textAlign: "center", fontFamily: "monospace", fontWeight: 600 }} />
                    <button onClick={handleReset} title="Remettre à 0"
                      style={{ padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                      <RefreshCw size={13} /> Reset
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Droite — aperçu + save */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Aperçu */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFF" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aperçu du prochain numéro</span>
                </div>
                <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", color: "#1D4ED8", letterSpacing: "0.05em", padding: "16px 0", background: "#EFF6FF", borderRadius: 10, border: "1px dashed #BFDBFE" }}>
                    {preview}
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94A3B8" }}>
                    Numéro généré automatiquement à la création
                  </p>
                </div>

                {/* Récap config */}
                <div style={{ borderTop: "1px solid #F1F5F9", padding: "12px 16px" }}>
                  {[
                    ["Préfixe",    current.prefix || "—"],
                    ["Séparateur", current.separator === "" ? "(aucun)" : `"${current.separator}"`],
                    ["Année",      current.includeYear ? (current.includeMonth ? `${current.yearFormat} + mois` : current.yearFormat) : "Non"],
                    ["Séquence",   `${current.padding} chiffres`],
                    ["Reset",      RESET_PERIODS.find(r => r.value === current.resetPeriod)?.value === "NEVER" ? "Jamais" : RESET_PERIODS.find(r => r.value === current.resetPeriod)?.value === "YEARLY" ? "Chaque année" : "Chaque mois"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                      <span style={{ color: "#94A3B8" }}>{k}</span>
                      <span style={{ fontWeight: 500, color: "#374151", fontFamily: "monospace" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback + Save */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626" }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}
              {saved && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 13, color: "#16A34A" }}>
                  <CheckCircle size={14} /> Configuration enregistrée
                </div>
              )}

              <button onClick={handleSave} disabled={saving}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
                  background: saving ? "#93C5FD" : "linear-gradient(135deg, #3B82F6, #4F46E5)",
                  color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                {saving ? "Enregistrement..." : "Enregistrer la configuration"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus, input:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      `}</style>
    </div>
  );
}