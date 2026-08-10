from pydantic import BaseModel

class PricePolicy(BaseModel):
    """
    Menyimpan aturan harga (pagar pengaman) untuk produk tertentu.
    Skema ini menjamin tipe data aman dan terstruktur.
    """
    product_name: str
    base_price: float
    floor_price: float
    opening_counter_price: float

    def is_price_acceptable(self, price: float) -> bool:
        """
        Validasi mutlak: Apakah harga yang diusulkan (oleh user atau AI)
        memenuhi batas bawah (floor_price) yang diizinkan perusahaan?
        """
        return price >= self.floor_price

def compute_price_policy(
    product_name: str, 
    base_price: float, 
    urgency_score: float = 0.0
) -> PricePolicy:
    """
    Fungsi cerdas untuk menghitung batas harga secara dinamis.
    
    Parameter:
    - base_price: Harga modal murni / Harga dasar produksi (HPP)
    - urgency_score: Skala 0.0 sampai 1.0. 
      (0.0 = Barang sangat segar baru lolos QC, 1.0 = Barang harus segera laku/stok lama)
    """
    
    #Menentukan Margin Minimal (Batas Bawah)
    # Default margin perusahaan adalah 15% dari modal (0.15)
    default_min_margin = 0.15
    
    # Jika urgensi tinggi (misal karena masa simpan buah berkurang), 
    # izinkan AI memotong margin minimal sampai tersisa 5% saja (0.05).
    # Rumus: margin dikurangi sesuai porsi urgensi
    dynamic_margin = max(0.05, default_min_margin - (0.10 * urgency_score))
    
    floor = base_price * (1.0 + dynamic_margin)
    
    # Menentukan Harga Tawaran Awal (Opening Counter)
    # Saat AI harus menolak harga murah, AI akan melempar harga tawaran ini.
    # Kita set margin awal di 40% di atas modal.
    opening_counter = base_price * 1.40
    
    return PricePolicy(
        product_name=product_name,
        base_price=base_price,
        floor_price=floor,
        opening_counter_price=opening_counter
    )