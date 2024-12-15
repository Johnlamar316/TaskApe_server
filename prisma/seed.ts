import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Map file names to model names, capitalize first letter of each model
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  // Delete data in reverse order of dependencies (child-first, parent-last)
  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // Adjusted deletion order: child tables first, parent tables last
  const orderedFileNames = [
    "taskAssignment.json",
    "comment.json",
    "attachment.json",
    "task.json",
    "projectTeam.json",
    "project.json",
    "user.json",
    "team.json",
  ];

  // Step 1: Clear existing data
  await deleteAllData(orderedFileNames);

  // Step 2: Seed data
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const data of jsonData) {
        await model.upsert({
          where: { id: data.id }, // Ensure uniqueness using the `id` field
          update: {}, // If the record exists, don't update anything
          create: data, // If the record doesn't exist, create it
        });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
