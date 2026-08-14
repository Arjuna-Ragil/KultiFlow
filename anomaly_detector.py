import pandas as pd
import numpy as np
 
MIN_ORDERS_FOR_PERSONAL_BASELINE = 5   # di bawah ini, pakai baseline populasi (cold-start)
Z_SCORE_THRESHOLD = 3.0                # kuantitas dianggap mencurigakan kalau > 3 std dari normal
PRICE_RATIO_THRESHOLD = 0.5            # bayar < 50% dari subtotal wajar = mencurigakan
NORMAL_HOUR_RANGE = (6, 22)            # jam wajar toko "buka" (06.00 - 22.00)
MIN_FLAGS_TO_REJECT = 2                
 
 
def compute_buyer_baseline(orders_df, min_orders=MIN_ORDERS_FOR_PERSONAL_BASELINE):
    """Rata-rata & std kuantitas order per buyer, dihitung dari histori order NORMAL mereka."""
    normal = orders_df[~orders_df["is_anomaly"]]
    stats = normal.groupby("buyer_id")["quantity"].agg(["mean", "std", "count"]).reset_index()
    stats.columns = ["buyer_id", "qty_mean", "qty_std", "n_orders"]
    stats["has_enough_history"] = stats["n_orders"] >= min_orders
    return stats
 
 
def compute_population_baseline(orders_df):
    """Fallback baseline per tipe buyer (retail/reseller), buat buyer baru yang histori-nya masih tipis."""
    normal = orders_df[~orders_df["is_anomaly"]]
    stats = normal.groupby("buyer_type")["quantity"].agg(["mean", "std"]).reset_index()
    stats.columns = ["buyer_type", "qty_mean_pop", "qty_std_pop"]
    return stats
 
 
def check_order(new_order, buyer_baseline, population_baseline,
                 z_threshold=Z_SCORE_THRESHOLD,
                 price_ratio_threshold=PRICE_RATIO_THRESHOLD,
                 normal_hour_range=NORMAL_HOUR_RANGE,
                 min_flags_to_reject=MIN_FLAGS_TO_REJECT):
    """Cek satu order baru terhadap baseline, return sinyal & keputusan."""
    flags = []
 
    # --- sinyal 1: kuantitas nggak wajar (dibanding baseline buyer, atau populasi kalau buyer baru) ---
    b = buyer_baseline[buyer_baseline["buyer_id"] == new_order["buyer_id"]]
    if len(b) > 0 and b.iloc[0]["has_enough_history"] and b.iloc[0]["qty_std"] > 0:
        mean_, std_ = b.iloc[0]["qty_mean"], b.iloc[0]["qty_std"]
        source = "personal"
    else:
        p = population_baseline[population_baseline["buyer_type"] == new_order["buyer_type"]].iloc[0]
        mean_, std_ = p["qty_mean_pop"], p["qty_std_pop"]
        source = "population"
 
    qty_z = (new_order["quantity"] - mean_) / std_ if std_ > 0 else 0
    if qty_z > z_threshold:
        flags.append(f"quantity_unusual (z={qty_z:.1f}, baseline={source})")
 
    # --- sinyal 2: jam nggak wajar ---
    hour = pd.to_datetime(new_order["order_datetime"]).hour
    if not (normal_hour_range[0] <= hour <= normal_hour_range[1]):
        flags.append(f"unusual_hour ({hour:02d}:00)")
 
    # --- sinyal 3: harga nggak konsisten (bayar jauh di bawah subtotal wajar) ---
    expected = new_order["catalog_price"] * new_order["quantity"]
    price_ratio = new_order["paid_amount"] / expected if expected > 0 else 1
    if price_ratio < price_ratio_threshold:
        flags.append(f"price_mismatch (ratio={price_ratio:.2f})")
 
    is_anomaly_pred = len(flags) >= min_flags_to_reject
    return {"flags": flags, "n_flags": len(flags), "is_anomaly_pred": is_anomaly_pred}
 
 
def process_order(new_order, buyer_baseline, population_baseline, invoice_counter):
    """Endpoint logic: cek order -> approve (bikin data invoice) atau reject (tolak, tanpa invoice)."""
    result = check_order(new_order, buyer_baseline, population_baseline)
 
    if result["is_anomaly_pred"]:
        return {
            "status": "REJECTED",
            "reasons": result["flags"],
            "invoice": None,
        }
 
    invoice = {
        "invoice_id": f"INV-{invoice_counter:06d}",
        "buyer_id": new_order["buyer_id"],
        "fruit_type": new_order["fruit_type"],
        "quantity": int(new_order["quantity"]),
        "catalog_price": float(new_order["catalog_price"]),
        "paid_amount": float(new_order["paid_amount"]),
        "order_datetime": str(new_order["order_datetime"]),
        "status": "APPROVED",
    }
    return {"status": "APPROVED", "reasons": [], "invoice": invoice}
 
 
def evaluate_detector(orders_df, buyer_baseline, population_baseline):
    """Jalanin check_order ke SEMUA baris data, bandingin prediksi vs label asli (is_anomaly)."""
    predictions = orders_df.apply(
        lambda row: check_order(row.to_dict(), buyer_baseline, population_baseline)["is_anomaly_pred"],
        axis=1
    )
    actual = orders_df["is_anomaly"]
 
    tp = ((predictions) & (actual)).sum()
    fp = ((predictions) & (~actual)).sum()
    fn = ((~predictions) & (actual)).sum()
    tn = ((~predictions) & (~actual)).sum()
 
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
 
    print(f"Confusion matrix:")
    print(f"  True Positive  (anomali ketangkep)      : {tp}")
    print(f"  False Positive (normal ke-flag anomali)  : {fp}")
    print(f"  False Negative (anomali lolos)           : {fn}")
    print(f"  True Negative  (normal ke-approve)       : {tn}")
    print(f"\nPrecision: {precision:.2%}  (dari yang di-reject, berapa % beneran anomali)")
    print(f"Recall   : {recall:.2%}  (dari semua anomali asli, berapa % ketangkep)")
 
 
if __name__ == "__main__":
    orders = pd.read_csv("dummy_orders.csv", parse_dates=["order_datetime"])
 
    buyer_baseline = compute_buyer_baseline(orders)
    population_baseline = compute_population_baseline(orders)
 
    print("=" * 60)
    print("TES 1: order NORMAL (ambil dari data asli)")
    normal_example = orders[~orders["is_anomaly"]].iloc[0].to_dict()
    result = process_order(normal_example, buyer_baseline, population_baseline, invoice_counter=1)
    print("Input :", {k: normal_example[k] for k in ["buyer_id", "fruit_type", "quantity", "paid_amount"]})
    print("Output:", result)
 
    print("\nTES 2: order ANOMALI (ambil dari data asli)")
    anomaly_example = orders[orders["is_anomaly"]].iloc[0].to_dict()
    result = process_order(anomaly_example, buyer_baseline, population_baseline, invoice_counter=2)
    print("Input :", {k: anomaly_example[k] for k in ["buyer_id", "fruit_type", "quantity", "paid_amount"]})
    print("Output:", result)
 
    print("\n" + "=" * 60)
    print("EVALUASI FULL DATASET")
    evaluate_detector(orders, buyer_baseline, population_baseline)