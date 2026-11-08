import "dotenv/config";
import { bootstrapAdmin } from "../src/lib/auth";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
  }
  const res = await bootstrapAdmin(email, password);
  console.log(res.created ? `Created admin ${email}` : `Admin ${email} already exists`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
