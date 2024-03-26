import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { base_url } from '../utils/base_url';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';
import {
  FieldName,
  FormProvider,
  useForm,
  useFormState,
} from 'react-hook-form';
import EmailSentModal from '@/Components/Modals/EmailSent.modal';
import RegisterPageCarousel from '@/Components/Carousel/RegisterPageCarousel';
import { useMultistepForm } from '@/Components/Form/RegistrationForm/useMultiStepFormHook';
import PersonalInfoFormStep from '@/Components/Form/RegistrationForm/PersonalInfoFormStep';
import CredentialsFormStep from '@/Components/Form/RegistrationForm/CredentialsFormStep';
import { Button } from '@/Components/Global/Button';
import ProfileFormStep from '@/Components/Form/RegistrationForm/ProfileFormStep';
import CompleteFormStep from '@/Components/Form/RegistrationForm/FormStepsComplete';
import { twMerge } from 'tailwind-merge';
import { TiTick } from 'react-icons/ti';

export const registerFormDefaultValues = {
  email: '',
  first_name: '',
  last_name: '',
  gender: 'none',
  date_of_birth: new Date(),
  profile_img: '',
  password: '',
  confirmPassword: '',
  username: '',
};

const stepsIndicator = [
  {
    sr_no: 1,
    text: 'Personal information',
    fields: ['first_name', 'last_name', 'gender', 'date_of_birth'],
  },
  { sr_no: 2, text: 'Profile', fields: ['profile_img', 'username'] },
  {
    sr_no: 3,
    text: 'Security Credentials',
    fields: ['email', 'password', 'confirm_password'],
  },
  { sr_no: 4, text: 'Completed' },
];

const Register = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const formMethods = useForm({
    defaultValues: registerFormDefaultValues,
  });
  const { isValid } = useFormState({ control: formMethods.control });
  const {
    step: FormStep,
    next: nextFormStep,
    back: prevFormStep,
    currentStepIndex,
    goTo: goToFormStepIndex,
    isFirstStep: isFormFirstStep,
    isLastStep: isFormLastStep,
  } = useMultistepForm([
    <PersonalInfoFormStep />,
    <ProfileFormStep />,
    <CredentialsFormStep />,
    <CompleteFormStep />,
  ]);
  const { fetchState, doFetch } = useFetch<{
    token: string;
  }>({
    url: base_url + '/auth/register/local',
    method: 'POST',
    authorized: false,
    onSuccess: () => {
      toast.success('Registeration success');
      setTimeout(() => {
        setIsModalOpen(true);
      }, 2000);
    },
    onError: (err) => {
      if (!Array.isArray(err.message)) {
        toast.error(err.message);
      }
    },
  });

  type FieldName = keyof typeof registerFormDefaultValues;

  const handleFormNextStep = async () => {
    const fields = stepsIndicator[currentStepIndex].fields;
    const output = await formMethods.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) return;

    nextFormStep();
  };

  return (
    <div className="flex items-center w-full h-[100vh] bg-black text-white">
      <div className="w-fit">
        <RegisterPageCarousel />
      </div>
      <div className="ml-10">
        <div className="px-10 w-[800px] py-10">
          <div className="flex justify-between">
            {stepsIndicator.map((el, ind) => {
              const textArr = el.text.split(' ');
              const isStepDone = currentStepIndex > ind;
              const isCurrentStep = currentStepIndex === ind;
              const isUpcomingStep = currentStepIndex < ind;
              return (
                <div className="text-center" key={ind}>
                  <div
                    className={twMerge(
                      'flex items-center justify-center h-[40px] w-[40px] rounded-full border-2 mx-auto',
                      isUpcomingStep && 'opacity-30 border-[1px]'
                    )}
                  >
                    {isStepDone ? (
                      <TiTick color="green" size={22} />
                    ) : (
                      <span
                        className={twMerge(
                          isStepDone && 'hover:underline cursor-pointer'
                        )}
                      >
                        {el.sr_no}
                      </span>
                    )}
                  </div>
                  <div
                    className={twMerge('mt-3', isUpcomingStep && 'opacity-30')}
                    onClick={() => goToFormStepIndex(ind)}
                  >
                    <h3
                      className={twMerge(
                        (isCurrentStep || isStepDone) && 'font-semibold',
                        isStepDone && 'hover:underline cursor-pointer'
                      )}
                    >
                      {textArr[0]} <br /> {textArr[1]}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-14 min-h-[400px]">
            <FormProvider {...formMethods}>
              <form
                onSubmit={formMethods.handleSubmit(async (data) => {
                  const formData = new FormData();
                  Object.entries(data).forEach((el) => {
                    formData.append(el[0], el[1].toLocaleString());
                  });
                  await doFetch(data);
                })}
              >
                {FormStep}
                <div className="flex justify-end mt-6 gap-x-4">
                  {!isFormFirstStep && (
                    <Button onClick={prevFormStep} type="button">
                      Prev
                    </Button>
                  )}
                  {!isFormLastStep && currentStepIndex !== 2 && (
                    <Button onClick={handleFormNextStep} type="button">
                      Next
                    </Button>
                  )}
                  {currentStepIndex === 2 && (
                    <button
                      type="submit"
                      className={twMerge(
                        'bg-blue-500 rounded-md px-4 hover:bg-blue-600 disabled:opacity-50',
                        !isValid && 'opacity-50 cursor-not-allowed'
                      )}
                      disabled={fetchState === 'loading'}
                    >
                      {fetchState === 'loading' ? (
                        <ScaleLoader role="loader" height={13} />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
          {/* <button
            onClick={() =>
              
            }
            className="bg-blue-700 font-semibold w-full py-3 rounded-md mt-2"
          >
            Register Demo User
          </button> */}
          <Link
            to={'/login'}
            className="text-blue-500 underline block mt-4 text-center"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
      <EmailSentModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default Register;
