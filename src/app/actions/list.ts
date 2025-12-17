'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getLists() {
  // Ensure Inbox exists
  const inbox = await prisma.list.findFirst({
    where: { isDefault: true }
  })
  
  if (!inbox) {
      await prisma.list.create({
          data: {
              name: "Inbox",
              isDefault: true,
              icon: "📥"
          }
      })
  }

  return await prisma.list.findMany({
    orderBy: { createdAt: 'asc' },
  })
}

export async function createList(name: string, icon?: string, color?: string) {
  const list = await prisma.list.create({
    data: {
      name,
      icon,
      color,
    },
  })
  revalidatePath('/')
  return list
}
