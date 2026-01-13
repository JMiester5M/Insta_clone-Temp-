export const runtime = "nodejs";
export async function GET() {
  return new Response(process.env.DATABASE_URL || "undefined");
}
