import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const patients = await prisma.patient.findMany()
    return new Response(JSON.stringify(patients), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        dob: body.dob ? new Date(body.dob) : null,
      },
    })
    return new Response(JSON.stringify(patient), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(req) {
  try {
    const body = await req.json()
    const patient = await prisma.patient.update({
      where: { id: body.id },
      data: {
        name: body.name,
        phone: body.phone || null,
        dob: body.dob ? new Date(body.dob) : null,
      },
    })
    return new Response(JSON.stringify(patient), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json()
    const patient = await prisma.patient.delete({
      where: { id: body.id },
    })
    return new Response(JSON.stringify({ message: 'Patient supprimé', patient }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
