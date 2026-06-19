# Junction Database for Bangalore Route Diversions
# Contains key junctions, their coordinates, and candidate bypass routes

JUNCTION_DATABASE = {
    "SilkBoardJunc": {
        "name": "Central Silk Board Junction",
        "latitude": 12.9176,
        "longitude": 77.6244,
        "alternatives": [
            {
                "route": "HSR Layout 14th Main Bypass", 
                "distance_km": 3.2, "base_time_mins": 10, "historical_congestion_factor": 1.2,
                "waypoints": [[12.9215, 77.6244], [12.9140, 77.6320], [12.9110, 77.6400]]
            },
            {
                "route": "BTM Layout Ring Road Link", 
                "distance_km": 4.1, "base_time_mins": 12, "historical_congestion_factor": 1.5,
                "waypoints": [[12.9176, 77.6200], [12.9165, 77.6105], [12.9130, 77.6050]]
            },
            {
                "route": "Madiwala Underpass Route", 
                "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.8,
                "waypoints": [[12.9135, 77.6244], [12.9220, 77.6200], [12.9280, 77.6180]]
            }
        ]
    },
    "AdugodiJunc": {
        "name": "Adugodi Junction",
        "latitude": 12.9428,
        "longitude": 77.6078,
        "alternatives": [
            {"route": "Lakkasandra Parallel Road", "distance_km": 2.1, "base_time_mins": 7, "historical_congestion_factor": 1.1,
             "waypoints": [[12.9400, 77.6050], [12.9370, 77.6020], [12.9350, 77.6060]]},
            {"route": "Koramangala 80ft Road Loop", "distance_km": 3.9, "base_time_mins": 11, "historical_congestion_factor": 1.4,
             "waypoints": [[12.9420, 77.6120], [12.9350, 77.6200], [12.9310, 77.6150]]},
            {"route": "Dairy Circle Flyover Link", "distance_km": 3.2, "base_time_mins": 10, "historical_congestion_factor": 1.6,
             "waypoints": [[12.9430, 77.6040], [12.9400, 77.5990], [12.9380, 77.6000]]}
        ]
    },
    "HebbalFlyoverJunc": {
        "name": "Hebbal Flyover Junction",
        "latitude": 13.0359,
        "longitude": 77.5975,
        "alternatives": [
            {"route": "Outer Ring Road East Link", "distance_km": 5.4, "base_time_mins": 14, "historical_congestion_factor": 1.3,
             "waypoints": [[13.0380, 77.6010], [13.0350, 77.6100], [13.0300, 77.6050]]},
            {"route": "RT Nagar Main Road Bypass", "distance_km": 4.2, "base_time_mins": 11, "historical_congestion_factor": 1.5,
             "waypoints": [[13.0330, 77.5950], [13.0280, 77.5900], [13.0250, 77.5950]]},
            {"route": "Sanjay Nagar Inner Lane", "distance_km": 3.5, "base_time_mins": 9, "historical_congestion_factor": 1.2,
             "waypoints": [[13.0340, 77.5940], [13.0300, 77.5880], [13.0320, 77.5850]]}
        ]
    },
    "DairyCircle": {
        "name": "Dairy Circle Junction",
        "latitude": 12.9384,
        "longitude": 77.5996,
        "alternatives": [
            {"route": "Bannerghatta Road Bypass", "distance_km": 2.9, "base_time_mins": 8, "historical_congestion_factor": 1.4,
             "waypoints": [[12.9360, 77.5970], [12.9320, 77.5950], [12.9280, 77.5980]]},
            {"route": "Wilson Garden 10th Cross", "distance_km": 2.4, "base_time_mins": 7, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9400, 77.5960], [12.9430, 77.5920], [12.9460, 77.5950]]},
            {"route": "Nimhans Hospital Link", "distance_km": 1.8, "base_time_mins": 5, "historical_congestion_factor": 1.7,
             "waypoints": [[12.9370, 77.6020], [12.9350, 77.6060], [12.9330, 77.6030]]}
        ]
    },
    "SonyworldJunction": {
        "name": "Sony World Junction Koramangala",
        "latitude": 12.9344,
        "longitude": 77.6288,
        "alternatives": [
            {"route": "Intermediate Ring Road Bypass", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9370, 77.6250], [12.9400, 77.6200], [12.9380, 77.6150]]},
            {"route": "Koramangala 4th Block Inner Link", "distance_km": 2.2, "base_time_mins": 7, "historical_congestion_factor": 1.1,
             "waypoints": [[12.9320, 77.6260], [12.9300, 77.6230], [12.9310, 77.6300]]},
            {"route": "Ejipura Main Road detour", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.5,
             "waypoints": [[12.9360, 77.6310], [12.9390, 77.6350], [12.9420, 77.6320]]}
        ]
    },
    "HopefarmJunction": {
        "name": "Hope Farm Junction Whitefield",
        "latitude": 12.9842,
        "longitude": 77.7511,
        "alternatives": [
            {"route": "Channasandra Main Road Link", "distance_km": 3.8, "base_time_mins": 11, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9860, 77.7480], [12.9880, 77.7430], [12.9900, 77.7470]]},
            {"route": "ITPL Back Gate Bypass", "distance_km": 2.5, "base_time_mins": 8, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9830, 77.7540], [12.9810, 77.7580], [12.9790, 77.7550]]},
            {"route": "Kadugodi Railway Station Loop", "distance_km": 4.7, "base_time_mins": 15, "historical_congestion_factor": 1.6,
             "waypoints": [[12.9850, 77.7490], [12.9870, 77.7440], [12.9890, 77.7400]]}
        ]
    },
    "TrinityCircle": {
        "name": "Trinity Circle",
        "latitude": 12.9731,
        "longitude": 77.6174,
        "alternatives": [
            {"route": "Ulsoor Lake Outer Ring detour", "distance_km": 3.4, "base_time_mins": 10, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9750, 77.6200], [12.9770, 77.6250], [12.9760, 77.6300]]},
            {"route": "MG Road Underpass Bypass", "distance_km": 1.9, "base_time_mins": 6, "historical_congestion_factor": 1.6,
             "waypoints": [[12.9720, 77.6150], [12.9710, 77.6100], [12.9730, 77.6060]]},
            {"route": "Halasuru Bazaar Corridor", "distance_km": 2.8, "base_time_mins": 9, "historical_congestion_factor": 1.4,
             "waypoints": [[12.9740, 77.6190], [12.9760, 77.6230], [12.9780, 77.6200]]}
        ]
    },
    "AgaraJunction": {
        "name": "Agara Junction",
        "latitude": 12.9237,
        "longitude": 77.6497,
        "alternatives": [
            {"route": "HSR Sector 1 Main Loop", "distance_km": 2.7, "base_time_mins": 8, "historical_congestion_factor": 1.1,
             "waypoints": [[12.9220, 77.6470], [12.9200, 77.6440], [12.9210, 77.6410]]},
            {"route": "Ibblur Lake Side Road", "distance_km": 3.3, "base_time_mins": 10, "historical_congestion_factor": 1.4,
             "waypoints": [[12.9250, 77.6520], [12.9260, 77.6560], [12.9240, 77.6590]]},
            {"route": "Bellandur ORR Flyover detour", "distance_km": 4.6, "base_time_mins": 13, "historical_congestion_factor": 1.7,
             "waypoints": [[12.9230, 77.6530], [12.9210, 77.6580], [12.9190, 77.6620]]}
        ]
    },
    "MekhriCircle": {
        "name": "Mekhri Circle",
        "latitude": 12.9984,
        "longitude": 77.5922,
        "alternatives": [
            {"route": "Jayachamaraja Road Loop", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9970, 77.5900], [12.9950, 77.5870], [12.9960, 77.5840]]},
            {"route": "Sadashivanagar Tunnel route", "distance_km": 2.2, "base_time_mins": 7, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9990, 77.5950], [13.0010, 77.5980], [13.0030, 77.5960]]},
            {"route": "Hebbal Service Road detour", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.5,
             "waypoints": [[13.0000, 77.5940], [13.0050, 77.5960], [13.0100, 77.5950]]}
        ]
    },
    "KoramangalaWaterTankJunc": {
        "name": "Koramangala Water Tank Junction",
        "latitude": 12.9261,
        "longitude": 77.6221,
        "alternatives": [
            {"route": "Koramangala 1st Block Loop", "distance_km": 2.0, "base_time_mins": 6, "historical_congestion_factor": 1.1,
             "waypoints": [[12.9250, 77.6200], [12.9230, 77.6180], [12.9240, 77.6150]]},
            {"route": "Sarjapur Road Corridor", "distance_km": 3.5, "base_time_mins": 10, "historical_congestion_factor": 1.5,
             "waypoints": [[12.9270, 77.6250], [12.9280, 77.6290], [12.9260, 77.6320]]},
            {"route": "Jakkasandra Inner Ring Loop", "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9260, 77.6190], [12.9280, 77.6160], [12.9300, 77.6190]]}
        ]
    },
    "YeshwanthpuraCircle": {
        "name": "Yeshwanthpur Circle",
        "latitude": 13.0227,
        "longitude": 77.5532,
        "alternatives": [
            {"route": "Malleshwaram 18th Cross detour", "distance_km": 3.3, "base_time_mins": 10, "historical_congestion_factor": 1.3,
             "waypoints": [[13.0210, 77.5510], [13.0190, 77.5480], [13.0170, 77.5510]]},
            {"route": "Toll Gate Road Loop", "distance_km": 4.2, "base_time_mins": 12, "historical_congestion_factor": 1.4,
             "waypoints": [[13.0240, 77.5560], [13.0260, 77.5590], [13.0280, 77.5570]]},
            {"route": "Mathikere Main Road Bypass", "distance_km": 2.6, "base_time_mins": 8, "historical_congestion_factor": 1.2,
             "waypoints": [[13.0220, 77.5500], [13.0200, 77.5470], [13.0180, 77.5500]]}
        ]
    },
    "TownhallJunction": {
        "name": "Town Hall Junction",
        "latitude": 12.9632,
        "longitude": 77.5843,
        "alternatives": [
            {"route": "Hudson Circle Link", "distance_km": 1.5, "base_time_mins": 5, "historical_congestion_factor": 1.6,
             "waypoints": [[12.9620, 77.5820], [12.9610, 77.5790], [12.9620, 77.5760]]},
            {"route": "JC Road Underground route", "distance_km": 2.4, "base_time_mins": 8, "historical_congestion_factor": 1.5,
             "waypoints": [[12.9640, 77.5870], [12.9660, 77.5900], [12.9650, 77.5930]]},
            {"route": "Kalasipalyam Main Road detour", "distance_km": 3.1, "base_time_mins": 10, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9630, 77.5810], [12.9650, 77.5780], [12.9670, 77.5800]]}
        ]
    },
    "GoruguntepalyaJunc": {
        "name": "Goruguntepalya Junction",
        "latitude": 13.0284,
        "longitude": 77.5409,
        "alternatives": [
            {"route": "Ring Road West Link", "distance_km": 4.9, "base_time_mins": 14, "historical_congestion_factor": 1.2,
             "waypoints": [[13.0300, 77.5430], [13.0320, 77.5460], [13.0340, 77.5440]]},
            {"route": "Peenya Industrial Area detour", "distance_km": 3.6, "base_time_mins": 11, "historical_congestion_factor": 1.4,
             "waypoints": [[13.0270, 77.5390], [13.0250, 77.5360], [13.0260, 77.5330]]},
            {"route": "Jalahalli Main Road Bypass", "distance_km": 3.1, "base_time_mins": 9, "historical_congestion_factor": 1.3,
             "waypoints": [[13.0290, 77.5380], [13.0310, 77.5350], [13.0330, 77.5370]]}
        ]
    },
    "RichmondCircle": {
        "name": "Richmond Circle",
        "latitude": 12.9602,
        "longitude": 77.5982,
        "alternatives": [
            {"route": "Double Road Flyover detour", "distance_km": 2.8, "base_time_mins": 8, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9590, 77.5960], [12.9570, 77.5930], [12.9580, 77.5900]]},
            {"route": "Langford Road Inner Loop", "distance_km": 2.1, "base_time_mins": 6, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9610, 77.6010], [12.9630, 77.6040], [12.9620, 77.6070]]},
            {"route": "Residency Road Corridor", "distance_km": 3.4, "base_time_mins": 10, "historical_congestion_factor": 1.6,
             "waypoints": [[12.9600, 77.5950], [12.9620, 77.5920], [12.9640, 77.5940]]}
        ]
    },
    "Unknown": {
        "name": "Default General Junction",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "alternatives": [
            {"route": "Inner Ring Road Loop", "distance_km": 3.0, "base_time_mins": 9, "historical_congestion_factor": 1.2,
             "waypoints": [[12.9700, 77.5920], [12.9680, 77.5890], [12.9690, 77.5860]]},
            {"route": "Outer Bypass link", "distance_km": 4.5, "base_time_mins": 13, "historical_congestion_factor": 1.3,
             "waypoints": [[12.9730, 77.5970], [12.9750, 77.6000], [12.9740, 77.6030]]},
            {"route": "Primary Corridor alternate lane", "distance_km": 2.5, "base_time_mins": 8, "historical_congestion_factor": 1.4,
             "waypoints": [[12.9710, 77.5930], [12.9720, 77.5900], [12.9730, 77.5920]]}
        ]
    }
}
