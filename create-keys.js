// Run this in Vercel's database console or when DATABASE_URL is available
// Creates license keys for resellers to purchase

const keyConfigs = [
  // Windows Keys
  { duration: 30, price: 9.99, productType: "WINDOWS", count: 50 },
  { duration: 60, price: 18.99, productType: "WINDOWS", count: 30 },
  { duration: 90, price: 26.99, productType: "WINDOWS", count: 20 },
  // macOS Keys  
  { duration: 30, price: 12.99, productType: "MACOS", count: 30 },
  { duration: 60, price: 22.99, productType: "MACOS", count: 20 },
  { duration: 90, price: 32.99, productType: "MACOS", count: 15 },
  // Android Keys
  { duration: 30, price: 7.99, productType: "ANDROID", count: 40 },
  { duration: 60, price: 14.99, productType: "ANDROID", count: 25 },
  { duration: 90, price: 21.99, productType: "ANDROID", count: 20 },
]

// SQL to run in your database:
keyConfigs.forEach(config => {
  for (let i = 0; i < config.count; i++) {
    const keyValue = `${config.productType.substr(0,3)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    console.log(`INSERT INTO "LicenseKey" (id, key, duration, price, "productType", status, "createdAt", "updatedAt") VALUES ('${Math.random().toString(36)}', '${keyValue}', ${config.duration}, ${config.price}, '${config.productType}', 'AVAILABLE', NOW(), NOW());`)
  }
})