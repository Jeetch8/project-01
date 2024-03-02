import bcrypt from 'bcrypt';

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export function addTimeToCurrentTime(
  time: number,
  unit: 'hours' | 'days' | 'minutes'
): Date {
  const currentDate = new Date();
  switch (unit) {
    case 'hours':
      currentDate.setHours(currentDate.getHours() + time);
      break;
    case 'days':
      currentDate.setDate(currentDate.getDate() + time);
      break;
    case 'minutes':
      currentDate.setMinutes(currentDate.getMinutes() + time);
      break;
    default:
      throw new Error('Invalid unit. Use either "hours", "days" or "minutes".');
  }
  return currentDate;
}
