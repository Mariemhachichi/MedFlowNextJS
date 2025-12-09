import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET : tous les docteurs
export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany();
    return new Response(JSON.stringify(doctors), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST : ajouter un docteur
export async function POST(req) {
  try {
    const body = await req.json();
    const doctor = await prisma.doctor.create({
      data: {
        name: body.name,
        specialty: body.specialty || null,
      },
    });

    return new Response(JSON.stringify(doctor), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
