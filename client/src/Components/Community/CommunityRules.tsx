import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { Button } from '../Global/Button';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ICommunity } from '@/utils/interfaces';

interface FormData {
  rules: { value: string }[];
}

const CommunityRules = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();

  const { register, control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      rules: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  });

  const { doFetch: fetchCommunity } = useFetch<{
    community: ICommunity;
  }>({
    url: `${base_url}/community/${communityId}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      const rules = data.community.rules.split('===').filter(Boolean);
      setValue(
        'rules',
        rules.map((rule) => ({ value: rule }))
      );
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
      toast.success('Community rules updated successfully');
    },
    onError: () => {
      toast.error('Failed to update community rules');
    },
    onUnAuthorisedAccessError: () => {
      toast.error('You are not authorized to access this page');
      navigate(-1);
    },
  });

  useEffect(() => {
    fetchCommunity();
  }, []);

  const onSubmit = (data: FormData) => {
    const formattedRules = data.rules.map((rule) => rule.value).join('===');
    updateCommunity({ body: { rules: formattedRules } });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Edit Rules</h2>
      <p className="text-gray-400">
        Set clear guidelines for your community to ensure a positive environment
        for all members.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              {...register(`rules.${index}.value`)}
              className="flex-grow p-2 bg-zinc-800 rounded"
              placeholder={`Rule ${index + 1}`}
            />
            <Button
              type="button"
              onClick={() => remove(index)}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append({ value: '' })}
          className="w-full"
        >
          Add Rule
        </Button>
        <Button type="submit" className="w-full">
          Update Rules
        </Button>
      </form>
    </div>
  );
};

export default CommunityRules;
