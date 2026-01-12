import { execSync } from 'child_process'

function run(command, description) {
  try {
    console.log(`\n🔄 ${description}...`)
    execSync(command, { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } })
    console.log(`✅ ${description} complete!`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    return false
  }
}

console.log('🚀 Starting Vercel build...')
console.log('📊 Environment:', process.env.NODE_ENV)
console.log('🗄️ Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...\n')

// Switch to PostgreSQL
if (!run('node scripts/switch-db.js postgresql', 'Switch to PostgreSQL')) {
  console.error('⚠️ Failed to switch database, continuing anyway...')
}

// Generate Prisma Client
if (!run('npx prisma generate', 'Generate Prisma Client')) {
  process.exit(1)
}

// Push schema to database
if (!run('npx prisma db push --skip-generate --accept-data-loss --force-reset', 'Push database schema')) {
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
