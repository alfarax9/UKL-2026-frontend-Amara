import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/lib/toast";
import type { Order } from "@/types/api.types";

// ── Amara Color Palette ──────────────────────────────────────────────────────
const COLORS = {
  ink: [18, 43, 36] as [number, number, number],         // #122B24
  primary: [40, 65, 57] as [number, number, number],     // #284139
  copper: [182, 102, 66] as [number, number, number],    // #B66642
  gold: [212, 175, 55] as [number, number, number],      // #D4AF37
  paper: [250, 247, 242] as [number, number, number],    // #FAF7F2
  white: [255, 255, 255] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  line: [220, 220, 220] as [number, number, number],
  red: [186, 26, 26] as [number, number, number],
};

const TAX_RATE = 0.10; // Pajak 10% (PB1 Restoran)

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Generate and download a monthly sales summary PDF.
 * Data is computed client-side from the orders array.
 */
export function exportMonthlySummaryPdf(orders: Order[], month: number, year: number) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // ── Filter orders for the selected month (only COMPLETED) ─────────────────
  const monthOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === month &&
      d.getFullYear() === year &&
      o.status === "COMPLETED"
    );
  });

  // ── Calculate menu sales ──────────────────────────────────────────────────
  const menuSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const order of monthOrders) {
    if (!order.orderItems) continue;
    for (const item of order.orderItems) {
      const name = item.menu?.name ?? "Menu tidak diketahui";
      const qty = item.quantity;
      const subtotal = Number(item.subtotal ?? 0) || Number(item.price ?? 0) * qty;
      const existing = menuSalesMap.get(name);
      if (existing) {
        existing.qty += qty;
        existing.revenue += subtotal;
      } else {
        menuSalesMap.set(name, { name, qty, revenue: subtotal });
      }
    }
  }

  const menuSales = Array.from(menuSalesMap.values()).sort((a, b) => b.revenue - a.revenue);
  const totalOmset = monthOrders.reduce((s, o) => s + Number(o.totalPrice ?? 0), 0);
  const totalTax = totalOmset * TAX_RATE;
  const netOmset = totalOmset - totalTax;
  const totalOrders = monthOrders.length;
  const periodLabel = `${MONTH_NAMES[month]} ${year}`;

  // ══════════════════════════════════════════════════════════════════════════
  //  PAGE 1 — HEADER
  // ══════════════════════════════════════════════════════════════════════════

  // Dark green header band
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 0, pageWidth, 56, "F");

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.white);
  doc.text("AMARA", margin, 26);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text("FINE DINING", margin, 34);

  // Report title (right aligned)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Laporan Penjualan Bulanan", pageWidth - margin, 22, { align: "right" });

  // Period
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text(`Periode: ${periodLabel}`, pageWidth - margin, 30, { align: "right" });

  // Generated date
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(
    `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    pageWidth - margin,
    38,
    { align: "right" },
  );

  // Copper accent line
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, 56, pageWidth, 2, "F");

  // ══════════════════════════════════════════════════════════════════════════
  //  SUMMARY CARDS
  // ══════════════════════════════════════════════════════════════════════════
  let y = 68;

  const cardData = [
    { label: "Total Pesanan", value: `${totalOrders} pesanan` },
    { label: "Omset Kotor", value: formatRp(totalOmset) },
    { label: `Pajak Restoran (${TAX_RATE * 100}%)`, value: `- ${formatRp(totalTax)}` },
    { label: "Omset Bersih", value: formatRp(netOmset) },
  ];

  const cardW = (contentWidth - 6) / 2;
  const cardH = 22;
  const cardGap = 6;

  cardData.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = margin + col * (cardW + cardGap);
    const cy = y + row * (cardH + cardGap);

    // Card background
    const isNetOmset = i === 3;
    if (isNetOmset) {
      doc.setFillColor(...COLORS.primary);
    } else {
      doc.setFillColor(...COLORS.paper);
    }
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, "F");

    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(isNetOmset ? 200 : COLORS.muted[0], isNetOmset ? 220 : COLORS.muted[1], isNetOmset ? 200 : COLORS.muted[2]);
    doc.text(card.label.toUpperCase(), cx + 5, cy + 8);

    // Value
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    if (isNetOmset) {
      doc.setTextColor(...COLORS.gold);
    } else if (i === 2) {
      doc.setTextColor(...COLORS.red);
    } else {
      doc.setTextColor(...COLORS.ink);
    }
    doc.text(card.value, cx + 5, cy + 17);
  });

  y += 2 * (cardH + cardGap) + 8;

  // ══════════════════════════════════════════════════════════════════════════
  //  MENU SALES TABLE
  // ══════════════════════════════════════════════════════════════════════════

  // Section title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.ink);
  doc.text("Penjualan per Menu", margin, y);
  y += 2;

  // Copper underline
  doc.setFillColor(...COLORS.copper);
  doc.rect(margin, y, 40, 1, "F");
  y += 6;

  const tableBody = menuSales.map((item, idx) => [
    (idx + 1).toString(),
    item.name,
    item.qty.toString(),
    formatRp(item.revenue),
  ]);

  // Totals row
  const totalQty = menuSales.reduce((s, m) => s + m.qty, 0);
  tableBody.push(["", "TOTAL", totalQty.toString(), formatRp(totalOmset)]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Nama Menu", "Qty Terjual", "Pendapatan"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: COLORS.paper,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 28 },
      3: { halign: "right", cellWidth: 42 },
    },
    didParseCell: (data) => {
      // Style the total row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = COLORS.ink;
        data.cell.styles.textColor = COLORS.gold;
        data.cell.styles.fontSize = 10;
      }
    },
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  // Copper line at the bottom
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, pageHeight - 14, pageWidth, 1.5, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Laporan ini digenerate secara otomatis oleh sistem Amara Fine Dining.",
    margin,
    pageHeight - 7,
  );
  doc.text(
    `Halaman 1 dari 1`,
    pageWidth - margin,
    pageHeight - 7,
    { align: "right" },
  );

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = `Amara_Laporan_Penjualan_${MONTH_NAMES[month]}_${year}.pdf`;
  doc.save(filename);
}

/**
 * Helper to draw a single order bill on the active page of the jsPDF instance.
 */
function drawOrderBillPage(doc: jsPDF, order: any, pageIndex: number, totalOrders: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Helper for order code
  const getOrderCode = (id: string) => `ORD-AMR-${id.slice(-4).toUpperCase()}`;

  // Normalize items & total
  const items = order.items
    ? order.items.map((it: any) => ({
        name: it.name,
        quantity: it.quantity,
        price: Number(it.price),
        subtotal: Number(it.price) * it.quantity,
      }))
    : (order.orderItems ?? []).map((it: any) => ({
        name: it.menu?.name ?? "Menu",
        quantity: it.quantity,
        price: Number(it.price),
        subtotal: Number(it.price ?? 0) * it.quantity,
      }));

  const totalPrice = order.total !== undefined ? Number(order.total) : Number(order.totalPrice ?? 0);
  const subtotalSum = items.reduce((sum: number, it: any) => sum + it.subtotal, 0);
  const tax = subtotalSum * TAX_RATE;

  // Header band
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text("AMARA", margin, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text("FINE DINING", margin, 29);

  // Bill title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("TAGIHAN / BILL", pageWidth - margin, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${getOrderCode(order.id)}`, pageWidth - margin, 29, { align: "right" });

  // Accent line
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, 45, pageWidth, 1.5, "F");

  // Details
  let y = 60;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("DETAIL TRANSAKSI", margin, y);
  
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.ink);

  const dateStr = new Date(order.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.text(`Pelanggan :  ${order.customerName}`, margin, y);
  doc.text(`Tanggal     :  ${dateStr}`, margin, y + 5);

  const paymentLabel =
    order.paymentMethod === "qris"
      ? "QRIS"
      : order.paymentMethod === "cash"
        ? "Tunai"
        : order.paymentMethod === "transfer"
          ? "Transfer Bank"
          : "Lainnya";

  doc.text(`Nomor Meja      :  Meja ${order.tableNumber}`, pageWidth - margin - 65, y);
  doc.text(`Metode Bayar    :  ${paymentLabel}`, pageWidth - margin - 65, y + 5);

  y += 18;

  // Table
  const tableBody = items.map((it: any, idx: number) => [
    (idx + 1).toString(),
    it.name,
    it.quantity.toString(),
    formatRp(it.price),
    formatRp(it.subtotal),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Item", "Qty", "Harga Satuan", "Total"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.ink,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: COLORS.paper,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 32 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  y = finalY;

  // Summary calculation block
  const summaryX = pageWidth - margin - 75;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);

  doc.text("Subtotal", summaryX, y);
  doc.text(formatRp(subtotalSum), pageWidth - margin, y, { align: "right" });

  doc.text(`Pajak Restoran (${TAX_RATE * 100}%)`, summaryX, y + 5);
  doc.text(formatRp(tax), pageWidth - margin, y + 5, { align: "right" });

  // Total
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(summaryX - 2, y + 9, 77, 10, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gold);
  doc.text("TOTAL BAYAR", summaryX + 2, y + 15);
  doc.text(formatRp(totalPrice), pageWidth - margin - 2, y + 15, { align: "right" });

  if (order.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Catatan: ${order.notes}`, margin, y + 5);
  }

  // Footer
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, pageHeight - 15, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Terima kasih atas kunjungan Anda di Amara Fine Dining.", margin, pageHeight - 7);
  doc.text(`Halaman ${pageIndex + 1} dari ${totalOrders}`, pageWidth - margin, pageHeight - 7, { align: "right" });
}

/**
 * Generate and download a receipt/bill PDF for an individual order.
 */
export function exportSingleOrderBillPdf(order: any) {
  const getOrderCode = (id: string) => `ORD-AMR-${id.slice(-4).toUpperCase()}`;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  drawOrderBillPage(doc, order, 0, 1);

  const filename = `Amara_Bill_${getOrderCode(order.id)}.pdf`;
  doc.save(filename);
  toast(`Bill ${getOrderCode(order.id)} berhasil diunduh`);
}

/**
 * Generate and download all bills for completed orders of the selected month/year in a single PDF (one page per bill).
 */
export function exportAllMonthlyBillsPdf(orders: Order[], month: number, year: number) {
  // Filter completed orders for the selected month/year
  const monthOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === month &&
      d.getFullYear() === year &&
      o.status === "COMPLETED"
    );
  });

  if (monthOrders.length === 0) {
    toast(`Tidak ada data penjualan selesai (COMPLETED) untuk periode ${MONTH_NAMES[month]} ${year}.`, "error");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  monthOrders.forEach((order, idx) => {
    if (idx > 0) {
      doc.addPage();
    }
    drawOrderBillPage(doc, order, idx, monthOrders.length);
  });

  const filename = `Amara_Kumpulan_Bill_${MONTH_NAMES[month]}_${year}.pdf`;
  doc.save(filename);
  toast(`Berhasil mengunduh ${monthOrders.length} bill untuk periode ${MONTH_NAMES[month]} ${year}.`);
}

/**
 * Generate and download a list of monthly transactions/orders in PDF format.
 */
export function exportMonthlyOrdersListPdf(orders: Order[], month: number, year: number) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;

  // Helper for order code
  const getOrderCode = (id: string) => `ORD-AMR-${id.slice(-4).toUpperCase()}`;

  // Filter completed orders for the selected month/year
  const monthOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === month &&
      d.getFullYear() === year &&
      o.status === "COMPLETED"
    );
  });

  const totalOmset = monthOrders.reduce((s, o) => s + Number(o.totalPrice ?? 0), 0);
  const totalTax = totalOmset * TAX_RATE;
  const netOmset = totalOmset - totalTax;
  const totalOrders = monthOrders.length;
  const periodLabel = `${MONTH_NAMES[month]} ${year}`;

  // Header band
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 0, pageWidth, 48, "F");

  // Logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text("AMARA", margin, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text("FINE DINING", margin, 29);

  // Report title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Laporan Transaksi Pesanan", pageWidth - margin, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gold);
  doc.text(`Periode: ${periodLabel}`, pageWidth - margin, 29, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  const printedTime = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Dicetak: ${printedTime}`, pageWidth - margin, 36, { align: "right" });

  // Accent Line
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, 48, pageWidth, 1.5, "F");

  let y = 60;

  // Ringkasan
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("RINGKASAN LAPORAN", margin, y);
  
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);
  
  doc.text(`Total Pesanan Selesai  : ${totalOrders} transaksi`, margin, y);
  doc.text(`Total Omset Kotor          : ${formatRp(totalOmset)}`, pageWidth - margin - 75, y);
  
  doc.text(`Total Pajak Restoran (10%) : ${formatRp(totalTax)}`, margin, y + 5);
  doc.text(`Total Omset Bersih         : ${formatRp(netOmset)}`, pageWidth - margin - 75, y + 5);

  y += 18;

  // Table Title
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("DAFTAR TRANSAKSI PESANAN", margin, y);

  y += 4;

  const tableBody = monthOrders.map((o, idx) => {
    const dStr = new Date(o.createdAt!).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return [
      (idx + 1).toString(),
      dStr,
      getOrderCode(o.id),
      o.customerName,
      `Meja ${o.tableNumber}`,
      formatRp(Number(o.totalPrice ?? 0)),
    ];
  });

  // Total row
  tableBody.push(["", "TOTAL", "", "", `${totalOrders} pesanan`, formatRp(totalOmset)]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Waktu", "ID Pesanan", "Pelanggan", "Meja", "Total Bayar"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: COLORS.ink,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: COLORS.paper,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { fontStyle: "bold", cellWidth: 25 },
      3: { cellWidth: "auto" },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "right", cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = COLORS.ink;
        data.cell.styles.textColor = COLORS.gold;
        data.cell.styles.fontSize = 9;
      }
    },
  });

  // Footer
  doc.setFillColor(...COLORS.copper);
  doc.rect(0, pageHeight - 14, pageWidth, 1.5, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  doc.text("Laporan ini digenerate secara otomatis oleh sistem Amara Fine Dining.", margin, pageHeight - 7);
  doc.text("Halaman 1 dari 1", pageWidth - margin, pageHeight - 7, { align: "right" });

  const filename = `Amara_Laporan_Transaksi_${MONTH_NAMES[month]}_${year}.pdf`;
  doc.save(filename);
}

