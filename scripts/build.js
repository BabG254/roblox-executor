import { execSync } from 'child_process'

// Ensure DATABASE_URL is set from Vercel's Postgres variables
if (!process.env.DATABASE_URL) {
  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL
    console.log('✅ Using POSTGRES_PRISMA_URL as DATABASE_URL')
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL
    console.log('✅ Using POSTGRES_URL as DATABASE_URL')
  } else {
    console.error('❌ DATABASE_URL not found! Make sure Postgres is connected in Vercel.')
    process.exit(1)
  }
}

function run(command, description) {
  try {
    console.log(`\n🔄 ${description}...`)
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} complete!`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    return false
  }
}

console.log('🚀 Starting Vercel build...\n')

// Generate Prisma Client
if (!run('npx prisma generate', 'Generate Prisma Client')) {
  process.exit(1)
}

// Push schema to database
if (!run('npx prisma db push --skip-generate --accept-data-loss', 'Push database schema')) {
  process.exit(1)
}

// Seed database
if (!run('node scripts/seed.js', 'Seed database')) {
  console.error('⚠️ Seeding failed, but continuing build...')
}

// Build Next.js
if (!run('npx next build', 'Build Next.js')) {
  process.exit(1)
}

console.log('\n✨ Build complete!\n')
