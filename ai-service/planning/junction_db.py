# Junction Database for Bangalore Route Diversions
# Contains key junctions, their coordinates, and candidate bypass routes

JUNCTION_DATABASE = {
    "SilkBoardJunc": {
        "name": "Central Silk Board Junction",
        "latitude": 12.9176,
        "longitude": 77.6244,
        "alternatives": [
            {"route": "HSR Layout 14th Main Bypass", "distance_km": 3.2, "base_time_mins": 10, "historical_congestion_factor": 1.2},
            {"route": "BTM Layout Ring Road Link", "distance_km": 4.1, "base_time_mins": 12, "historical_congestion_factor": 1.5},
            {"route": "Madiwala Underpass Route", "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.8}
        ]
    },
    "AdugodiJunc": {
        "name": "Adugodi Junction",
        "latitude": 12.9428,
        "longitude": 77.6078,
        "alternatives": [
            {"route": "Lakkasandra Parallel Road", "distance_km": 2.1, "base_time_mins": 7, "historical_congestion_factor": 1.1},
            {"route": "Koramangala 80ft Road Loop", "distance_km": 3.9, "base_time_mins": 11, "historical_congestion_factor": 1.4},
            {"route": "Dairy Circle Flyover Link", "distance_km": 3.2, "base_time_mins": 10, "historical_congestion_factor": 1.6}
        ]
    },
    "HebbalFlyoverJunc": {
        "name": "Hebbal Flyover Junction",
        "latitude": 13.0359,
        "longitude": 77.5975,
        "alternatives": [
            {"route": "Outer Ring Road East Link", "distance_km": 5.4, "base_time_mins": 14, "historical_congestion_factor": 1.3},
            {"route": "RT Nagar Main Road Bypass", "distance_km": 4.2, "base_time_mins": 11, "historical_congestion_factor": 1.5},
            {"route": "Sanjay Nagar Inner Lane", "distance_km": 3.5, "base_time_mins": 9, "historical_congestion_factor": 1.2}
        ]
    },
    "DairyCircle": {
        "name": "Dairy Circle Junction",
        "latitude": 12.9384,
        "longitude": 77.5996,
        "alternatives": [
            {"route": "Bannerghatta Road Bypass", "distance_km": 2.9, "base_time_mins": 8, "historical_congestion_factor": 1.4},
            {"route": "Wilson Garden 10th Cross", "distance_km": 2.4, "base_time_mins": 7, "historical_congestion_factor": 1.2},
            {"route": "Nimhans Hospital Link", "distance_km": 1.8, "base_time_mins": 5, "historical_congestion_factor": 1.7}
        ]
    },
    "SonyworldJunction": {
        "name": "Sony World Junction Koramangala",
        "latitude": 12.9344,
        "longitude": 77.6288,
        "alternatives": [
            {"route": "Intermediate Ring Road Bypass", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.2},
            {"route": "Koramangala 4th Block Inner Link", "distance_km": 2.2, "base_time_mins": 7, "historical_congestion_factor": 1.1},
            {"route": "Ejipura Main Road detour", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.5}
        ]
    },
    "HopefarmJunction": {
        "name": "Hope Farm Junction Whitefield",
        "latitude": 12.9842,
        "longitude": 77.7511,
        "alternatives": [
            {"route": "Channasandra Main Road Link", "distance_km": 3.8, "base_time_mins": 11, "historical_congestion_factor": 1.3},
            {"route": "ITPL Back Gate Bypass", "distance_km": 2.5, "base_time_mins": 8, "historical_congestion_factor": 1.2},
            {"route": "Kadugodi Railway Station Loop", "distance_km": 4.7, "base_time_mins": 15, "historical_congestion_factor": 1.6}
        ]
    },
    "TrinityCircle": {
        "name": "Trinity Circle",
        "latitude": 12.9731,
        "longitude": 77.6174,
        "alternatives": [
            {"route": "Ulsoor Lake Outer Ring detour", "distance_km": 3.4, "base_time_mins": 10, "historical_congestion_factor": 1.2},
            {"route": "MG Road Underpass Bypass", "distance_km": 1.9, "base_time_mins": 6, "historical_congestion_factor": 1.6},
            {"route": "Halasuru Bazaar Corridor", "distance_km": 2.8, "base_time_mins": 9, "historical_congestion_factor": 1.4}
        ]
    },
    "AgaraJunction": {
        "name": "Agara Junction",
        "latitude": 12.9237,
        "longitude": 77.6497,
        "alternatives": [
            {"route": "HSR Sector 1 Main Loop", "distance_km": 2.7, "base_time_mins": 8, "historical_congestion_factor": 1.1},
            {"route": "Ibblur Lake Side Road", "distance_km": 3.3, "base_time_mins": 10, "historical_congestion_factor": 1.4},
            {"route": "Bellandur ORR Flyover detour", "distance_km": 4.6, "base_time_mins": 13, "historical_congestion_factor": 1.7}
        ]
    },
    "MekhriCircle": {
        "name": "Mekhri Circle",
        "latitude": 12.9984,
        "longitude": 77.5922,
        "alternatives": [
            {"route": "Jayachamaraja Road Loop", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.2},
            {"route": "Sadashivanagar Tunnel route", "distance_km": 2.2, "base_time_mins": 7, "historical_congestion_factor": 1.3},
            {"route": "Hebbal Service Road detour", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.5}
        ]
    },
    "KoramangalaWaterTankJunc": {
        "name": "Koramangala Water Tank Junction",
        "latitude": 12.9261,
        "longitude": 77.6221,
        "alternatives": [
            {"route": "Koramangala 1st Block Loop", "distance_km": 2.0, "base_time_mins": 6, "historical_congestion_factor": 1.1},
            {"route": "Sarjapur Road Corridor", "distance_km": 3.5, "base_time_mins": 10, "historical_congestion_factor": 1.5},
            {"route": "Jakkasandra Inner Ring Loop", "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.3}
        ]
    },
    "YeshwanthpuraCircle": {
        "name": "Yeshwanthpur Circle",
        "latitude": 13.0227,
        "longitude": 77.5532,
        "alternatives": [
            {"route": "Malleshwaram 18th Cross detour", "distance_km": 3.3, "base_time_mins": 10, "historical_congestion_factor": 1.3},
            {"route": "Toll Gate Road Loop", "distance_km": 4.2, "base_time_mins": 12, "historical_congestion_factor": 1.4},
            {"route": "Mathikere Main Road Bypass", "distance_km": 2.6, "base_time_mins": 8, "historical_congestion_factor": 1.2}
        ]
    },
    "TownhallJunction": {
        "name": "Town Hall Junction",
        "latitude": 12.9632,
        "longitude": 77.5843,
        "alternatives": [
            {"route": "Hudson Circle Link", "distance_km": 1.5, "base_time_mins": 5, "historical_congestion_factor": 1.6},
            {"route": "JC Road Underground route", "distance_km": 2.4, "base_time_mins": 8, "historical_congestion_factor": 1.5},
            {"route": "Kalasipalyam Main Road detour", "distance_km": 3.1, "base_time_mins": 10, "historical_congestion_factor": 1.3}
        ]
    },
    "GoruguntepalyaJunc": {
        "name": "Goruguntepalya Junction",
        "latitude": 13.0284,
        "longitude": 77.5409,
        "alternatives": [
            {"route": "Ring Road West Link", "distance_km": 4.9, "base_time_mins": 14, "historical_congestion_factor": 1.2},
            {"route": "Peenya Industrial Area detour", "distance_km": 3.6, "base_time_mins": 11, "historical_congestion_factor": 1.4},
            {"route": "Jalahalli Main Road Bypass", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.3}
        ]
    },
    "RichmondCircle": {
        "name": "Richmond Circle",
        "latitude": 12.9602,
        "longitude": 77.5982,
        "alternatives": [
            {"route": "Double Road Flyover detour", "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.3},
            {"route": "Langford Road Inner Loop", "distance_km": 2.1, "base_time_mins": 6, "historical_congestion_factor": 1.2},
            {"route": "Residency Road Corridor", "distance_km": 3.4, "base_time_mins": 10, "historical_congestion_factor": 1.6}
        ]
    },
    "Unknown": {
        "name": "Default General Junction",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "alternatives": [
            {"route": "Inner Ring Road Loop", "distance_km": 3.0, "base_time_mins": 9, "historical_congestion_factor": 1.2},
            {"route": "Outer Bypass link", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.3},
            {"route": "Primary Corridor alternate lane", "distance_km": 2.5, "base_time_mins": 8, "historical_congestion_factor": 1.4}
        ]
    }
}
