
import { PrismaClient, DocumentType, NumberingConfig } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Génère le prochain numéro selon la config de la company.
 * Incrémente la séquence en base (transaction atomique).
 */
export async function generateNextNumber(
  companyId: string,
  docType: DocumentType
): Promise<string> {
  return await prisma.$transaction(async (tx) => {

    // 1. Récupère la config (ou crée une config par défaut)
    let config = await tx.numberingConfig.findUnique({
      where: { companyId_docType: { companyId, docType } },
    });

    if (!config) {
      config = await tx.numberingConfig.create({
        data: {
          companyId,
          docType,
          prefix:       getDefaultPrefix(docType),
          separator:    '-',
          includeYear:  true,
          yearFormat:   'YYYY',
          includeMonth: false,
          padding:      4,
          resetPeriod:  'YEARLY',
          currentSeq:   0,
          lastReset:    new Date(),
        },
      });
    }

    // 2. Vérifie si la séquence doit être remise à zéro
    const now       = new Date();
    const lastReset = new Date(config.lastReset);
    let   shouldReset = false;

    if (config.resetPeriod === 'YEARLY') {
      shouldReset = now.getFullYear() > lastReset.getFullYear();
    } else if (config.resetPeriod === 'MONTHLY') {
      shouldReset =
        now.getFullYear() > lastReset.getFullYear() ||
        now.getMonth()    > lastReset.getMonth();
    }

    const newSeq = shouldReset ? 1 : config.currentSeq + 1;

    // 3. Incrémente en base
    await tx.numberingConfig.update({
      where: { companyId_docType: { companyId, docType } },
      data: {
        currentSeq: newSeq,
        ...(shouldReset && { lastReset: now }),
      },
    });

    // 4. Formate le numéro
    return formatNumber(config, newSeq, now);
  });
}

/**
 * Aperçu du prochain numéro SANS incrémenter (pour le formulaire).
 */
export async function previewNextNumber(
  companyId: string,
  docType: DocumentType
): Promise<string> {
  const config = await prisma.numberingConfig.findUnique({
    where: { companyId_docType: { companyId, docType } },
  });

  if (!config) {
    // Config par défaut si non configurée
    return `${getDefaultPrefix(docType)}-${new Date().getFullYear()}-0001`;
  }

  const now    = new Date();
  const nextSeq = config.currentSeq + 1;
  return formatNumber(config, nextSeq, now);
}

/** Formate le numéro selon la config */
function formatNumber(
  config: { prefix: string; separator: string; includeYear: boolean; yearFormat: string; includeMonth: boolean; padding: number },
  seq: number,
  date: Date
): string {
  const sep  = config.separator;
  const year = config.includeYear
    ? config.yearFormat === 'YY'
      ? String(date.getFullYear()).slice(-2)
      : String(date.getFullYear())
    : null;
  const month = config.includeMonth
    ? String(date.getMonth() + 1).padStart(2, '0')
    : null;
  const sequence = String(seq).padStart(config.padding, '0');

  const parts = [config.prefix];
  if (year && !month) parts.push(year);
  if (year && month)  parts.push(`${year}${month}`);
  parts.push(sequence);

  return parts.join(sep);
}

/** Préfixes par défaut si aucune config n'existe */
function getDefaultPrefix(docType: DocumentType): string {
  const map: Record<DocumentType, string> = {
    QUOTE:            'DEV',
    INVOICE:          'FAC',
    CREDIT_NOTE:      'AVO',
    DELIVERY_NOTE:    'BL',
    SHIPPING_NOTE:    'BE',
    PURCHASE_ORDER:   'BC',
    SUPPLIER_INVOICE: 'FAF',
    RECEIPT_NOTE:     'BR',
    RETURN_NOTE:      'BRT',
  };
  return map[docType] ?? 'DOC';
}
