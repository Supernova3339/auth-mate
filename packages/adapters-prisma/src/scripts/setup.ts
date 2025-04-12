#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * This script helps users set up the Auth Mate Prisma adapter
 * by creating the necessary schema additions and running migrations.
 */

// Auth Entry model definition for Prisma schema
const AUTH_ENTRY_MODEL = `
// Auth Mate storage model
model AuthEntry {
  id         String    @id @default(cuid())
  key        String    @unique
  value      String
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([key])
}
`;

async function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔐 Auth Mate Prisma Adapter Setup\n');

  // Determine location of Prisma schema
  const defaultSchemaPath = './prisma/schema.prisma';
  const schemaPath = await prompt(`Enter the path to your Prisma schema [${defaultSchemaPath}]: `) || defaultSchemaPath;

  // Check if the schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: Schema file not found at ${schemaPath}`);
    console.log('Run "npx prisma init" to initialize Prisma first, then try again.');
    process.exit(1);
  }

  // Read the schema file
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  // Check if the AuthEntry model already exists
  if (schemaContent.includes('model AuthEntry')) {
    console.log('✅ AuthEntry model already exists in schema');
  } else {
    // Add the AuthEntry model to the schema
    const updatedSchema = schemaContent + AUTH_ENTRY_MODEL;
    fs.writeFileSync(schemaPath, updatedSchema, 'utf-8');
    console.log('✅ Added AuthEntry model to schema');
  }

  // Ask if the user wants to create a migration
  const createMigration = await prompt('Create a migration? [y/N]: ');

  if (createMigration.toLowerCase() === 'y') {
    const migrationName = await prompt('Enter a name for the migration: ') || 'add_auth_storage';

    try {
      console.log('\nRunning prisma migrate...');
      execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: 'inherit' });
      console.log('✅ Migration created and applied');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  // Ask if the user wants to generate Prisma client
  const generateClient = await prompt('Generate Prisma client? [Y/n]: ');

  if (generateClient.toLowerCase() !== 'n') {
    try {
      console.log('\nGenerating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.error('❌ Client generation failed:', error);
      process.exit(1);
    }
  }

  console.log('\n🎉 Setup completed! Your database is now ready for Auth Mate.');
  console.log('\nNext steps:');
  console.log('1. Import the PrismaStorageManager in your application');
  console.log('2. Create an instance with your PrismaClient');
  console.log('3. Configure Auth Mate to use the adapter');
  console.log('\nExample:');
  console.log(`
import { PrismaClient } from '@prisma/client';
import { PrismaStorageManager } from '@auth-mate/adapters-prisma';
import { AuthProvider } from '@auth-mate/react';

const prisma = new PrismaClient();
const storage = new PrismaStorageManager({ prisma });

// In your React app:
function App() {
  return (
    <AuthProvider 
      config={{
        providers: { /* your providers */ },
        customStorage: storage
      }}
    >
      {/* your app */}
    </AuthProvider>
  );
}
  `);

  rl.close();
}

main().catch((error) => {
  console.error('Error during setup:', error);
  process.exit(1);
});