import { IParticipant } from '@/types/socket';
import AvatarImage from '../Global/AvatarImage';
import { Tooltip } from 'react-tooltip';

interface Props {
  participants: IParticipant[];
  size?: string;
}

const SidedProfileImgs = ({ participants, size = '32px' }: Props) => {
  const firstFourParticipants = participants?.slice(
    0,
    participants.length > 4 ? 4 : participants.length
  );

  return (
    <div className="flex -space-x-2">
      {firstFourParticipants.map((participant, index) => (
        <>
          <a
            data-tooltip-id={`profile-img-${participant.id}`}
            data-tooltip-content={participant.name}
            data-tooltip-place="bottom"
            className="cursor-pointer hover:scale-110 transition-all duration-300"
          >
            <AvatarImage
              key={index}
              url={participant?.profile_img}
              diameter={size}
            />
          </a>
          <Tooltip id={`profile-img-${participant.id}`} />
        </>
      ))}
    </div>
  );
};

export default SidedProfileImgs;
