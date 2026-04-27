import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, FileText, Plus, Trash2, RefreshCw, Save,
  Info, ChevronDown, Loader2, AlertCircle, Edit, Copy,
  Trash, MoreVertical, ArrowRight, CheckCircle, XCircle,
} from "lucide-react";
import api from "../../services/api";
import toast from 'react-hot-toast';

// ─── Enums ────────────────────────────────────────────────────
type Mode     = "create" | "edit" | "view";
type DocType  = "QUOTE" | "INVOICE" | "CREDIT_NOTE" | "DELIVERY_NOTE" | "SHIPPING_NOTE" | "PURCHASE_ORDER" | "SUPPLIER_INVOICE" | "RECEIPT_NOTE" | "RETURN_NOTE";
type DocStatus = "DRAFT" | "PENDING" | "VALIDATED" | "SENT" | "PARTIAL" | "COMPLETED" | "CANCELLED" | "EXPIRED";
type Interval = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

// ─── Interfaces ───────────────────────────────────────────────
interface Partner { id: string; name: string; email?: string; }
interface Article { id: string; code: string; name: string; sellingPrice: number; purchasePrice: number; unit?: string; }

interface LineItem {
  id:          string;
  articleId:   string;
  articleName: string;
  qty:         number;
  unitPrice:   number;
  discount:    number;
  tax:         number;
  unit:        string;
}

// FormState — aligné 1:1 sur model Prisma Invoice
interface FormState {
  type:              DocType;
  invoiceNumber:     string;
  partnerId:         string;
  status:            DocStatus;
  date:              string;
  dueDate:           string;
  deliveryDate:      string;
  validUntil:        string;
  notes:             string;
  internalNotes:     string;
  globalDiscount:    number;
  tax:               number;
  items:             LineItem[];
  isRecurring:       boolean;
  recurringInterval: Interval;
  recurringEndDate:  string;
  parentInvoiceId:   string;
}

// ─── Config documents ─────────────────────────────────────────
const DOC_CFG: Record<DocType, {
  label: string; icon: string; prefix: string;
  partnerType: "client" | "supplier";
  color: string; bgColor: string;
  canConvertTo: DocType[];
  showDue: boolean; showDelivery: boolean; showValidity: boolean; showRecurring: boolean;
}> = {
  QUOTE:            { label: "Devis",               icon: "📋", prefix: "DEV", partnerType: "client",   color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", canConvertTo: ["INVOICE", "DELIVERY_NOTE"],        showDue: false, showDelivery: false, showValidity: true,  showRecurring: false },
  INVOICE:          { label: "Facture client",      icon: "🧾", prefix: "FAC", partnerType: "client",   color: "text-blue-700",   bgColor: "bg-blue-50 border-blue-200",     canConvertTo: ["CREDIT_NOTE", "DELIVERY_NOTE"],    showDue: true,  showDelivery: false, showValidity: false, showRecurring: true  },
  CREDIT_NOTE:      { label: "Avoir",               icon: "↩️", prefix: "AVO", partnerType: "client",   color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", canConvertTo: [],                                  showDue: false, showDelivery: false, showValidity: false, showRecurring: false },
  DELIVERY_NOTE:    { label: "Bon de livraison",    icon: "🚚", prefix: "BL",  partnerType: "client",   color: "text-teal-700",   bgColor: "bg-teal-50 border-teal-200",     canConvertTo: ["SHIPPING_NOTE", "INVOICE"],        showDue: false, showDelivery: true,  showValidity: false, showRecurring: false },
  SHIPPING_NOTE:    { label: "Bordereau d'expéd.", icon: "📦", prefix: "BE",  partnerType: "client",   color: "text-cyan-700",   bgColor: "bg-cyan-50 border-cyan-200",     canConvertTo: [],                                  showDue: false, showDelivery: true,  showValidity: false, showRecurring: false },
  PURCHASE_ORDER:   { label: "Bon de commande",     icon: "🛒", prefix: "BC",  partnerType: "supplier", color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", canConvertTo: ["RECEIPT_NOTE", "SUPPLIER_INVOICE"],showDue: false, showDelivery: true,  showValidity: false, showRecurring: false },
  SUPPLIER_INVOICE: { label: "Facture fournisseur", icon: "🏭", prefix: "FAF", partnerType: "supplier", color: "text-rose-700",   bgColor: "bg-rose-50 border-rose-200",     canConvertTo: ["CREDIT_NOTE"],                     showDue: true,  showDelivery: false, showValidity: false, showRecurring: false },
  RECEIPT_NOTE:     { label: "Bon de réception",   icon: "✅", prefix: "BR",  partnerType: "supplier", color: "text-green-700",  bgColor: "bg-green-50 border-green-200",   canConvertTo: ["SUPPLIER_INVOICE"],                showDue: false, showDelivery: true,  showValidity: false, showRecurring: false },
  RETURN_NOTE:      { label: "Bon de retour",       icon: "🔄", prefix: "BRT", partnerType: "client",   color: "text-red-700",    bgColor: "bg-red-50 border-red-200",       canConvertTo: [],                                  showDue: false, showDelivery: false, showValidity: false, showRecurring: false },
};

const STATUS_CFG: Record<DocStatus, { label: string; cls: string }> = {
  DRAFT:     { label: "Brouillon",  cls: "bg-gray-100 text-gray-600 border-gray-200" },
  PENDING:   { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  VALIDATED: { label: "Validé",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  SENT:      { label: "Envoyé",     cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  PARTIAL:   { label: "Partiel",    cls: "bg-orange-50 text-orange-700 border-orange-200" },
  COMPLETED: { label: "Terminé",    cls: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Annulé",     cls: "bg-red-50 text-red-700 border-red-200" },
  EXPIRED:   { label: "Expiré",     cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const INTERVALS: Record<Interval, string> = {
  WEEKLY: "Hebdomadaire", MONTHLY: "Mensuelle", QUARTERLY: "Trimestrielle", YEARLY: "Annuelle",
};

// ─── Helpers ──────────────────────────────────────────────────
const today   = new Date().toISOString().split("T")[0];
const fmt     = (n: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(n);
const newItem = (): LineItem => ({ id: Math.random().toString(36).slice(2), articleId: "", articleName: "", qty: 1, unitPrice: 0, discount: 0, tax: 20, unit: "" });

const emptyForm = (type: DocType = "INVOICE"): FormState => ({
  type,
  invoiceNumber:     "",
  partnerId:         "",
  status:            "DRAFT",
  date:              today,
  dueDate:           "",
  deliveryDate:      "",
  validUntil:        "",
  notes:             "",
  internalNotes:     "",
  globalDiscount:    0,
  tax:               20,
  items:             [newItem()],
  isRecurring:       false,
  recurringInterval: "MONTHLY",
  recurringEndDate:  "",
  parentInvoiceId:   "",
});

// ─── Sub-components ───────────────────────────────────────────
const iCls  = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-800 placeholder-gray-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400";
const roCls = "w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-700 min-h-[42px]";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/60">
      <div className="w-1 h-5 rounded-full bg-blue-500 shrink-0" />
      <span className="text-lg font-semibold text-gray-700">{title}</span>
    </div>
  );
}

function Field({ label, required, hint, children, className = "" }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />{hint}</p>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface Props {
  mode?:        Mode;
  documentId?:  string;
  defaultType?: DocType;
  onBack?:      () => void;
  onSaved?:     (doc: any) => void;
}

// ─── Component ────────────────────────────────────────────────
export default function InvoiceForm({ mode: initMode = "create", documentId, defaultType = "INVOICE", onBack, onSaved }: Props) {
  // Lecture du type depuis ?type=INVOICE (URL)
  const typeFromUrl = (new URLSearchParams(window.location.search).get("type") ?? defaultType) as DocType;

  const [mode,       setMode]      = useState<Mode>(initMode);
  const [form,       setForm]      = useState<FormState>(emptyForm(typeFromUrl));
  const [snapshot,   setSnapshot]  = useState<FormState | null>(null);

  const [partners,   setPartners]  = useState<Partner[]>([]);
  const [articles,   setArticles]  = useState<Article[]>([]);
  const [loadingP,   setLoadingP]  = useState(false);
  const [loadingA,   setLoadingA]  = useState(false);
  const [loadingDoc, setLoadingDoc]= useState(false);
  const [saving,     setSaving]    = useState(false);
  const [errorP,     setErrorP]    = useState<string | null>(null);
  const [saveError,  setSaveError] = useState<string | null>(null);
  const [saveOk,     setSaveOk]    = useState(false);

  const [showStatusMenu,  setShowStatusMenu]  = useState(false);
  const [showActionMenu,  setShowActionMenu]  = useState(false);
  const [showConvertMenu, setShowConvertMenu] = useState(false);

  const cfg     = DOC_CFG[form.type];
  const isView  = mode === "view";
  const isCreate = mode === "create";
  const canEdit  = !["COMPLETED", "CANCELLED"].includes(form.status);

  // ── Chargement document existant
  useEffect(() => {
    if (!documentId || isCreate) return;
    setLoadingDoc(true);
    api.get(`/invoices/${documentId}`)
      .then(r => {
        const d = r.data;
        const loaded: FormState = {
          type:              d.type              ?? "INVOICE",
          invoiceNumber:     d.invoiceNumber     ?? "",
          partnerId:         d.clientId ?? d.supplierId ?? "",
          status:            d.status            ?? "DRAFT",
          date:              d.date?.split("T")[0]             ?? today,
          dueDate:           d.dueDate?.split("T")[0]          ?? "",
          deliveryDate:      d.deliveryDate?.split("T")[0]     ?? "",
          validUntil:        d.validUntil?.split("T")[0]       ?? "",
          notes:             d.notes             ?? "",
          internalNotes:     d.internalNotes     ?? "",
          globalDiscount:    Number(d.discount   ?? 0),
          tax:               Number(d.taxRate    ?? 20),
          isRecurring:       d.isRecurring       ?? false,
          recurringInterval: d.recurringInterval ?? "MONTHLY",
          recurringEndDate:  d.recurringEndDate?.split("T")[0] ?? "",
          parentInvoiceId:   d.parentInvoiceId   ?? "",
          items: (d.items ?? []).map((it: any) => ({
            id:          it.id,
            articleId:   it.articleId,
            articleName: it.article?.name ?? it.description ?? "",
            qty:         Number(it.quantity),
            unitPrice:   Number(it.unitPrice),
            discount:    Number(it.discount  ?? 0),
            tax:         Number(it.tax       ?? 20),
            unit:        it.article?.unit    ?? "",
          })),
        };
        setForm(loaded);
        setSnapshot(loaded);
      })
      .catch(() => setSaveError("Impossible de charger le document"))
      .finally(() => setLoadingDoc(false));
  }, [documentId]);

  const [loadingNum, setLoadingNum] = useState(false);

  // ── Génération numéro depuis la config DB (create uniquement)
  useEffect(() => {
    if (!isCreate) return;
    setLoadingNum(true);
    api.get(`/invoices/next-number?type=${typeFromUrl}`)
      .then(r => setForm(f => ({ ...f, invoiceNumber: r.data.number })))
      .catch(() => {}) // silencieux : l'utilisateur peut saisir manuellement
      .finally(() => setLoadingNum(false));
  }, [typeFromUrl]);
  useEffect(() => {
    setLoadingA(true);
    api.get("/articles")
      .then(r => setArticles(r.data?.data ?? r.data))
      .catch(() => {})
      .finally(() => setLoadingA(false));
  }, []);

  // ── Chargement partenaires selon type
  useEffect(() => {
    const route = cfg.partnerType === "client" ? "/partners/clients" : "/partners/fournisseurs";
    setLoadingP(true); setErrorP(null); setPartners([]);
    api.get(route)
      .then(r => setPartners(r.data?.data ?? r.data))
      .catch(() => setErrorP("Impossible de charger les partenaires"))
      .finally(() => setLoadingP(false));
  }, [form.type]);

  // ── State helpers
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const updateItem = useCallback(<K extends keyof LineItem>(id: string, k: K, v: LineItem[K]) =>
    setForm(f => ({ ...f, items: f.items.map(it => it.id === id ? { ...it, [k]: v } : it) })), []);

  const removeItem = (id: string) =>
    setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));

  const pickArticle = useCallback((itemId: string, artId: string) => {
    const art = articles.find(a => a.id === artId);
    if (!art) return;
    const price = cfg.partnerType === "supplier" ? art.purchasePrice : art.sellingPrice;
    setForm(f => ({ ...f, items: f.items.map(it => it.id === itemId
      ? { ...it, articleId: art.id, articleName: art.name, unitPrice: price, unit: art.unit ?? "" }
      : it
    )}));
  }, [articles, form.type]);

  // ── Calculs
  const lineTotal = (it: LineItem) => it.qty * it.unitPrice * (1 - it.discount / 100);
  const subtotal  = form.items.reduce((s, it) => s + lineTotal(it), 0);
  const discAmt   = subtotal * (form.globalDiscount / 100);
  const after     = subtotal - discAmt;
  const taxAmt    = after * (form.tax / 100);
  const total     = after + taxAmt;

  // ── Sauvegarde
  const handleSave = async (asDraft = false) => {
    setSaving(true); setSaveError(null); setSaveOk(false);
    try {
      const isClient = cfg.partnerType === "client";
      const payload = {
        type:              form.type,
        invoiceNumber:     form.invoiceNumber  || undefined,
        clientId:          isClient  ? form.partnerId : undefined,
        supplierId:        !isClient ? form.partnerId : undefined,
        status:            asDraft ? "DRAFT" : form.status,
        date:              form.date,
        dueDate:           form.dueDate        || undefined,
        deliveryDate:      form.deliveryDate   || undefined,
        validUntil:        form.validUntil     || undefined,
        notes:             form.notes          || undefined,
        internalNotes:     form.internalNotes  || undefined,
        discount:          form.globalDiscount,
        tax:               form.tax,
        parentInvoiceId:   form.parentInvoiceId || undefined,
        isRecurring:       form.isRecurring,
        recurringInterval: form.isRecurring ? form.recurringInterval : undefined,
        recurringEndDate:  form.isRecurring && form.recurringEndDate ? form.recurringEndDate : undefined,
        items: form.items.map(it => ({
          articleId: it.articleId,
          quantity:  it.qty,
          unitPrice: it.unitPrice,
          discount:  it.discount,
          tax:       it.tax,
        })),
      };
      const res = isCreate
        ? await api.post("/invoices", payload)
        : await api.put(`/invoices/${documentId}`, payload);
      setSaveOk(true);
      onSaved?.(res.data);
      toast.success("Document sauvegardé avec succès!")
      if (isCreate) setMode("view");
    } catch (e: any) {
      setSaveError(e.response?.data?.error ?? e.message ?? "Erreur lors de la sauvegarde");
      toast.error(e.response?.data?.error ?? e.message ?? "Erreur lors de la sauvegarde")
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce document ?")) return;
    try { await api.delete(`/invoices/${documentId}`); onBack?.(); }
    catch (e: any) { setSaveError(e.response?.data?.error ?? "Erreur"); }
  };

  const handleConvert = async (targetType: DocType) => {
    setShowConvertMenu(false);
    try {
      const res = await api.post(`/invoices/${documentId}/convert`, { targetType });
      onSaved?.(res.data);
    } catch (e: any) { setSaveError(e.response?.data?.error ?? "Erreur de conversion"); }
  };

  const handleDuplicate = async () => {
    setShowActionMenu(false);
    try {
      const res = await api.post(`/invoices/${documentId}/duplicate`, {});
      onSaved?.(res.data);
    } catch (e: any) { setSaveError(e.response?.data?.error ?? "Erreur de duplication"); }
  };

  const cancelEdit = () => {
    if (snapshot) setForm(snapshot);
    setMode("view");
  };

  // ─────────────────────────────────────────────────────────────
  if (loadingDoc) return (
    <div className="flex items-center justify-center p-20 text-gray-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin" /> Chargement...
    </div>
  );

  return (
    <div className="h-screen">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">

        {/* ── HEADER ── */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 hover:bg-white/70 rounded-lg transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-gray-800">
                  {isCreate ? `Nouveau — ${cfg.label}` : isView ? (form.invoiceNumber || cfg.label) : `Modifier — ${form.invoiceNumber}`}
                </h2>
                {/* Badge type document */}
                {/* <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bgColor} ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
                {!isCreate && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CFG[form.status].cls}`}>
                    {STATUS_CFG[form.status].label}
                  </span>
                )} */}
              </div>
              {/* <p className="text-xs text-gray-500 hidden sm:block">
                {cfg.partnerType === "client" ? "Vente client" : "Achat fournisseur"}
              </p> */}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Statut pills — tous visibles (create/edit) */}
              {!isView && (
                <div className="hidden sm:flex items-center gap-1 flex-wrap">
                  {(Object.keys(STATUS_CFG) as DocStatus[]).map(s => (
                    <button key={s} onClick={() => set("status", s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${form.status === s ? STATUS_CFG[s].cls + " shadow-sm" : "bg-transparent border-transparent text-gray-400 hover:bg-white/60"}`}>
                      {STATUS_CFG[s].label}
                    </button>
                  ))}
                </div>
              )}
              {/* Statut mobile dropdown (create/edit) */}
              {!isView && (
                <div className="relative sm:hidden">
                  <button onClick={() => setShowStatusMenu(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_CFG[form.status].cls}`}>
                    {STATUS_CFG[form.status].label}<ChevronDown className="w-3 h-3" />
                  </button>
                  {showStatusMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20">
                        {(Object.keys(STATUS_CFG) as DocStatus[]).map(s => (
                          <button key={s} onClick={() => { set("status", s); setShowStatusMenu(false); }}
                            className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-gray-50">
                            <span className={`w-2 h-2 rounded-full border ${STATUS_CFG[s].cls}`} />
                            {STATUS_CFG[s].label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Bouton Modifier (view) */}
              {isView && canEdit && (
                <button onClick={() => { setSnapshot(form); setMode("edit"); }}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
              )}

              {/* Transformer (view) */}
              {isView && cfg.canConvertTo.length > 0 && (
                <div className="relative hidden sm:block">
                  <button onClick={() => setShowConvertMenu(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-all">
                    <ArrowRight className="w-4 h-4" /> Transformer
                  </button>
                  {showConvertMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowConvertMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Transformer en</p>
                        {cfg.canConvertTo.map(t => (
                          <button key={t} onClick={() => handleConvert(t)}
                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50">
                            <span>{DOC_CFG[t].icon}</span>{DOC_CFG[t].label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Menu ··· (view) */}
              {isView && (
                <div className="relative">
                  <button onClick={() => setShowActionMenu(v => !v)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showActionMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20">
                        {canEdit && (
                          <button onClick={() => { setSnapshot(form); setMode("edit"); setShowActionMenu(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-3 sm:hidden">
                            <Edit className="w-4 h-4 text-blue-600" /> Modifier
                          </button>
                        )}
                        <button onClick={handleDuplicate}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-3">
                          <Copy className="w-4 h-4 text-purple-600" /> Dupliquer
                        </button>
                        {cfg.canConvertTo.length > 0 && (
                          <div className="sm:hidden">
                            <div className="border-t border-gray-100 my-1" />
                            {cfg.canConvertTo.map(t => (
                              <button key={t} onClick={() => { handleConvert(t); setShowActionMenu(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-teal-50 flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-teal-600" /> → {DOC_CFG[t].label}
                              </button>
                            ))}
                          </div>
                        )}
                        {canEdit && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { handleDelete(); setShowActionMenu(false); }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600">
                              <Trash className="w-4 h-4" /> Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lien document parent */}
          {form.parentInvoiceId && (
            <div className="mt-2 ml-12 flex items-center gap-2">
              <span className="text-xs text-gray-400">Créé depuis :</span>
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <FileText className="w-3 h-3" />{form.parentInvoiceId}
              </span>
            </div>
          )}
        </div>



        {/* ── SECTION 1 : Informations générales ── */}
        <SectionHeader title="Informations générales" />
        <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          <Field label="Numéro" hint={isCreate ? "Généré automatiquement — modifiable" : undefined}>
            {isView
              ? <div className={roCls}>{form.invoiceNumber || "—"}</div>
              : <div className="relative">
                  <input
                    value={form.invoiceNumber}
                    onChange={e => set("invoiceNumber", e.target.value)}
                    placeholder={loadingNum ? "Génération..." : `${cfg.prefix}-2026-0001`}
                    disabled={loadingNum}
                    className={iCls}
                  />
                  {loadingNum && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
            }
          </Field>

          <Field label={cfg.partnerType === "client" ? "Client" : "Fournisseur"} required>
            {isView
              ? <div className={roCls}>{(partners.find(p => p.id === form.partnerId)?.name ?? form.partnerId) || "—"}</div>
              : loadingP
                ? <div className={`${iCls} flex items-center gap-2 text-gray-400`}><Loader2 className="w-3.5 h-3.5 animate-spin" />Chargement...</div>
                : errorP
                  ? <div className={`${iCls} flex items-center gap-2 text-red-400 border-red-200`}><AlertCircle className="w-3.5 h-3.5" />{errorP}</div>
                  : <div className="relative">
                      <select value={form.partnerId} onChange={e => set("partnerId", e.target.value)} className={`${iCls} appearance-none pr-8`}>
                        <option value="">Sélectionner...</option>
                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}{p.email ? ` — ${p.email}` : ""}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
            }
          </Field>

          <Field label="Date" required>
            {isView
              ? <div className={roCls}>{form.date ? new Date(form.date).toLocaleDateString("fr-FR") : "—"}</div>
              : <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={iCls} />
            }
          </Field>

          {cfg.showDue && (
            <Field label="Date d'échéance">
              {isView
                ? <div className={roCls}>{form.dueDate ? new Date(form.dueDate).toLocaleDateString("fr-FR") : "—"}</div>
                : <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} className={iCls} />
              }
            </Field>
          )}
          {cfg.showDelivery && (
            <Field label="Date de livraison">
              {isView
                ? <div className={roCls}>{form.deliveryDate ? new Date(form.deliveryDate).toLocaleDateString("fr-FR") : "—"}</div>
                : <input type="date" value={form.deliveryDate} onChange={e => set("deliveryDate", e.target.value)} className={iCls} />
              }
            </Field>
          )}
          {cfg.showValidity && (
            <Field label="Valable jusqu'au" hint="Date d'expiration du devis">
              {isView
                ? <div className={roCls}>{form.validUntil ? new Date(form.validUntil).toLocaleDateString("fr-FR") : "—"}</div>
                : <input type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)} className={iCls} />
              }
            </Field>
          )}
        </div>

        {/* ── SECTION 2 : Lignes ── */}
        <SectionHeader title="Lignes du document" />
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {/* Desktop */}
          <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid bg-gray-50 border-b border-gray-200 px-4 py-2.5"
              style={{ gridTemplateColumns: isView ? "2fr 2fr 60px 110px 70px 70px 110px" : "2fr 2fr 60px 110px 70px 70px 110px 32px" }}>
              {["Article", "Désignation", "Qté", "Prix unit.", "Rem %", "TVA %", "Total", !isView ? "" : null]
                .filter(h => h !== null).map((h, i) => (
                  <span key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {form.items.map((it, idx) => (
              <div key={it.id}
                className={`grid px-4 py-3 items-center gap-2 ${idx < form.items.length - 1 ? "border-b border-gray-100" : ""} ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"}`}
                style={{ gridTemplateColumns: isView ? "2fr 2fr 60px 110px 70px 70px 110px" : "2fr 2fr 60px 110px 70px 70px 110px 32px" }}>
                {isView
                  ? <span className="text-xs text-gray-500 truncate">{it.articleId}</span>
                  : <div className="relative">
                      <select value={it.articleId} onChange={e => pickArticle(it.id, e.target.value)} disabled={loadingA}
                        className={`${iCls} text-xs appearance-none pr-6`}>
                        <option value="">Choisir...</option>
                        {articles.map(a => <option key={a.id} value={a.id}>{a.code} – {a.name}</option>)}
                      </select>
                    </div>
                }
                {isView
                  ? <span className="text-sm text-gray-800 truncate">{it.articleName}</span>
                  : <input value={it.articleName} placeholder="Désignation" onChange={e => updateItem(it.id, "articleName", e.target.value)} className={`${iCls} text-xs`} />
                }
                {isView
                  ? <span className="text-sm text-center">{it.qty}</span>
                  : <input type="number" min={1} value={it.qty} onChange={e => updateItem(it.id, "qty", +e.target.value)} className={`${iCls} text-xs text-center px-1`} />
                }
                {isView
                  ? <span className="text-sm text-right">{fmt(it.unitPrice)}</span>
                  : <input type="number" min={0} value={it.unitPrice} onChange={e => updateItem(it.id, "unitPrice", +e.target.value)} className={`${iCls} text-xs text-right`} />
                }
                {isView
                  ? <span className="text-sm text-center">{it.discount}%</span>
                  : <div className="flex items-center gap-1">
                      <input type="number" min={0} max={100} value={it.discount} onChange={e => updateItem(it.id, "discount", +e.target.value)} className={`${iCls} text-xs text-right`} style={{ width: "65%" }} />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                }
                {isView
                  ? <span className="text-sm text-center">{it.tax}%</span>
                  : <div className="flex items-center gap-1">
                      <input type="number" min={0} max={100} value={it.tax} onChange={e => updateItem(it.id, "tax", +e.target.value)} className={`${iCls} text-xs text-right`} style={{ width: "65%" }} />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                }
                <span className="text-sm font-semibold text-gray-800">{fmt(lineTotal(it))} €</span>
                {!isView && (
                  <button onClick={() => removeItem(it.id)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {!isView && (
              <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100">
                <button onClick={() => setForm(f => ({ ...f, items: [...f.items, newItem()] }))}
                  className="flex items-center gap-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg px-4 py-2 hover:bg-blue-50/50 transition-all">
                  <Plus className="w-4 h-4" /> Ajouter une ligne
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {form.items.map((it, idx) => (
              <div key={it.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Ligne {idx + 1}</span>
                  {!isView && (
                    <button onClick={() => removeItem(it.id)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isView
                  ? <p className="text-sm font-medium text-gray-800">{it.articleName}</p>
                  : <Field label="Article">
                      <select value={it.articleId} onChange={e => pickArticle(it.id, e.target.value)} className={`${iCls} text-xs appearance-none`}>
                        <option value="">Choisir un article...</option>
                        {articles.map(a => <option key={a.id} value={a.id}>{a.code} – {a.name}</option>)}
                      </select>
                    </Field>
                }
                <div className="grid grid-cols-3 gap-2">
                  {([["Qté", "qty"], ["Prix unit.", "unitPrice"], ["Remise", "discount"]] as [string, keyof LineItem][]).map(([l, k]) => (
                    <Field key={k} label={l}>
                      {isView
                        ? <div className={roCls}>{it[k]}{k === "discount" ? "%" : ""}</div>
                        : <input type="number" min={0} value={it[k] as number} onChange={e => updateItem(it.id, k, +e.target.value)} className={`${iCls} text-xs text-right`} />
                      }
                    </Field>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">TVA {it.tax}%</span>
                  <span className="font-bold text-blue-600">{fmt(lineTotal(it))} €</span>
                </div>
              </div>
            ))}
            {!isView && (
              <button onClick={() => setForm(f => ({ ...f, items: [...f.items, newItem()] }))}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-xl px-4 py-3 hover:bg-blue-50/50 transition-all">
                <Plus className="w-4 h-4" /> Ajouter une ligne
              </button>
            )}
          </div>
        </div>

        {/* ── SECTION 3 : Options + Récap ── */}
        <SectionHeader title="Récapitulatif et options" />
        <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gauche */}
          <div className="space-y-4">
            <Field label="Notes" hint={!isView ? "Visible sur le document imprimé" : undefined}>
              {isView
                ? <div className={`${roCls} whitespace-pre-wrap`}>{form.notes || "—"}</div>
                : <textarea value={form.notes} rows={3} placeholder="Conditions de paiement, remarques..."
                    onChange={e => set("notes", e.target.value)} className={`${iCls} resize-none`} />
              }
            </Field>
            <Field label="Notes internes" hint={!isView ? "Non visibles sur le document" : undefined}>
              {isView
                ? <div className={roCls}>{form.internalNotes || "—"}</div>
                : <textarea value={form.internalNotes} rows={2} placeholder="Mémos internes..."
                    onChange={e => set("internalNotes", e.target.value)} className={`${iCls} resize-none`} />
              }
            </Field>

            {/* Récurrence */}
            {cfg.showRecurring && (
              <div className={`rounded-xl border p-4 transition-all ${form.isRecurring ? "border-blue-200 bg-blue-50/40" : "border-gray-200 bg-gray-50/40"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className={`w-4 h-4 ${form.isRecurring ? "text-blue-600" : "text-gray-400"}`} />
                    <div>
                      <p className={`text-sm font-medium ${form.isRecurring ? "text-blue-800" : "text-gray-600"}`}>Facture récurrente</p>
                      <p className="text-xs text-gray-400">Génération automatique à intervalle fixe</p>
                    </div>
                  </div>
                  {!isView
                    ? <div onClick={() => set("isRecurring", !form.isRecurring)}
                        className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors ${form.isRecurring ? "bg-blue-600" : "bg-gray-300"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.isRecurring ? "left-6" : "left-1"}`} />
                      </div>
                    : form.isRecurring && (
                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                          {INTERVALS[form.recurringInterval]}
                        </span>
                      )
                  }
                </div>
                {form.isRecurring && !isView && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-blue-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Fréquence *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(INTERVALS) as Interval[]).map(iv => (
                          <button key={iv} onClick={() => set("recurringInterval", iv)}
                            className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${form.recurringInterval === iv ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600"}`}>
                            {INTERVALS[iv]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Field label="Date de fin" hint="Laisser vide pour une récurrence indéfinie">
                      <input type="date" value={form.recurringEndDate}
                        onChange={e => set("recurringEndDate", e.target.value)} className={iCls} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Droite — Récap */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total HT</span>
              <span className="font-medium text-gray-700">{fmt(subtotal)} €</span>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
              <span className="text-gray-500">Remise globale</span>
              <div className="flex items-center gap-2">
                {isView
                  ? <span className="font-medium text-gray-700">{form.globalDiscount}%</span>
                  : <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <input type="number" min={0} max={100} value={form.globalDiscount}
                        onChange={e => set("globalDiscount", +e.target.value)}
                        className="w-12 px-2 py-1.5 text-sm text-right outline-none" />
                      <span className="px-2 py-1.5 bg-gray-50 border-l border-gray-200 text-xs text-gray-400">%</span>
                    </div>
                }
                <span className="text-red-500 text-sm font-medium">−{fmt(discAmt)} €</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">TVA</span>
              <span className="font-medium text-gray-700">+{fmt(taxAmt)} €</span>
            </div>
            <div className="border-t border-gray-200 pt-3 sm:pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total TTC</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">{fmt(total)} €</span>
            </div>

            {saveError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{saveError}
              </div>
            )}
            {saveOk && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Document enregistré avec succès
              </div>
            )}

            {!isView && (
              <div className="space-y-2.5 pt-1">
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-md transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isCreate ? `Créer le ${cfg.label}` : "Enregistrer les modifications"}
                </button>
                <button onClick={() => handleSave(true)} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-all">
                  <Save className="w-4 h-4" /> Enregistrer en brouillon
                </button>
                {mode === "edit" && (
                  <button onClick={cancelEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                    <XCircle className="w-4 h-4" /> Annuler les modifications
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}