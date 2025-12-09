import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET : toutes les factures
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { patient: true, doctor: true },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(invoices), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de récupérer les factures" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST : créer une facture
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.patientId || !body.doctorId || !body.amount) {
      return new Response(
        JSON.stringify({
          error: "patientId, doctorId et amount sont requis",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId: parseInt(body.patientId),
        doctorId: parseInt(body.doctorId),
        amount: parseFloat(body.amount),
        status: body.status || "Non payée",
      },
      include: { patient: true, doctor: true },
    });

    return new Response(JSON.stringify(invoice), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de créer la facture" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT : mettre à jour une facture
export async function PUT(req) {
  try {
    const body = await req.json();
    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "L'id de la facture est requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(body.id) },
      data: {
        amount: body.amount ? parseFloat(body.amount) : undefined,
        status: body.status || undefined,
        patientId: body.patientId ? parseInt(body.patientId) : undefined,
        doctorId: body.doctorId ? parseInt(body.doctorId) : undefined,
      },
      include: { patient: true, doctor: true },
    });

    return new Response(JSON.stringify(invoice), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de mettre à jour la facture" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE : supprimer une facture
export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "L'id de la facture est requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.invoice.delete({
      where: { id: parseInt(body.id) },
    });

    return new Response(
      JSON.stringify({ message: "Facture supprimée avec succès" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible de supprimer la facture" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
