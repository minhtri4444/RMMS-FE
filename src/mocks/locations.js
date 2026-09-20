// 22 Hospital Reference Locations for single-floor ground-level service area
export const HOSPITAL_LOCATIONS = [
  { id: 'LOC-01', name: 'Pharmacy Warehouse', type: 'WAREHOUSE', coords: [10.7760, 106.7000], description: 'Main pharmaceutical storage and dispensing' },
  { id: 'LOC-02', name: 'Laboratory', type: 'DIAGNOSTIC', coords: [10.7770, 106.7002], description: 'Central clinical analysis & pathology lab' },
  { id: 'LOC-03', name: 'Central Supply Warehouse', type: 'WAREHOUSE', coords: [10.7780, 106.7001], description: 'Sterile surgical and ward medical supplies' },
  { id: 'LOC-04', name: 'Emergency Department', type: 'CLINICAL', coords: [10.7755, 106.7015], description: 'Emergency trauma and acute admissions' },
  { id: 'LOC-05', name: 'Internal Medicine A', type: 'CLINICAL', coords: [10.7765, 106.7018], description: 'Inpatient ward A' },
  { id: 'LOC-06', name: 'Internal Medicine B', type: 'CLINICAL', coords: [10.7775, 106.7018], description: 'Inpatient ward B' },
  { id: 'LOC-07', name: 'Pediatrics', type: 'CLINICAL', coords: [10.7785, 106.7015], description: 'Pediatric care unit' },
  { id: 'LOC-08', name: 'Nutrition Kitchen', type: 'FACILITY', coords: [10.7750, 106.7028], description: 'Dietary meal prep & cart staging' },
  { id: 'LOC-09', name: 'Linen Store', type: 'FACILITY', coords: [10.7790, 106.7028], description: 'Clean linen and laundry dispatch' },
  { id: 'LOC-10', name: 'Nursing Desk 1', type: 'NURSING', coords: [10.7762, 106.7032], description: 'Central nursing station Wing East' },
  { id: 'LOC-11', name: 'Nursing Desk 2', type: 'NURSING', coords: [10.7778, 106.7032], description: 'Central nursing station Wing West' },
  { id: 'LOC-12', name: 'Charging Station 1', type: 'CHARGER', coords: [10.7752, 106.7005], description: 'High-speed inductive dock 1' },
  { id: 'LOC-13', name: 'Charging Station 2', type: 'CHARGER', coords: [10.7772, 106.7008], description: 'Standard dock 2' },
  { id: 'LOC-14', name: 'Charging Station 3', type: 'CHARGER', coords: [10.7788, 106.7006], description: 'Standard dock 3' },
  { id: 'LOC-15', name: 'Waiting Area', type: 'PUBLIC', coords: [10.7770, 106.7025], description: 'Main public reception & family lounge' },
  { id: 'LOC-16', name: 'Corridor Node Alpha', type: 'TRANSIT', coords: [10.7758, 106.7010], description: 'South transit corridor' },
  { id: 'LOC-17', name: 'Corridor Node Bravo', type: 'TRANSIT', coords: [10.7768, 106.7010], description: 'Central transit spine' },
  { id: 'LOC-18', name: 'Corridor Node Charlie', type: 'TRANSIT', coords: [10.7778, 106.7010], description: 'North transit spine' },
  { id: 'LOC-19', name: 'Corridor Node Delta', type: 'TRANSIT', coords: [10.7768, 106.7020], description: 'East cross-junction' },
  { id: 'LOC-20', name: 'Corridor Node Echo', type: 'TRANSIT', coords: [10.7758, 106.7020], description: 'Southeast junction' },
  { id: 'LOC-21', name: 'Corridor Node Foxtrot', type: 'TRANSIT', coords: [10.7778, 106.7020], description: 'Northeast junction' },
  { id: 'LOC-22', name: 'Elevator Lobby Service', type: 'TRANSIT', coords: [10.7770, 106.7015], description: 'Service elevator staging hub' },
]

export function getLocationById(id) {
  return HOSPITAL_LOCATIONS.find(loc => loc.id === id || loc.name === id)
}
