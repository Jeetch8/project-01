import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button } from '@/Components/Global/Button';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteCommunityTab = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { doFetch: deleteCommunity } = useFetch({
    url: `${base_url}/community/${id}`,
    method: 'DELETE',
    authorized: true,
    onSuccess: () => {
      toast.success('Community deleted successfully');
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to delete community');
    },
  });

  return (
    <div className="bg-zinc-900 rounded-lg p-4 mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
        <FaTrash className="mr-2" /> Delete Community
      </h2>
      <p className="text-gray-300 mb-4">
        Warning: This action is irreversible. Deleting the community will remove
        all associated content and cannot be undone.
      </p>
      <Button
        variant="destructive"
        className="flex items-center"
        onClick={() => {
          if (
            window.confirm(
              'Are you sure you want to delete this community? This action cannot be undone.'
            )
          ) {
            deleteCommunity();
          }
        }}
      >
        <FaTrash className="mr-2" /> Delete Community
      </Button>
    </div>
  );
};

export default DeleteCommunityTab;
