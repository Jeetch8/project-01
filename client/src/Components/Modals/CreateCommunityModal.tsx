import { Dispatch, SetStateAction } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from './Modal';
import HookFormInput from '../Form/HookFormInput';
import HookSwitchCheckbox from '../Form/HookSwitchCheckbox';
import { Button } from '../Global/Button';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import toast from 'react-hot-toast';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

interface FormData {
  title: string;
  description: string;
  membership_type: boolean;
}

const CreateCommunityModal = ({ isModalOpen, setIsModalOpen }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      membership_type: false,
    },
    mode: 'onChange',
  });

  const { doFetch } = useFetch({
    url: `${base_url}/community`,
    method: 'POST',
    authorized: true,
    onSuccess: (data) => {
      toast.success('Community created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Error creating community');
    },
  });

  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      header={
        <h3 className="text-2xl font-semibold">Create a new Community</h3>
      }
      blackScreenClassName="bg-[rgba(25,155,240,0.1)]"
      dialogClassName="bg-black text-white rounded-2xl"
    >
      <p className="mb-4 text-gray-300">
        Create a new community to connect with people who share your interests.
      </p>
      <form
        onSubmit={handleSubmit(async (data) => {
          await doFetch({ data });
        })}
        className="space-y-4"
      >
        <div>
          <HookFormInput
            fieldName="title"
            register={register}
            errors={errors.title}
            placeholder="Community name"
            fieldRules={{
              required: 'Community name is required',
              minLength: { value: 3, message: 'Minimum 3 characters' },
            }}
          />
        </div>
        <div>
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Community purpose is required' }}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Community purpose"
                className="w-full p-2 rounded-md text-black"
                rows={4}
              />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Private Community</span>
          <HookSwitchCheckbox
            fieldName="membership_type"
            register={register}
            label="Private Community"
          />
        </div>
        <p className="text-sm text-gray-400">
          Create a private community if you want to approve members before they
          join. Public communities are open for anyone to join.
        </p>
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="rounded-full"
            size="lg"
            disabled={!isValid}
          >
            Create Community
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCommunityModal;
