import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: unknown) {
    const message = isErrorWithMessage(error)
      ? error.message
      : "An unexpected error occurred";
    res.status(500).json({ message });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId: cognitoId,
      },
    });

    res.json(user);
  } catch (error: unknown) {
    const message = isErrorWithMessage(error)
      ? error.message
      : "An unexpected error occurred";
    res.status(500).json({ message });
  }
};

export const postUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      cognitoId,
      profilePictureUrl = "i1.jpg",
      teamId = 1,
    } = req.body;
    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        profilePictureUrl,
        teamId,
      },
    });
    res.json({ message: "User Created Successfully", newUser });
  } catch (error: unknown) {
    const message = isErrorWithMessage(error)
      ? error.message
      : "An unexpected error occurred";
    res.status(500).json({ message });
  }
};
