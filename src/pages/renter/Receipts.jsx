import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getReceipts } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import styles from './Receipts.module.css';

function generateReceiptHTML(receipt) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt ${receipt.receiptId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .company { font-size: 22px; font-weight: bold; color: #2563eb; }
        .badge { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        h2 { text-align: center; margin-bottom: 24px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { background: #f3f4f6; text-align: left; padding: 10px 14px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; }
        .total td { font-weight: bold; font-size: 16px; border-top: 2px solid #e5e7eb; border-bottom: none; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 48px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company">🏢 PropMgmt</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Property Management Portal</div>
        </div>
        <span class="badge">PAID</span>
      </div>
      <h2>Payment Receipt</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Receipt ID</td><td><strong>${receipt.receiptId}</strong></td></tr>
        <tr><td>Tenant Name</td><td>${receipt.tenantName}</td></tr>
        <tr><td>Property</td><td>${receipt.property}</td></tr>
        <tr><td>Payment Period</td><td>${receipt.month}</td></tr>
        <tr><td>Payment Date</td><td>${receipt.paidOn}</td></tr>
        <tr><td>Payment Method</td><td>${receipt.method}</td></tr>
        <tr class="total"><td>Amount Paid</td><td>$${receipt.amount.toLocaleString()}</td></tr>
      </table>
      <div class="footer">
        <p>Thank you for your payment. Please retain this receipt for your records.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </body>
    </html>
  `;
}

function downloadReceipt(receipt) {
  const html = generateReceiptHTML(receipt);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${receipt.receiptId}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReceipt(receipt) {
  const html = generateReceiptHTML(receipt);
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

export default function Receipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReceipts(user.name).then(setReceipts).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className={styles.loading}>Loading receipts…</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Payment Receipts</h1>
          <p className={styles.subtitle}>Download or print your payment receipts</p>
        </div>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🧾</span>
            <p>No receipts available yet.</p>
          </div>
        </Card>
      ) : (
        <div className={styles.receiptsGrid}>
          {receipts.map((r) => (
            <Card key={r.receiptId} className={styles.receiptCard}>
              <div className={styles.receiptHeader}>
                <span className={styles.receiptId}>{r.receiptId}</span>
                <span className={styles.paidBadge}>✓ PAID</span>
              </div>
              <div className={styles.receiptDetails}>
                <div className={styles.detailRow}><span>Period</span><strong>{r.month}</strong></div>
                <div className={styles.detailRow}><span>Date</span><span>{r.paidOn}</span></div>
                <div className={styles.detailRow}><span>Method</span><span>{r.method}</span></div>
                <div className={[styles.detailRow, styles.amountRow].join(' ')}>
                  <span>Amount</span>
                  <strong className={styles.amount}>${r.amount.toLocaleString()}</strong>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="outline" size="sm" onClick={() => printReceipt(r)}>🖨️ Print</Button>
                <Button variant="primary" size="sm" onClick={() => downloadReceipt(r)}>⬇️ Download</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
