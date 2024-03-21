type GlobalContextType =
  | {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string;
      email: string;
      username: string;
      profile_img: string;
    }
  | undefined;

import React, { createContext, useContext, useEffect } from 'react';
import { FetchStates, useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';

const defaultValues: GlobalContextType = undefined;
const GlobalContext = createContext<{
  user: GlobalContextType;
  fetchstate: FetchStates;
}>({ user: defaultValues, fetchstate: FetchStates.IDLE });

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchState, doFetch, dataRef } = useFetch<{
    user: GlobalContextType;
  }>({ url: base_url + '/user/me', method: 'GET', authorized: true });

  useEffect(() => {
    doFetch();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ user: dataRef.current?.user, fetchstate: fetchState }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider'
    );
  }
  return context;
};
