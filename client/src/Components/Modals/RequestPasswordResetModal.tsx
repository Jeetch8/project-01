import { useState } from 'react';
import Modal from './Modal';
import { Button } from '../Global/Button';
import { useFetch } from '@/hooks/useFetch';
import { useForm } from 'react-hook-form';
import HookFormInput from '../Form/HookFormInput';
import { emailRegex } from '@/utils/Regex';

const RequestPasswordResetModal = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { doFetch } = useFetch({
    url: 'auth/request-reset-password',
    method: 'POST',
  });
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm({ defaultValues: { email: '' } });

  return (
    <div className="text-black">
      <p>
        <a
          onClick={() => setIsModalOpen(true)}
          className="text-blue-500 underline block text-center cursor-pointer"
        >
          Forgot your password?
        </a>
      </p>
      <Modal
        canClose={true}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      >
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold">Please enter your email</h3>
          <p className="mt-5">
            An email will be sent to you with a link. Please click the link.
            Then you'll be forwaded to a page to reset you password
          </p>
          <form
            className="mt-8"
            onSubmit={handleSubmit(async (data) => {
              await doFetch({ email: data.email });
            })}
          >
            <label htmlFor="email">Email</label>
            <HookFormInput
              register={register}
              errors={errors.email}
              fieldName="email"
              fieldRules={{
                required: { value: true, message: 'Email is required' },
                pattern: { value: emailRegex, message: 'Invalid email' },
              }}
            />
            <Button
              type="submit"
              variant="secondary"
              className="mt-4"
              size="lg"
            >
              Submit
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default RequestPasswordResetModal;
