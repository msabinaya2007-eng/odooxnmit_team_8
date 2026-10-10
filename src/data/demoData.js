/**
 * DEMO DATA — LoomFlow
 * --------------------------------------------------------------------------
 * Every record in this file is fictional sample data for demonstration only.
 * No database is connected yet. Replace these arrays with API calls later.
 */

export const DEMO_TODAY = '2026-10-10'

export const orders = [
  { id: 'ORD-1048', customer: 'Demo Apparel Co.', product: 'Oxford Shirting', fabric: 'Cotton 40s', quantity: 12000, unit: 'm', orderDate: '2026-09-22', dueDate: '2026-10-18', status: 'In Production', priority: 'High', value: 1680000 },
  { id: 'ORD-1047', customer: 'Sample Home Linens', product: 'Bedsheet Percale', fabric: 'Cotton 60s', quantity: 4500, unit: 'pcs', orderDate: '2026-09-20', dueDate: '2026-10-14', status: 'Quality Check', priority: 'High', value: 1125000 },
  { id: 'ORD-1046', customer: 'Test Denim Works', product: 'Stretch Denim 11oz', fabric: 'Cotton-Lycra', quantity: 8000, unit: 'm', orderDate: '2026-09-18', dueDate: '2026-10-25', status: 'In Production', priority: 'Medium', value: 1520000 },
  { id: 'ORD-1045', customer: 'Placeholder Fashions', product: 'Rayon Printed Kurti', fabric: 'Rayon 30s', quantity: 2400, unit: 'pcs', orderDate: '2026-09-15', dueDate: '2026-10-12', status: 'Ready', priority: 'High', value: 696000 },
  { id: 'ORD-1044', customer: 'Example Uniforms Ltd', product: 'Poly-Cotton Suiting', fabric: 'PC 65/35', quantity: 6000, unit: 'm', orderDate: '2026-09-12', dueDate: '2026-10-08', status: 'Dispatched', priority: 'Medium', value: 1020000 },
  { id: 'ORD-1043', customer: 'Demo Apparel Co.', product: 'Pique Polo T-Shirt', fabric: 'Cotton Pique', quantity: 3000, unit: 'pcs', orderDate: '2026-09-10', dueDate: '2026-10-20', status: 'In Production', priority: 'Low', value: 540000 },
  { id: 'ORD-1042', customer: 'Sample Home Linens', product: 'Terry Towel 500 GSM', fabric: 'Cotton Terry', quantity: 5000, unit: 'pcs', orderDate: '2026-09-08', dueDate: '2026-10-30', status: 'Pending', priority: 'Medium', value: 750000 },
  { id: 'ORD-1041', customer: 'Mock Export House', product: 'Linen Blend Shirting', fabric: 'Linen-Cotton 55/45', quantity: 7000, unit: 'm', orderDate: '2026-09-05', dueDate: '2026-11-05', status: 'Pending', priority: 'High', value: 2310000 },
  { id: 'ORD-1040', customer: 'Test Denim Works', product: 'Rigid Denim 13oz', fabric: 'Cotton 100%', quantity: 5000, unit: 'm', orderDate: '2026-09-01', dueDate: '2026-10-02', status: 'Dispatched', priority: 'Medium', value: 925000 },
  { id: 'ORD-1039', customer: 'Example Uniforms Ltd', product: 'Twill Workwear', fabric: 'Cotton Twill', quantity: 4000, unit: 'm', orderDate: '2026-08-28', dueDate: '2026-10-11', status: 'Quality Check', priority: 'High', value: 640000 },
  { id: 'ORD-1038', customer: 'Placeholder Fashions', product: 'Georgette Dupatta', fabric: 'Poly Georgette', quantity: 1500, unit: 'pcs', orderDate: '2026-08-25', dueDate: '2026-09-30', status: 'Cancelled', priority: 'Low', value: 180000 },
  { id: 'ORD-1037', customer: 'Mock Export House', product: 'Organic Cotton Jersey', fabric: 'Organic 30s', quantity: 9000, unit: 'm', orderDate: '2026-08-20', dueDate: '2026-10-15', status: 'Ready', priority: 'Medium', value: 1350000 },
]

export const materials = [
  { id: 'RM-001', name: 'Cotton Yarn 40s Combed', category: 'Yarn', stock: 2850, unit: 'kg', reorderLevel: 1500, supplier: 'Demo Spinning Mills', unitCost: 310, lastRestocked: '2026-10-02' },
  { id: 'RM-002', name: 'Cotton Yarn 60s Compact', category: 'Yarn', stock: 640, unit: 'kg', reorderLevel: 1000, supplier: 'Demo Spinning Mills', unitCost: 420, lastRestocked: '2026-09-18' },
  { id: 'RM-003', name: 'Polyester Filament 150D', category: 'Yarn', stock: 1900, unit: 'kg', reorderLevel: 800, supplier: 'Sample Synthetics', unitCost: 145, lastRestocked: '2026-09-29' },
  { id: 'RM-004', name: 'Lycra Spandex 40D', category: 'Yarn', stock: 120, unit: 'kg', reorderLevel: 200, supplier: 'Sample Synthetics', unitCost: 890, lastRestocked: '2026-09-10' },
  { id: 'RM-005', name: 'Rayon Viscose 30s', category: 'Yarn', stock: 1100, unit: 'kg', reorderLevel: 600, supplier: 'Test Fibres Pvt', unitCost: 265, lastRestocked: '2026-10-05' },
  { id: 'RM-006', name: 'Indigo Dye Paste', category: 'Dye', stock: 85, unit: 'kg', reorderLevel: 150, supplier: 'Example Colourchem', unitCost: 780, lastRestocked: '2026-09-12' },
  { id: 'RM-007', name: 'Reactive Red ME4BL', category: 'Dye', stock: 210, unit: 'kg', reorderLevel: 100, supplier: 'Example Colourchem', unitCost: 540, lastRestocked: '2026-09-25' },
  { id: 'RM-008', name: 'Reactive Navy HER', category: 'Dye', stock: 160, unit: 'kg', reorderLevel: 100, supplier: 'Example Colourchem', unitCost: 610, lastRestocked: '2026-09-27' },
  { id: 'RM-009', name: 'Soda Ash (Dense)', category: 'Chemical', stock: 900, unit: 'kg', reorderLevel: 500, supplier: 'Mock Chemicals', unitCost: 32, lastRestocked: '2026-10-01' },
  { id: 'RM-010', name: 'Silicone Softener', category: 'Chemical', stock: 140, unit: 'L', reorderLevel: 250, supplier: 'Mock Chemicals', unitCost: 190, lastRestocked: '2026-09-08' },
  { id: 'RM-011', name: 'Greige Fabric 58" Poplin', category: 'Fabric', stock: 14500, unit: 'm', reorderLevel: 8000, supplier: 'Placeholder Weavers', unitCost: 62, lastRestocked: '2026-10-04' },
  { id: 'RM-012', name: 'Polyester Sewing Thread', category: 'Accessory', stock: 380, unit: 'cones', reorderLevel: 500, supplier: 'Demo Trims Co.', unitCost: 85, lastRestocked: '2026-09-15' },
  { id: 'RM-013', name: 'Shirt Buttons 18L', category: 'Accessory', stock: 42000, unit: 'pcs', reorderLevel: 20000, supplier: 'Demo Trims Co.', unitCost: 0.6, lastRestocked: '2026-09-30' },
  { id: 'RM-014', name: 'Woven Labels', category: 'Accessory', stock: 6500, unit: 'pcs', reorderLevel: 10000, supplier: 'Demo Trims Co.', unitCost: 1.2, lastRestocked: '2026-09-02' },
]

export const machines = [
  { id: 'LM-01', name: 'Air-Jet Loom 01', type: 'Loom', line: 'Weaving A', status: 'Running', efficiency: 92, operator: 'R. Kumar', currentJob: 'BT-2201', outputToday: 640 },
  { id: 'LM-02', name: 'Air-Jet Loom 02', type: 'Loom', line: 'Weaving A', status: 'Running', efficiency: 88, operator: 'S. Priya', currentJob: 'BT-2201', outputToday: 590 },
  { id: 'LM-03', name: 'Rapier Loom 03', type: 'Loom', line: 'Weaving A', status: 'Maintenance', efficiency: 0, operator: '—', currentJob: '—', outputToday: 120 },
  { id: 'LM-04', name: 'Rapier Loom 04', type: 'Loom', line: 'Weaving B', status: 'Running', efficiency: 85, operator: 'M. Arjun', currentJob: 'BT-2203', outputToday: 510 },
  { id: 'LM-05', name: 'Water-Jet Loom 05', type: 'Loom', line: 'Weaving B', status: 'Idle', efficiency: 0, operator: 'K. Devi', currentJob: '—', outputToday: 260 },
  { id: 'KN-01', name: 'Circular Knitter 01', type: 'Knitting', line: 'Knitting', status: 'Running', efficiency: 90, operator: 'A. Selvam', currentJob: 'BT-2205', outputToday: 480 },
  { id: 'KN-02', name: 'Circular Knitter 02', type: 'Knitting', line: 'Knitting', status: 'Breakdown', efficiency: 0, operator: 'V. Lakshmi', currentJob: 'BT-2205', outputToday: 95 },
  { id: 'DY-01', name: 'Jet Dyeing 01', type: 'Dyeing', line: 'Wet Processing', status: 'Running', efficiency: 81, operator: 'P. Ganesh', currentJob: 'BT-2202', outputToday: 1100 },
  { id: 'DY-02', name: 'Jigger Dyeing 02', type: 'Dyeing', line: 'Wet Processing', status: 'Running', efficiency: 78, operator: 'N. Ravi', currentJob: 'BT-2204', outputToday: 860 },
  { id: 'ST-01', name: 'Stitching Line 01', type: 'Stitching', line: 'Garments', status: 'Running', efficiency: 87, operator: 'J. Meena', currentJob: 'BT-2206', outputToday: 420 },
  { id: 'ST-02', name: 'Stitching Line 02', type: 'Stitching', line: 'Garments', status: 'Idle', efficiency: 0, operator: 'T. Anitha', currentJob: '—', outputToday: 150 },
  { id: 'FN-01', name: 'Stenter Finisher 01', type: 'Finishing', line: 'Wet Processing', status: 'Running', efficiency: 84, operator: 'B. Mohan', currentJob: 'BT-2202', outputToday: 1350 },
]

export const batches = [
  { id: 'BT-2201', orderId: 'ORD-1048', product: 'Oxford Shirting', stage: 'Weaving', progress: 62, machine: 'LM-01, LM-02', target: 12000, produced: 7440, unit: 'm' },
  { id: 'BT-2202', orderId: 'ORD-1037', product: 'Organic Cotton Jersey', stage: 'Finishing', progress: 94, machine: 'DY-01, FN-01', target: 9000, produced: 8460, unit: 'm' },
  { id: 'BT-2203', orderId: 'ORD-1046', product: 'Stretch Denim 11oz', stage: 'Weaving', progress: 38, machine: 'LM-04', target: 8000, produced: 3040, unit: 'm' },
  { id: 'BT-2204', orderId: 'ORD-1039', product: 'Twill Workwear', stage: 'Dyeing', progress: 81, machine: 'DY-02', target: 4000, produced: 3240, unit: 'm' },
  { id: 'BT-2205', orderId: 'ORD-1043', product: 'Pique Polo T-Shirt', stage: 'Stitching', progress: 47, machine: 'KN-01, ST-01', target: 3000, produced: 1410, unit: 'pcs' },
  { id: 'BT-2206', orderId: 'ORD-1047', product: 'Bedsheet Percale', stage: 'Packing', progress: 98, machine: 'ST-01', target: 4500, produced: 4410, unit: 'pcs' },
]

export const inspections = [
  { id: 'QC-5121', batchId: 'BT-2206', product: 'Bedsheet Percale', inspector: 'L. Saranya', date: '2026-10-10', sampleSize: 200, defects: 0, defectType: '—', result: 'Pending' },
  { id: 'QC-5120', batchId: 'BT-2204', product: 'Twill Workwear', inspector: 'D. Karthik', date: '2026-10-10', sampleSize: 150, defects: 0, defectType: '—', result: 'Pending' },
  { id: 'QC-5119', batchId: 'BT-2202', product: 'Organic Cotton Jersey', inspector: 'L. Saranya', date: '2026-10-09', sampleSize: 250, defects: 0, defectType: '—', result: 'Pending' },
  { id: 'QC-5118', batchId: 'BT-2199', product: 'Rayon Printed Kurti', inspector: 'D. Karthik', date: '2026-10-09', sampleSize: 120, defects: 3, defectType: 'Print misregistration', result: 'Passed' },
  { id: 'QC-5117', batchId: 'BT-2198', product: 'Organic Cotton Jersey', inspector: 'L. Saranya', date: '2026-10-08', sampleSize: 250, defects: 4, defectType: 'Slub', result: 'Passed' },
  { id: 'QC-5116', batchId: 'BT-2197', product: 'Twill Workwear', inspector: 'R. Vignesh', date: '2026-10-08', sampleSize: 150, defects: 14, defectType: 'Shade variation', result: 'Rework' },
  { id: 'QC-5115', batchId: 'BT-2196', product: 'Poly-Cotton Suiting', inspector: 'D. Karthik', date: '2026-10-07', sampleSize: 200, defects: 2, defectType: 'Broken pick', result: 'Passed' },
  { id: 'QC-5114', batchId: 'BT-2195', product: 'Georgette Dupatta', inspector: 'R. Vignesh', date: '2026-10-06', sampleSize: 100, defects: 19, defectType: 'Holes / Snags', result: 'Failed' },
  { id: 'QC-5113', batchId: 'BT-2194', product: 'Rigid Denim 13oz', inspector: 'L. Saranya', date: '2026-10-05', sampleSize: 180, defects: 5, defectType: 'Stain', result: 'Passed' },
  { id: 'QC-5112', batchId: 'BT-2193', product: 'Oxford Shirting', inspector: 'D. Karthik', date: '2026-10-04', sampleSize: 200, defects: 3, defectType: 'Float', result: 'Passed' },
]

export const finishedGoods = [
  { sku: 'FG-SH-OX-WHT', product: 'Oxford Shirting', category: 'Shirting', colour: 'White', quantity: 4200, unit: 'm', warehouse: 'WH-A Coimbatore', bin: 'A-03-2', unitValue: 140 },
  { sku: 'FG-SH-OX-BLU', product: 'Oxford Shirting', category: 'Shirting', colour: 'Sky Blue', quantity: 2600, unit: 'm', warehouse: 'WH-A Coimbatore', bin: 'A-03-4', unitValue: 140 },
  { sku: 'FG-KN-JR-ORG', product: 'Organic Cotton Jersey', category: 'Knitwear', colour: 'Natural', quantity: 8900, unit: 'm', warehouse: 'WH-B Tiruppur', bin: 'B-01-1', unitValue: 150, reservedFor: 'ORD-1037' },
  { sku: 'FG-KN-KR-RAY', product: 'Rayon Printed Kurti', category: 'Knitwear', colour: 'Floral Mix', quantity: 2400, unit: 'pcs', warehouse: 'WH-B Tiruppur', bin: 'B-04-3', unitValue: 290, reservedFor: 'ORD-1045' },
  { sku: 'FG-DN-RG-IND', product: 'Rigid Denim 13oz', category: 'Denim', colour: 'Indigo', quantity: 1800, unit: 'm', warehouse: 'WH-C Erode', bin: 'C-02-1', unitValue: 185 },
  { sku: 'FG-DN-ST-BLK', product: 'Stretch Denim 11oz', category: 'Denim', colour: 'Black', quantity: 950, unit: 'm', warehouse: 'WH-C Erode', bin: 'C-02-3', unitValue: 190 },
  { sku: 'FG-SU-PC-GRY', product: 'Poly-Cotton Suiting', category: 'Suiting', colour: 'Charcoal', quantity: 3100, unit: 'm', warehouse: 'WH-A Coimbatore', bin: 'A-05-1', unitValue: 170 },
  { sku: 'FG-HT-BS-WHT', product: 'Bedsheet Percale', category: 'Home Textile', colour: 'White', quantity: 650, unit: 'pcs', warehouse: 'WH-C Erode', bin: 'C-06-2', unitValue: 250 },
  { sku: 'FG-HT-TW-NVY', product: 'Terry Towel 500 GSM', category: 'Home Textile', colour: 'Navy', quantity: 1200, unit: 'pcs', warehouse: 'WH-C Erode', bin: 'C-07-1', unitValue: 150 },
  { sku: 'FG-SU-TW-KHK', product: 'Twill Workwear', category: 'Suiting', colour: 'Khaki', quantity: 420, unit: 'm', warehouse: 'WH-A Coimbatore', bin: 'A-06-4', unitValue: 160 },
]

export const dispatches = [
  { id: 'DSP-781', orderId: 'ORD-1045', customer: 'Placeholder Fashions', destination: 'Mumbai, MH', carrier: 'Demo Logistics', vehicle: 'TN-38-AB-1234', date: '2026-10-11', packages: 48, status: 'Scheduled' },
  { id: 'DSP-780', orderId: 'ORD-1037', customer: 'Mock Export House', destination: 'Chennai Port, TN', carrier: 'Sample Freight', vehicle: 'TN-66-CX-5521', date: '2026-10-10', packages: 90, status: 'Loading' },
  { id: 'DSP-779', orderId: 'ORD-1044', customer: 'Example Uniforms Ltd', destination: 'Bengaluru, KA', carrier: 'Demo Logistics', vehicle: 'TN-37-BZ-9087', date: '2026-10-08', packages: 60, status: 'In Transit' },
  { id: 'DSP-778', orderId: 'ORD-1040', customer: 'Test Denim Works', destination: 'Ahmedabad, GJ', carrier: 'Test Transport Co.', vehicle: 'GJ-01-TT-4410', date: '2026-10-02', packages: 52, status: 'Delivered' },
  { id: 'DSP-777', orderId: 'ORD-1036', customer: 'Demo Apparel Co.', destination: 'Tiruppur, TN', carrier: 'Sample Freight', vehicle: 'TN-39-AQ-7702', date: '2026-09-28', packages: 35, status: 'Delivered' },
  { id: 'DSP-776', orderId: 'ORD-1035', customer: 'Sample Home Linens', destination: 'Delhi, DL', carrier: 'Test Transport Co.', vehicle: 'DL-1C-ZZ-3001', date: '2026-09-24', packages: 70, status: 'Delivered' },
]

export const workers = [
  { id: 'EMP-101', name: 'R. Kumar', role: 'Loom Operator', department: 'Weaving', shift: 'Morning', status: 'Present', checkIn: '05:52', hoursThisWeek: 46, dailyWage: 780 },
  { id: 'EMP-102', name: 'S. Priya', role: 'Loom Operator', department: 'Weaving', shift: 'Morning', status: 'Present', checkIn: '05:58', hoursThisWeek: 44, dailyWage: 780 },
  { id: 'EMP-103', name: 'M. Arjun', role: 'Senior Weaver', department: 'Weaving', shift: 'Morning', status: 'Late', checkIn: '06:24', hoursThisWeek: 41, dailyWage: 920 },
  { id: 'EMP-104', name: 'K. Devi', role: 'Loom Operator', department: 'Weaving', shift: 'Evening', status: 'Present', checkIn: '13:55', hoursThisWeek: 45, dailyWage: 780 },
  { id: 'EMP-105', name: 'P. Ganesh', role: 'Dyeing Master', department: 'Dyeing', shift: 'Morning', status: 'Present', checkIn: '05:45', hoursThisWeek: 48, dailyWage: 1150 },
  { id: 'EMP-106', name: 'N. Ravi', role: 'Dyeing Assistant', department: 'Dyeing', shift: 'Morning', status: 'Present', checkIn: '05:59', hoursThisWeek: 43, dailyWage: 720 },
  { id: 'EMP-107', name: 'J. Meena', role: 'Tailor', department: 'Stitching', shift: 'Morning', status: 'Present', checkIn: '06:01', hoursThisWeek: 44, dailyWage: 700 },
  { id: 'EMP-108', name: 'T. Anitha', role: 'Tailor', department: 'Stitching', shift: 'Morning', status: 'Absent', checkIn: '—', hoursThisWeek: 32, dailyWage: 700 },
  { id: 'EMP-109', name: 'L. Saranya', role: 'QC Inspector', department: 'Quality', shift: 'Morning', status: 'Present', checkIn: '05:50', hoursThisWeek: 45, dailyWage: 980 },
  { id: 'EMP-110', name: 'D. Karthik', role: 'QC Inspector', department: 'Quality', shift: 'Evening', status: 'Present', checkIn: '13:48', hoursThisWeek: 44, dailyWage: 980 },
  { id: 'EMP-111', name: 'R. Vignesh', role: 'QC Supervisor', department: 'Quality', shift: 'Morning', status: 'On Leave', checkIn: '—', hoursThisWeek: 24, dailyWage: 1250 },
  { id: 'EMP-112', name: 'A. Selvam', role: 'Knitting Operator', department: 'Weaving', shift: 'Night', status: 'Present', checkIn: '21:56', hoursThisWeek: 47, dailyWage: 800 },
  { id: 'EMP-113', name: 'V. Lakshmi', role: 'Knitting Operator', department: 'Weaving', shift: 'Night', status: 'Late', checkIn: '22:18', hoursThisWeek: 40, dailyWage: 800 },
  { id: 'EMP-114', name: 'B. Mohan', role: 'Stenter Operator', department: 'Dyeing', shift: 'Evening', status: 'Present', checkIn: '13:52', hoursThisWeek: 46, dailyWage: 850 },
  { id: 'EMP-115', name: 'S. Bala', role: 'Store Keeper', department: 'Warehouse', shift: 'Morning', status: 'Present', checkIn: '08:55', hoursThisWeek: 42, dailyWage: 760 },
  { id: 'EMP-116', name: 'C. Rajesh', role: 'Fitter', department: 'Maintenance', shift: 'Morning', status: 'Present', checkIn: '05:57', hoursThisWeek: 49, dailyWage: 950 },
]

export const invoices = [
  { id: 'INV-3309', customer: 'Example Uniforms Ltd', orderId: 'ORD-1044', amount: 1020000, issued: '2026-10-08', due: '2026-11-07', status: 'Unpaid' },
  { id: 'INV-3308', customer: 'Test Denim Works', orderId: 'ORD-1040', amount: 925000, issued: '2026-10-02', due: '2026-11-01', status: 'Paid' },
  { id: 'INV-3307', customer: 'Demo Apparel Co.', orderId: 'ORD-1036', amount: 760000, issued: '2026-09-28', due: '2026-10-28', status: 'Unpaid' },
  { id: 'INV-3306', customer: 'Sample Home Linens', orderId: 'ORD-1035', amount: 1180000, issued: '2026-09-24', due: '2026-10-09', status: 'Overdue' },
  { id: 'INV-3305', customer: 'Mock Export House', orderId: 'ORD-1034', amount: 1640000, issued: '2026-09-15', due: '2026-10-15', status: 'Paid' },
  { id: 'INV-3304', customer: 'Placeholder Fashions', orderId: 'ORD-1033', amount: 430000, issued: '2026-09-05', due: '2026-10-05', status: 'Overdue' },
  { id: 'INV-3303', customer: 'Demo Apparel Co.', orderId: 'ORD-1032', amount: 890000, issued: '2026-08-30', due: '2026-09-29', status: 'Paid' },
]

/** Daily output for the last 7 days (metres of fabric) */
export const weeklyProduction = [
  { day: 'Sat 04', target: 7500, actual: 7120 },
  { day: 'Sun 05', target: 4000, actual: 4310 },
  { day: 'Mon 06', target: 7500, actual: 7680 },
  { day: 'Tue 07', target: 7500, actual: 6940 },
  { day: 'Wed 08', target: 7500, actual: 7820 },
  { day: 'Thu 09', target: 7500, actual: 7390 },
  { day: 'Fri 10', target: 7500, actual: 6585 },
]

/** Monthly finance summary (INR) */
export const monthlyFinance = [
  { month: 'May', revenue: 9200000, expenses: 7450000 },
  { month: 'Jun', revenue: 10100000, expenses: 8020000 },
  { month: 'Jul', revenue: 9650000, expenses: 7810000 },
  { month: 'Aug', revenue: 11300000, expenses: 8790000 },
  { month: 'Sep', revenue: 12450000, expenses: 9530000 },
  { month: 'Oct', revenue: 4870000, expenses: 3710000 },
].map((m) => ({ ...m, profit: m.revenue - m.expenses }))

export const expenseBreakdown = [
  { name: 'Raw materials', value: 4290000 },
  { name: 'Wages', value: 2380000 },
  { name: 'Power & fuel', value: 1240000 },
  { name: 'Maintenance', value: 520000 },
  { name: 'Logistics', value: 610000 },
  { name: 'Overheads', value: 490000 },
]

export const weeklyAttendance = [
  { day: 'Mon', present: 15, absent: 1 },
  { day: 'Tue', present: 14, absent: 2 },
  { day: 'Wed', present: 16, absent: 0 },
  { day: 'Thu', present: 14, absent: 2 },
  { day: 'Fri', present: 15, absent: 1 },
  { day: 'Sat', present: 13, absent: 3 },
]
