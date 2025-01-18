import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { Button } from '../Global/Button';
import { TbCameraPlus } from 'react-icons/tb';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ICommunity } from '@/types/interfaces';

interface FormData {
  title: string;
  description: string;
  membership_type: boolean;
  banner_img: string;
}

const EditCommunityInfo = () => {
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const { communityId } = useParams();
  const navigate = useNavigate();

  const { doFetch: fetchCommunity } = useFetch<{
    community: ICommunity;
  }>({
    url: `${base_url}/community/${communityId}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setCommunity(data.community);
    },
    onUnAuthorisedAccessError: () => {
      toast.error('You are not authorized to access this page');
      navigate(-1);
    },
  });

  const { doFetch: updateCommunity } = useFetch({
    url: `${base_url}/community/${communityId}`,
    method: 'PATCH',
    authorized: true,
    onSuccess: () => {
      toast.success('Community updated successfully');
    },
    onError: () => {
      toast.error('Failed to update community');
    },
    onUnAuthorisedAccessError: () => {
      toast.error('You are not authorized to access this page');
      navigate(-1);
    },
  });

  const { register, handleSubmit, setValue, watch } = useForm<FormData>();

  useEffect(() => {
    fetchCommunity();
  }, []);

  useEffect(() => {
    if (community) {
      setValue('title', community.title);
      setValue('description', community.description);
      setValue('membership_type', community.membership_type === 'private');
      setValue('banner_img', community.banner_img);
    }
  }, [community]);

  const onSubmit = (data: FormData) => {
    updateCommunity({ body: data });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('banner_img', URL.createObjectURL(file), { shouldDirty: true });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Community Info</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <img
            src={watch('banner_img')}
            alt="Community Banner"
            className="w-full h-[200px] object-cover rounded-lg"
          />
          <label
            htmlFor="banner_img"
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
          >
            <TbCameraPlus className="text-white text-xl" />
          </label>
          <input
            type="file"
            id="banner_img"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <input
          {...register('title')}
          className="w-full p-2 bg-zinc-800 rounded"
          placeholder="Community Title"
        />
        <textarea
          {...register('description')}
          className="w-full p-2 bg-zinc-800 rounded"
          placeholder="Community Description"
          rows={4}
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('membership_type')}
            className="mr-2"
          />
          <label>Private Community</label>
        </div>
        <Button type="submit" className="w-full">
          Update Community
        </Button>
      </form>
    </div>
  );
};

export default EditCommunityInfo;
