import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function main() {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  const dbPath = dbUrl.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@smmp.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@smmp.com",
        password: hashedPassword,
        role: "ADMIN",
        balance: 100,
      },
    });
    console.log("✅ Admin user created: admin@smmp.com / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
