import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma')
const target = process.argv[2] || process.env.DB_PROVIDER || 'sqlite'

let schema = readFileSync(schemaPath, 'utf-8')

if (target === 'postgresql' || target === 'postgres') {
  schema = schema.replace(
    /provider = "sqlite"/,
    'provider = "postgresql"'
  )
  console.log('✓ Switched to PostgreSQL')
} else {
  schema = schema.replace(
    /provider = "postgresql"/,
    'provider = "sqlite"'
  )
  console.log('✓ Switched to SQLite')
}

writeFileSync(schemaPath, schema)
process.exit(0)
