import { IParticipant } from '@server/src/socket/socket.types';
import { twMerge } from 'tailwind-merge';

interface Props {
  participants: IParticipant[];
}

const ProfileImgsInSquare = ({ participants }: Props) => {
  const firstFourParticipants = participants.slice(
    0,
    participants.length > 4 ? 4 : participants.length
  );

  return (
    <div
      className={twMerge(
        'grid grid-cols-2 grid-rows-1 rounded-full overflow-hidden h-[48px] w-[48px]',
        firstFourParticipants.length <= 2 ? 'grid-rows-1' : 'grid-rows-2',
        firstFourParticipants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      )}
    >
      {firstFourParticipants.map((participant, index) => (
        <div
          key={index}
          className={twMerge(
            'relative',
            index === 0 && firstFourParticipants.length === 3
              ? 'row-span-2'
              : ''
          )}
        >
          <img src={participant.profile_img} alt={participant.name} />
        </div>
      ))}
    </div>
  );
};

export default ProfileImgsInSquare;
