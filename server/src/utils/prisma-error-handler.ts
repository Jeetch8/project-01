import { Prisma } from '@prisma/client';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export async function handlePrismaError<T>(
  prismaOperation: () => Promise<T>
): Promise<T> {
  try {
    return await prismaOperation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(error.meta.target[0] + ' already exist');
        case 'P2025':
          throw new NotFoundException('Record not found');
        // Add more cases as needed
        default:
          console.error('Unhandled Prisma error:', error);
          throw new InternalServerErrorException(
            'An unexpected database error occurred'
          );
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      throw new InternalServerErrorException(
        'Invalid data provided to database operation'
      );
    } else {
      console.error('Unexpected error:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
