def get_time_window(urgency_score, max_waktu_menit=480, min_waktu_menit=30):
    # Jika index 0 (Gudang/Depot), biasanya tidak punya batas waktu urgensi
    if urgency_score is None:
        return (0, max_waktu_menit)
        
    # Interpolasi linear terbalik
    batas_atas = int(max_waktu_menit - (urgency_score * (max_waktu_menit - min_waktu_menit)))
    
    # Memastikan gada deadline yang kurang dari batas minimal
    batas_atas = max(min_waktu_menit, batas_atas)
    
    return (0, batas_atas)

def generate_all_time_windows(data_toko):
    """
    Input: List of dictionary yang berisi data toko beserta 'urgency'
    Output: List of tuples untuk masuk ke solver OR-Tools
    """
    time_windows = []
    for toko in data_toko:
        # Gunakan get('urgency') agar aman jika key tidak ada (seperti di gudang)
        tw = get_time_window(toko.get('urgency'))
        time_windows.append(tw)
    return time_windows