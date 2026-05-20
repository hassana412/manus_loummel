/**
 * Marketplace notifications.
 *
 * The platform provides `notifyOwner` (in-app notification to the project
 * owner). Until a transactional email service (SendGrid, Resend, etc.) is
 * connected via env secrets, we route all user-facing notifications through
 * `notifyOwner` so the owner can see every event, AND log them server-side
 * for traceability.
 *
 * When the user later provides an email API key, only this file needs to be
 * updated (one function per event) — callers in routers.ts remain untouched.
 */

import { notifyOwner } from "./_core/notification";

function formatFCFA(n: number) {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

async function send(title: string, content: string) {
  console.log(`[Notification] ${title} :: ${content}`);
  try {
    await notifyOwner({ title, content: content.slice(0, 1900) });
  } catch (err) {
    console.warn("[Notification] notifyOwner failed", err);
  }
}

/* --------------- Acheteur --------------- */

export async function notifyBuyerOrderConfirmed(args: {
  buyerEmail: string | null;
  buyerName: string | null;
  orderNumber: string;
  total: number;
}) {
  await send(
    "Commande confirmée",
    `${args.buyerName ?? "Client"} (${args.buyerEmail ?? "—"}) — Commande ${
      args.orderNumber
    } confirmée pour ${formatFCFA(args.total)}.`
  );
}

export async function notifyBuyerOrderShipped(args: {
  buyerEmail: string | null;
  orderNumber: string;
}) {
  await send(
    "Commande expédiée",
    `La commande ${args.orderNumber} (acheteur ${
      args.buyerEmail ?? "—"
    }) vient d'être expédiée.`
  );
}

/* --------------- Vendeur --------------- */

export async function notifySellerNewOrder(args: {
  shopName: string;
  orderNumber: string;
  amount: number;
}) {
  await send(
    `Nouvelle commande — ${args.shopName}`,
    `${args.shopName} a reçu la commande ${args.orderNumber} (${formatFCFA(
      args.amount
    )}).`
  );
}

export async function notifySellerWalletCredited(args: {
  shopName: string;
  amount: number;
  newBalance: number;
}) {
  await send(
    `Wallet crédité — ${args.shopName}`,
    `${formatFCFA(args.amount)} ont été ajoutés au wallet de ${
      args.shopName
    }. Nouveau solde : ${formatFCFA(args.newBalance)}.`
  );
}

/* --------------- VIP --------------- */

export async function notifyVipActivated(args: {
  shopName: string;
  buyerEmail: string | null;
}) {
  await send(
    "Abonnement VIP activé",
    `${args.shopName} a activé l'abonnement VIP (15 000 FCFA/an).${
      args.buyerEmail ? ` Email : ${args.buyerEmail}` : ""
    }`
  );
}
