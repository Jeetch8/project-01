import { useState } from 'react';
import Modal from './Modal';
import { Button } from '../Global/Button';
import { useFetch } from '@/hooks/useFetch';
import { useForm } from 'react-hook-form';
import HookFormInput from '../Form/HookFormInput';
import { emailRegex } from '@/utils/Regex';
import TickGif from '@/assets/icons8-tick.gif';
import { base_url } from '@/utils/base_url';

const RequestPasswordResetModal = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { doFetch, fetchState } = useFetch({
    url: base_url + '/auth/request-reset-password',
    method: 'PATCH',
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
        {fetchState === 'success' ? (
          <div className="flex items-center justify-center">
            <div className="text-center">
              <img
                src={TickGif}
                alt="email sent"
                width={100}
                className="mx-auto"
              />
              <p className="font-semibold mt-4">
                Email has been sent.{' '}
                <span className="font-normal">(if correct)</span>
              </p>
              <p>
                Please check your <u>inbox</u>
              </p>
            </div>
          </div>
        ) : (
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
              <label htmlFor="email" className="mr-4">
                Email
              </label>
              <HookFormInput
                register={register}
                errors={errors.email}
                fieldName="email"
                placeholder="Enter your email"
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
        )}
      </Modal>
    </div>
  );
};

export default RequestPasswordResetModal;
