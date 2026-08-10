from distance import get_distance_matrix
from time_windows import generate_all_time_windows
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_logistics(lokasi_list, num_vehicles, vehicle_capacities):

    distance_matrix = get_distance_matrix(lokasi_list)
    time_windows = generate_all_time_windows(lokasi_list)
    demands = [loc.get('demand', 0) for loc in lokasi_list]
    depot = 0
    
    #Inisialisasi Manager & Routing Model
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), num_vehicles, depot)
    routing = pywrapcp.RoutingModel(manager)

    #Callback Waktu Tempuh (Menggunakan matriks OSRM)
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    #Dimensi Kapasitas (Kendaraan tidak boleh overload)
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        vehicle_capacities,
        True,  # start cumul to zero
        'Capacity')

    #Dimensi Waktu (Harus tiba sebelum buah busuk)
    routing.AddDimension(
        transit_callback_index,
        30,   # Waktu tunggu yang diizinkan (30 menit)
        480,  # Waktu operasional maksimal kendaraan (8 jam)
        False, 
        'Time')
    
    time_dimension = routing.GetDimensionOrDie('Time')
    for location_idx, time_window in enumerate(time_windows):
        if location_idx == depot:
            continue
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])

    #PENALTY / DISJUNCTION (Logika Drop Toko)
    #Jika rute mustahil, OR-Tools diizinkan men-drop toko.
    #Toko yang urgency-nya tinggi memiliki denda yang sangat mahal, sehingga akan diprioritaskan.
    penalty_base = 10000
    for node in range(1, len(lokasi_list)):
        urgency = lokasi_list[node].get('urgency', 0.0)
        # Urgency 1.0 (sangat mendesak) akan memiliki penalty = 60000
        # Urgency 0.0 (santai) akan memiliki penalty = 10000
        penalty_score = int(penalty_base + (urgency * 50000))
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty_score)

    # 7. Parameter Pencarian AI (Solver)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    # Kita nyalakan metaheuristic agar solver mencari kemungkinan yang lebih rumit
    search_parameters.local_search_metaheuristic = (routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.seconds = 5 # Beri waktu solver berpikir 5 detik

    # 8. Eksekusi
    print("[INFO] Solver OR-Tools sedang mengalkulasi rute...")
    solution = routing.SolveWithParameters(search_parameters)

    # 9. Parsing Hasil menjadi JSON/Dictionary untuk API Backend
    if solution:
        return parse_solution(manager, routing, solution, lokasi_list, time_dimension, demands, num_vehicles)
    else:
        return {"status": "Gagal", "pesan": "Tidak ada solusi rute yang ditemukan (semua parameter melanggar batas)."}

def parse_solution(manager, routing, solution, lokasi_list, time_dimension, demands, num_vehicles):
    """Menerjemahkan output mentah OR-Tools menjadi dictionary terstruktur (siap jadi response API)."""
    hasil = {
        "status": "Sukses", 
        "total_waktu_menit": 0, 
        "total_muatan": 0, 
        "toko_di_drop": [],
        "rute_kendaraan": []
    }
    
    # Deteksi toko mana yang terpaksa dibuang/di-drop oleh AI
    for node in range(1, len(lokasi_list)):
        if solution.Value(routing.NextVar(manager.NodeToIndex(node))) == manager.NodeToIndex(node):
            hasil["toko_di_drop"].append(lokasi_list[node]["nama"])

    # Ekstrak jadwal untuk setiap truk
    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)
        rute_detail = []
        route_load = 0
        route_time = 0
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            time_var = time_dimension.CumulVar(index)
            
            rute_detail.append({
                "lokasi": lokasi_list[node_index]["nama"],
                "tiba_menit_ke": solution.Min(time_var),
                "muatan_bawaan": route_load
            })
            
            route_load += demands[node_index]
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_time += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
            
        node_index = manager.IndexToNode(index)
        time_var = time_dimension.CumulVar(index)
        rute_detail.append({
            "lokasi": lokasi_list[node_index]["nama"] + " (Kembali)",
            "tiba_menit_ke": solution.Min(time_var),
            "muatan_akhir": route_load
        })
        
        # Hanya masukkan kendaraan yang benar-benar dipakai
        if route_load > 0 or len(rute_detail) > 2:
            hasil["rute_kendaraan"].append({
                "id_kendaraan": vehicle_id + 1,
                "detail_rute": rute_detail,
                "waktu_tempuh_kendaraan": route_time,
                "total_muatan": route_load
            })
            
        hasil["total_waktu_menit"] += route_time
        hasil["total_muatan"] += route_load
        
    return hasil