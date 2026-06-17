/**
 * Gridlock Deployment Planner Engine
 * Evaluates traffic parameters and generates officer requirements,
 * barricade placements, and equipment deployment recommendations.
 */

export const planner = {
  /**
   * Generates a deployment and mitigation plan based on active filters
   * @param {Object} filters - { cause, corridor, zone, junction, veh_type, hour, day }
   */
  generate_plan(filters) {
    const { 
      cause = 'accident', 
      corridor = 'Hwy 101 Corridor', 
      zone = 'Downtown Core', 
      junction = 'SilkBoardJunc', 
      veh_type = 'private_car', 
      hour = 12, 
      day = 3 
    } = filters;

    // Rule-based logic modeled after smart traffic operations control parameters
    let officersNeeded = 2;
    let barricadesCount = 4;
    let equipment = [
      { name: 'Traffic Cones', count: 12 },
      { name: 'Reflective Vests', count: 4 },
      { name: 'Diversion Signs', count: 2 }
    ];
    let severity = 'Low';
    let durationMins = 15;
    let closureProbability = 5;

    // Is it a peak hour? (07:00 - 10:00 or 17:00 - 20:00)
    const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1] || 'Wednesday';

    if (cause === 'accident') {
      severity = isPeak ? 'Critical' : 'High';
      officersNeeded = isPeak ? 8 : 5;
      barricadesCount = isPeak ? 10 : 6;
      durationMins = isPeak ? 75 : 45;
      closureProbability = isPeak ? 85 : 55;
      equipment = [
        { name: 'LED Cones', count: 20 },
        { name: 'Reflective Vests', count: 8 },
        { name: 'Flashing Barriers', count: 6 },
        { name: 'Tow Truck', count: 1 },
        { name: 'Flares', count: 10 }
      ];
    } else if (cause === 'construction') {
      severity = 'Moderate';
      officersNeeded = isPeak ? 4 : 2;
      barricadesCount = isPeak ? 15 : 10;
      durationMins = isPeak ? 120 : 90;
      closureProbability = 30;
      equipment = [
        { name: 'Standard Cones', count: 30 },
        { name: 'Diversion Signs', count: 6 },
        { name: 'Concrete Barriers', count: 10 },
        { name: 'Warning Beacons', count: 4 }
      ];
    } else if (cause === 'water_logging') {
      severity = isPeak ? 'Critical' : 'High';
      officersNeeded = isPeak ? 10 : 6;
      barricadesCount = isPeak ? 12 : 8;
      durationMins = isPeak ? 140 : 90;
      closureProbability = isPeak ? 90 : 70;
      equipment = [
        { name: 'High-Capacity Pumps', count: 2 },
        { name: 'Road Closed Signs', count: 4 },
        { name: 'Barricades', count: 10 },
        { name: 'Hazard Tapes', count: 2 }
      ];
    } else if (cause === 'vip_movement' || cause === 'procession' || cause === 'public_event') {
      severity = isPeak ? 'High' : 'Moderate';
      officersNeeded = isPeak ? 12 : 6;
      barricadesCount = isPeak ? 20 : 12;
      durationMins = isPeak ? 60 : 35;
      closureProbability = isPeak ? 75 : 40;
      equipment = [
        { name: 'Steel Crowd Fences', count: 30 },
        { name: 'Megaphones', count: 4 },
        { name: 'Directional Boards', count: 8 },
        { name: 'Cones', count: 15 }
      ];
    } else if (cause === 'vehicle_breakdown') {
      severity = isPeak ? 'Moderate' : 'Low';
      officersNeeded = isPeak ? 3 : 2;
      barricadesCount = isPeak ? 4 : 2;
      durationMins = isPeak ? 35 : 20;
      closureProbability = 15;
      equipment = [
        { name: 'Cones', count: 10 },
        { name: 'Heavy Tow Truck', count: 1 },
        { name: 'Vests', count: 3 }
      ];
    } else if (cause === 'pot_holes' || cause === 'road_conditions') {
      severity = 'Low';
      officersNeeded = 1;
      barricadesCount = 3;
      durationMins = 30;
      closureProbability = 10;
      equipment = [
        { name: 'Cones', count: 6 },
        { name: 'Slow Down Signs', count: 2 },
        { name: 'Cold-Mix Asphalt Bags', count: 5 }
      ];
    } else {
      // standard congestion or others
      severity = isPeak ? 'Moderate' : 'Low';
      officersNeeded = isPeak ? 3 : 1;
      barricadesCount = isPeak ? 6 : 2;
      durationMins = isPeak ? 40 : 15;
      closureProbability = isPeak ? 20 : 5;
      equipment = [
        { name: 'Traffic Cones', count: 10 },
        { name: 'Vests', count: 2 }
      ];
    }

    // Heavy vehicles increase severity, handling complexity, and duration
    if (veh_type === 'heavy_vehicle' || veh_type === 'truck') {
      officersNeeded += 2;
      durationMins = Math.round(durationMins * 1.35);
      closureProbability = Math.min(100, Math.round(closureProbability * 1.2));
      equipment.push({ name: 'Heavy Recovery Winch', count: 1 });
    }

    // Weekends (Saturday [6], Sunday [7]) have slightly less demand for regular commuters but higher event loads
    const isWeekend = day === 6 || day === 7;
    if (isWeekend && (cause === 'public_event' || cause === 'procession')) {
      officersNeeded = Math.round(officersNeeded * 1.25);
      barricadesCount = Math.round(barricadesCount * 1.2);
    } else if (isWeekend) {
      officersNeeded = Math.max(1, Math.round(officersNeeded * 0.7));
    }

    return {
      severity,
      durationMins,
      closureProbability,
      officersNeeded,
      barricadesCount,
      equipment,
      dayName,
      recommendedDiversion: `Alternative bypass routes active around ${junction || 'target junction'} via ${corridor || 'corridor'}.`,
      etaResponders: isPeak ? '12 - 15 mins' : '6 - 9 mins'
    };
  }
};
