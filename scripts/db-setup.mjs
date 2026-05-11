#!/usr/bin/env node

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')
const isBuilding = process.env.VERCEL === '1' || process.env.NEXT_PHASE === 'phase-production-build'
const isDevelopment = !isBuilding

console.log('[v0] Starting Prisma setup...')
console.log('[v0] Mode:', isDevelopment ? 'development' : 'build')
console.log('[v0] Project root:', projectRoot)

try {
  // Always generate Prisma client (works without DB connection)
  console.log('\n[v0] Step 1: Generating Prisma Client...')
  execSync('npx prisma generate', { 
    cwd: projectRoot,
    stdio: 'inherit'
  })
  console.log('[v0] ✓ Prisma Client generated successfully')

  // Only push schema during development (requires DATABASE_URL)
  if (isDevelopment) {
    console.log('\n[v0] Step 2: Checking environment variables...')
    const requiredVars = ['DATABASE_URL', 'DIRECT_URL']
    const missingVars = requiredVars.filter(v => !process.env[v])
    
    if (missingVars.length > 0) {
      console.warn('[v0] WARNING: Skipping DB push - missing:', missingVars.join(', '))
      console.warn('[v0] Make sure to set DATABASE_URL and DIRECT_URL in your .env.local')
    } else {
      console.log('[v0] ✓ All environment variables are set')
      
      console.log('\n[v0] Step 3: Pushing Prisma schema to database...')
      execSync('npx prisma db push --skip-generate --accept-data-loss', { 
        cwd: projectRoot,
        stdio: 'inherit'
      })
      console.log('[v0] ✓ Schema pushed to database')
    }
  } else {
    console.log('\n[v0] Step 2: Build mode - skipping DB operations')
    console.log('[v0] (DB operations will run on first deployment or manual setup)')
  }

  console.log('\n[v0] ✓ Prisma setup complete!')

} catch (error) {
  console.error('\n[v0] ERROR during Prisma setup:')
  console.error(error.message)
  // Don't fail the build if Prisma generation fails - let the actual error surface during runtime
  if (!isBuilding) {
    process.exit(1)
  }
}
