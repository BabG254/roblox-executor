import { execSync } from 'child_process'

function run(command, description) {
  try {
    console.log(`\n🔄 ${description}...`)
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} complete!`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

console.log('🚀 Starting Vercel build...\n')

run('node scripts/switch-db.js postgresql', 'Switch to PostgreSQL')
run('npx prisma generate', 'Generate Prisma Client')
run('npx prisma db push --skip-generate --accept-data-loss', 'Push database schema')
run('node scripts/seed.js', 'Seed database')
run('npx next build', 'Build Next.js')

console.log('\n✨ Build complete!\n')
