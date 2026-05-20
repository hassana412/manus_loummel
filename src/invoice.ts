import PDFDocument from "pdfkit";
import { getDb, getOrderById, getOrderItems, getShopById } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

/**
 * Build invoice PDF for a given order and stream it to a writable target.
 * Returns a Buffer when target is undefined.
 */
export async function buildInvoicePdf(orderId: number): Promise<Buffer> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Commande introuvable");
  const items = await getOrderItems(orderId);

  // Find buyer
  const db = await getDb();
  let buyer: { name: string | null; email: string | null } = { name: null, email: null };
  if (db) {
    const r = await db.select().from(users).where(eq(users.id, order.buyerId)).limit(1);
    if (r[0]) buyer = { name: r[0].name, email: r[0].email };
  }

  // Get shop names
  const shopNames = new Map<number, string>();
  for (const it of items) {
    if (!shopNames.has(it.shopId)) {
      const s = await getShopById(it.shopId);
      shopNames.set(it.shopId, s?.name ?? `Boutique #${it.shopId}`);
    }
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  // Header
  doc.fillColor("#b15c1f").fontSize(28).font("Helvetica-Bold").text("Loummel", 50, 50);
  doc.fillColor("#999").fontSize(10).font("Helvetica").text("Marketplace du Nord Cameroun", 50, 82);

  doc.fillColor("#000").fontSize(18).font("Helvetica-Bold").text("FACTURE", 400, 55, { align: "right" });
  doc.fillColor("#666").fontSize(10).font("Helvetica").text(`N° ${order.orderNumber}`, 400, 80, { align: "right" });
  doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString("fr-FR")}`, 400, 95, { align: "right" });

  doc.moveTo(50, 130).lineTo(545, 130).strokeColor("#e5e5e5").stroke();

  // Buyer block
  const shipping = order.shippingAddress as {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    country?: string;
  } | null;

  doc.fillColor("#666").fontSize(10).text("Facturé à", 50, 145);
  doc.fillColor("#000").font("Helvetica-Bold").text(shipping?.fullName ?? buyer.name ?? "Client", 50, 160);
  doc.font("Helvetica").fontSize(10).fillColor("#333");
  if (buyer.email) doc.text(buyer.email, 50, 175);
  if (shipping?.phone) doc.text(shipping.phone, 50, 188);
  if (shipping?.line1) doc.text(shipping.line1, 50, 201);
  if (shipping?.city) doc.text(`${shipping.city}${shipping.region ? ", " + shipping.region : ""}`, 50, 214);

  // Status
  doc.fillColor("#666").fontSize(10).text("Statut de paiement", 380, 145);
  doc
    .fillColor(order.paymentStatus === "paid" ? "#16a34a" : "#d97706")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(order.paymentStatus === "paid" ? "PAYÉ" : order.paymentStatus.toUpperCase(), 380, 160);

  // Items table
  let y = 260;
  doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
  doc.text("Produit", 50, y);
  doc.text("Boutique", 220, y);
  doc.text("Qté", 360, y, { width: 40, align: "right" });
  doc.text("PU", 400, y, { width: 60, align: "right" });
  doc.text("Total", 470, y, { width: 75, align: "right" });
  doc.moveTo(50, y + 15).lineTo(545, y + 15).strokeColor("#e5e5e5").stroke();
  y += 25;

  doc.font("Helvetica").fontSize(10);
  for (const it of items) {
    doc.fillColor("#000").text(it.productName, 50, y, { width: 160 });
    doc.fillColor("#666").text(shopNames.get(it.shopId) ?? "", 220, y, { width: 130 });
    doc.fillColor("#000").text(String(it.quantity), 360, y, { width: 40, align: "right" });
    doc.text(formatFCFA(it.unitPrice), 400, y, { width: 60, align: "right" });
    doc.font("Helvetica-Bold").text(formatFCFA(it.subtotal), 470, y, { width: 75, align: "right" });
    doc.font("Helvetica");
    y += 22;
  }

  // Totals
  y += 10;
  doc.moveTo(350, y).lineTo(545, y).strokeColor("#e5e5e5").stroke();
  y += 10;
  doc.fontSize(10).fillColor("#666").text("Sous-total", 350, y);
  doc.fillColor("#000").text(formatFCFA(order.totalAmount), 470, y, { width: 75, align: "right" });
  y += 15;
  if ((order.shippingFee ?? 0) > 0) {
    doc.fillColor("#666").text("Livraison", 350, y);
    doc.fillColor("#000").text(formatFCFA(order.shippingFee ?? 0), 470, y, { width: 75, align: "right" });
    y += 15;
  }
  y += 5;
  doc
    .fillColor("#b15c1f")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Total TTC", 350, y);
  doc.text(formatFCFA(order.totalAmount + (order.shippingFee ?? 0)), 470, y, { width: 75, align: "right" });

  // Footer
  doc
    .fontSize(9)
    .fillColor("#999")
    .font("Helvetica")
    .text(
      "Merci pour votre achat sur Loummel. Cette facture a été générée automatiquement. Paiement traité par Stripe.",
      50,
      770,
      { width: 495, align: "center" }
    );

  doc.end();
  return done;
}
