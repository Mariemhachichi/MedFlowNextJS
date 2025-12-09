import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET : tous les rendez-vous
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { date: "asc" },
    });

    return new Response(JSON.stringify(appointments), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de récupérer les rendez-vous" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST : créer un rendez-vous
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.date || !body.patientId || !body.doctorId) {
      return new Response(
        JSON.stringify({
          error: "Les champs date, patientId et doctorId sont requis",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const patientId = parseInt(body.patientId);
    const doctorId = parseInt(body.doctorId);

    if (isNaN(patientId) || isNaN(doctorId)) {
      return new Response(
        JSON.stringify({ error: "patientId et doctorId doivent être des nombres" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        reason: body.reason || null,
        patientId,
        doctorId,
        status: body.status || "En attente",
      },
      include: { patient: true, doctor: true },
    });

    return new Response(JSON.stringify(appointment), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de créer le rendez-vous" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT : mettre à jour un rendez-vous
export async function PUT(req) {
  try {
    const body = await req.json();

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "L'id du rendez-vous est requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(body.id) },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        reason: body.reason || undefined,
        status: body.status || undefined,
        patientId: body.patientId ? parseInt(body.patientId) : undefined,
        doctorId: body.doctorId ? parseInt(body.doctorId) : undefined,
      },
      include: { patient: true, doctor: true },
    });

    return new Response(JSON.stringify(appointment), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de mettre à jour le rendez-vous" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE : supprimer un rendez-vous
export async function DELETE(req) {
  try {
    const body = await req.json();

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "L'id du rendez-vous est requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.appointment.delete({
      where: { id: parseInt(body.id) },
    });

    return new Response(
      JSON.stringify({ message: "Rendez-vous supprimé avec succès" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de supprimer le rendez-vous" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
