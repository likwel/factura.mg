// utils/printInvoice.ts

export type PrintFormat = "A4" | "A5" | "TICKET";

interface PrintItem {
  articleName: string;
  qty:         number;
  unitPrice:   number;
  discount:    number;
  tax:         number;
}

export interface PrintData {
  invoiceNumber:  string;
  type:           string;
  date:           string;
  dueDate?:       string;
  partnerName:    string;
  partnerEmail?:  string;
  notes?:         string;
  items:          PrintItem[];
  subtotal:       number;
  discAmt:        number;
  taxAmt:         number;
  total:          number;
  globalDiscount: number;
  tax:            number;
  companyName?:   string;
  companyAddress?: string;
  companyPhone?:  string;
  companyEmail?:  string;
  companyLogo?:   string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(n) + " Ar";

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("fr-FR") : "—";

// ─── Template A4 ──────────────────────────────────────────────
function templateA4(d: PrintData): string {
  const rows = d.items.map(it => {
    const lineTotal = it.qty * it.unitPrice * (1 - it.discount / 100);
    return `
      <tr>
        <td>${it.articleName}</td>
        <td class="center">${it.qty}</td>
        <td class="right">${fmt(it.unitPrice)}</td>
        <td class="center">${it.discount > 0 ? it.discount + "%" : "—"}</td>
        <td class="center">${it.tax}%</td>
        <td class="right bold">${fmt(lineTotal)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8"/>
  <title>${d.invoiceNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size:11px; color:#1a1a1a; background:#fff; }
    @page { size:A4; margin:15mm 15mm 20mm; }

    .page       { width:100%; }
    .header     { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #2563eb; }
    .logo       { font-size:22px; font-weight:800; color:#2563eb; }
    .company-info { font-size:9.5px; color:#555; line-height:1.6; }
    .doc-meta   { text-align:right; }
    .doc-title  { font-size:20px; font-weight:700; color:#2563eb; text-transform:uppercase; letter-spacing:1px; }
    .doc-number { font-size:13px; font-weight:600; color:#1a1a1a; margin-top:4px; }
    .doc-date   { font-size:9.5px; color:#666; margin-top:2px; }

    .billing    { display:flex; gap:40px; margin-bottom:24px; }
    .bill-box   { flex:1; background:#f8faff; border:1px solid #dbeafe; border-radius:6px; padding:12px 14px; }
    .bill-label { font-size:8.5px; font-weight:700; color:#2563eb; text-transform:uppercase; letter-spacing:.8px; margin-bottom:6px; }
    .bill-name  { font-size:12px; font-weight:600; margin-bottom:2px; }
    .bill-info  { font-size:9.5px; color:#555; line-height:1.5; }

    table       { width:100%; border-collapse:collapse; margin-bottom:24px; }
    thead th    { background:#2563eb; color:#fff; padding:8px 10px; font-size:9px; text-transform:uppercase; letter-spacing:.6px; font-weight:600; }
    tbody tr    { border-bottom:1px solid #f0f0f0; }
    tbody tr:nth-child(even) { background:#f9fafb; }
    tbody td    { padding:8px 10px; font-size:10px; vertical-align:middle; }
    .center     { text-align:center; }
    .right      { text-align:right; }
    .bold       { font-weight:600; }

    .totals     { display:flex; justify-content:flex-end; margin-bottom:28px; }
    .totals-box { width:260px; }
    .total-row  { display:flex; justify-content:space-between; padding:5px 0; font-size:10px; color:#444; border-bottom:1px solid #f0f0f0; }
    .total-row.main { border-top:2px solid #2563eb; margin-top:4px; padding-top:10px; font-size:14px; font-weight:700; color:#2563eb; border-bottom:none; }

    .notes      { background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:12px 14px; margin-bottom:24px; }
    .notes-lbl  { font-size:8.5px; font-weight:700; color:#92400e; text-transform:uppercase; letter-spacing:.6px; margin-bottom:4px; }
    .notes-txt  { font-size:10px; color:#78350f; line-height:1.6; }

    .footer     { text-align:center; font-size:9px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:12px; margin-top:auto; }
  </style>
  </head><body><div class="page">

  <div class="header">
    <div>
      <div class="logo">${d.companyName ?? "Mon Entreprise"}</div>
      <div class="company-info" style="margin-top:6px">
        ${d.companyAddress ? d.companyAddress + "<br/>" : ""}
        ${d.companyPhone   ? "Tél : " + d.companyPhone + "<br/>" : ""}
        ${d.companyEmail   ? d.companyEmail : ""}
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">${d.type}</div>
      <div class="doc-number">${d.invoiceNumber}</div>
      <div class="doc-date">Date : ${fmtDate(d.date)}</div>
      ${d.dueDate ? `<div class="doc-date">Échéance : ${fmtDate(d.dueDate)}</div>` : ""}
    </div>
  </div>

  <div class="billing">
    <div class="bill-box">
      <div class="bill-label">Émetteur</div>
      <div class="bill-name">${d.companyName ?? "—"}</div>
      <div class="bill-info">${d.companyAddress ?? ""}${d.companyEmail ? "<br/>" + d.companyEmail : ""}</div>
    </div>
    <div class="bill-box">
      <div class="bill-label">Destinataire</div>
      <div class="bill-name">${d.partnerName}</div>
      <div class="bill-info">${d.partnerEmail ?? ""}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="text-align:left;width:35%">Désignation</th>
      <th class="center" style="width:8%">Qté</th>
      <th class="right"  style="width:16%">Prix unit.</th>
      <th class="center" style="width:10%">Remise</th>
      <th class="center" style="width:10%">TVA</th>
      <th class="right"  style="width:16%">Total HT</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals"><div class="totals-box">
    <div class="total-row"><span>Sous-total HT</span><span>${fmt(d.subtotal)}</span></div>
    ${d.discAmt > 0 ? `<div class="total-row"><span>Remise (${d.globalDiscount}%)</span><span>−${fmt(d.discAmt)}</span></div>` : ""}
    <div class="total-row"><span>TVA (${d.tax}%)</span><span>+${fmt(d.taxAmt)}</span></div>
    <div class="total-row main"><span>TOTAL TTC</span><span>${fmt(d.total)}</span></div>
  </div></div>

  ${d.notes ? `<div class="notes"><div class="notes-lbl">Notes</div><div class="notes-txt">${d.notes}</div></div>` : ""}

  <div class="footer">Document généré le ${new Date().toLocaleDateString("fr-FR")} — ${d.companyName ?? ""}</div>
  </div></body></html>`;
}

// ─── Template A5 ──────────────────────────────────────────────
function templateA5(d: PrintData): string {
  const rows = d.items.map(it => {
    const lineTotal = it.qty * it.unitPrice * (1 - it.discount / 100);
    return `
      <tr>
        <td>${it.articleName}</td>
        <td class="center">${it.qty}</td>
        <td class="right">${fmt(it.unitPrice)}</td>
        <td class="right bold">${fmt(lineTotal)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8"/>
  <title>${d.invoiceNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size:10px; color:#1a1a1a; background:#fff; }
    @page { size:A5; margin:12mm 12mm 16mm; }

    .header     { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid #2563eb; }
    .logo       { font-size:16px; font-weight:800; color:#2563eb; }
    .company-info { font-size:8px; color:#666; line-height:1.5; margin-top:3px; }
    .doc-title  { font-size:15px; font-weight:700; color:#2563eb; text-transform:uppercase; }
    .doc-number { font-size:11px; font-weight:600; }
    .doc-date   { font-size:8.5px; color:#666; }

    .partner    { background:#f0f4ff; border-radius:5px; padding:8px 10px; margin-bottom:14px; }
    .partner-lbl{ font-size:7.5px; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:2px; }
    .partner-name{ font-size:11px; font-weight:600; }

    table       { width:100%; border-collapse:collapse; margin-bottom:14px; }
    thead th    { background:#2563eb; color:#fff; padding:5px 7px; font-size:7.5px; text-transform:uppercase; font-weight:600; }
    tbody tr    { border-bottom:1px solid #f0f0f0; }
    tbody tr:nth-child(even){ background:#f9fafb; }
    tbody td    { padding:5px 7px; font-size:9px; }
    .center     { text-align:center; }
    .right      { text-align:right; }
    .bold       { font-weight:600; }

    .totals     { display:flex; justify-content:flex-end; margin-bottom:14px; }
    .totals-box { width:180px; }
    .total-row  { display:flex; justify-content:space-between; padding:3px 0; font-size:9px; color:#444; border-bottom:1px solid #f0f0f0; }
    .total-row.main { border-top:2px solid #2563eb; margin-top:3px; padding-top:7px; font-size:12px; font-weight:700; color:#2563eb; border-bottom:none; }

    .footer     { text-align:center; font-size:8px; color:#aaa; border-top:1px solid #e5e7eb; padding-top:8px; }
  </style>
  </head><body>

  <div class="header">
    <div>
      <div class="logo">${d.companyName ?? "Mon Entreprise"}</div>
      <div class="company-info">
        ${d.companyAddress ?? ""}${d.companyPhone ? " — " + d.companyPhone : ""}
      </div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">${d.type}</div>
      <div class="doc-number">${d.invoiceNumber}</div>
      <div class="doc-date">${fmtDate(d.date)}${d.dueDate ? " · Éch. " + fmtDate(d.dueDate) : ""}</div>
    </div>
  </div>

  <div class="partner">
    <div class="partner-lbl">Destinataire</div>
    <div class="partner-name">${d.partnerName}</div>
    ${d.partnerEmail ? `<div style="font-size:8px;color:#555">${d.partnerEmail}</div>` : ""}
  </div>

  <table>
    <thead><tr>
      <th style="text-align:left">Désignation</th>
      <th class="center" style="width:8%">Qté</th>
      <th class="right"  style="width:20%">P.U</th>
      <th class="right"  style="width:22%">Total HT</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals"><div class="totals-box">
    <div class="total-row"><span>Sous-total</span><span>${fmt(d.subtotal)}</span></div>
    ${d.discAmt > 0 ? `<div class="total-row"><span>Remise</span><span>−${fmt(d.discAmt)}</span></div>` : ""}
    <div class="total-row"><span>TVA ${d.tax}%</span><span>+${fmt(d.taxAmt)}</span></div>
    <div class="total-row main"><span>TOTAL</span><span>${fmt(d.total)}</span></div>
  </div></div>

  ${d.notes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px 10px;margin-bottom:14px;font-size:9px;color:#78350f">${d.notes}</div>` : ""}

  <div class="footer">Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
  </body></html>`;
}

// ─── Template Ticket thermique ────────────────────────────────
function templateTicket(d: PrintData): string {
  const rows = d.items.map(it => {
    const lineTotal = it.qty * it.unitPrice * (1 - it.discount / 100);
    return `
      <div class="item">
        <div class="item-name">${it.articleName}</div>
        <div class="item-detail">
          <span>${it.qty} × ${fmt(it.unitPrice)}</span>
          <span class="bold">${fmt(lineTotal)}</span>
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8"/>
  <title>${d.invoiceNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Courier New', monospace; font-size:11px; color:#000; background:#fff; width:80mm; }
    @page { size:80mm auto; margin:4mm 2mm; }

    .center  { text-align:center; }
    .right   { text-align:right; }
    .bold    { font-weight:700; }
    .divider { border:none; border-top:1px dashed #999; margin:8px 0; }
    .divider-solid { border:none; border-top:1px solid #000; margin:6px 0; }

    .company-name { font-size:15px; font-weight:700; margin-bottom:2px; }
    .company-info { font-size:9px; color:#444; line-height:1.5; }
    .doc-type    { font-size:13px; font-weight:700; margin:8px 0 2px; text-transform:uppercase; }
    .doc-number  { font-size:10px; }
    .doc-meta    { font-size:9px; color:#444; margin-top:2px; }
    .partner-box { margin:8px 0; font-size:10px; }
    .partner-lbl { font-size:8.5px; font-weight:700; text-transform:uppercase; color:#444; }

    .item        { margin:4px 0; }
    .item-name   { font-size:10px; font-weight:600; }
    .item-detail { display:flex; justify-content:space-between; font-size:9.5px; color:#333; margin-top:1px; }

    .total-row   { display:flex; justify-content:space-between; padding:2px 0; font-size:10px; }
    .total-main  { display:flex; justify-content:space-between; font-size:13px; font-weight:700; padding:4px 0; }

    .thanks      { font-size:11px; font-weight:700; margin:8px 0 2px; }
    .footer      { font-size:8.5px; color:#555; line-height:1.5; }
  </style>
  </head><body>

  <div class="center">
    <div class="company-name">${d.companyName ?? "Mon Entreprise"}</div>
    <div class="company-info">
      ${d.companyAddress ? d.companyAddress + "<br/>" : ""}
      ${d.companyPhone   ? "Tél : " + d.companyPhone + "<br/>" : ""}
      ${d.companyEmail   ? d.companyEmail : ""}
    </div>
  </div>

  <hr class="divider"/>

  <div class="center">
    <div class="doc-type">${d.type}</div>
    <div class="doc-number">${d.invoiceNumber}</div>
    <div class="doc-meta">Le ${fmtDate(d.date)}${d.dueDate ? " · Éch. " + fmtDate(d.dueDate) : ""}</div>
  </div>

  <hr class="divider"/>

  <div class="partner-box">
    <div class="partner-lbl">Client</div>
    <div class="bold">${d.partnerName}</div>
    ${d.partnerEmail ? `<div style="font-size:9px">${d.partnerEmail}</div>` : ""}
  </div>

  <hr class="divider"/>

  ${rows}

  <hr class="divider-solid"/>

  <div class="total-row"><span>Sous-total HT</span><span>${fmt(d.subtotal)}</span></div>
  ${d.discAmt > 0 ? `<div class="total-row"><span>Remise (${d.globalDiscount}%)</span><span>−${fmt(d.discAmt)}</span></div>` : ""}
  <div class="total-row"><span>TVA (${d.tax}%)</span><span>+${fmt(d.taxAmt)}</span></div>

  <hr class="divider-solid"/>

  <div class="total-main"><span>TOTAL TTC</span><span>${fmt(d.total)}</span></div>

  <hr class="divider"/>

  ${d.notes ? `<div style="font-size:9px;color:#555;margin-bottom:6px">${d.notes}</div><hr class="divider"/>` : ""}

  <div class="center">
    <div class="thanks">Merci de votre confiance !</div>
    <div class="footer">Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
  </div>

  </body></html>`;
}

// ─── Fonction principale ───────────────────────────────────────
export function printInvoice(data: PrintData, format: PrintFormat) {
  const html =
    format === "A4"     ? templateA4(data)     :
    format === "A5"     ? templateA5(data)      :
                          templateTicket(data);

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Veuillez autoriser les popups pour imprimer."); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Laisser le temps au CSS de se charger avant d'ouvrir la boîte d'impression
  setTimeout(() => { win.print(); }, 400);
}