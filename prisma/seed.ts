import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const inbox = await prisma.list.findFirst({
    where: { isDefault: true },
  })

  if (!inbox) {
    await prisma.list.create({
      data: {
        name: 'Inbox',
        isDefault: true,
        icon: '📥',
      },
    })
    console.log('Created Inbox list')
  } else {
    console.log('Inbox list already exists')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })