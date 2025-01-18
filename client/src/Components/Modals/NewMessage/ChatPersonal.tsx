// interface Props {
//   setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }

// import UsersList from './UsersList';
// import { IUserWithoutPassword, RoomDocumentType } from '../../types';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useGlobalContext } from '@/context/GlobalContext';
// import { useFetch } from '@/hooks/useFetch';
// import { base_url } from '@/utils/base_url';

// const ChatPersonal = ({ setIsModalOpen }: Props) => {
//   const { fetchMyProfile } = useGlobalContext();
//   const navigate = useNavigate();

//   const { doFetch: fetchCreatePeronalRoom } = useFetch<
//     {
//       room: RoomDocumentType;
//     },
//     { message: string }
//   >({
//     authorized: true,
//     method: 'POST',
//     url: base_url + '/room',
//     onError(err) {
//       err.message.startsWith('chatId: ');
//       const chatId = err.message.split(' ')[1];
//       setIsModalOpen(false);
//       if (chatId) navigate('/chat/' + chatId);
//       else toast.error('Something went wrong');
//     },
//     onSuccess: async (data) => {
//       console.log(data);
//       await fetchMyProfile();
//       setIsModalOpen(false);
//       navigate('/chat/' + data.room._id);
//     },
//   });

//   const handleOnUserClick = async (user: IUserWithoutPassword) => {
//     await fetchCreatePeronalRoom({
//       participants: [user],
//       type: 'personal',
//     });
//   };

//   return (
//     <div>
//       <UsersList handleOnUserClick={handleOnUserClick} />
//     </div>
//   );
// };

// export default ChatPersonal;
