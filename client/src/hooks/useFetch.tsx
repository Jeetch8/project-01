import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getTokenFromLocalStorage } from '@/utils/localstorage';

class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

export enum AcceptedMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum FetchStates {
  LOADING = 'loading',
  ERROR = 'error',
  IDLE = 'idle',
  SUCCESS = 'success',
}

type HTTPMethods = keyof typeof AcceptedMethods;

interface UseFetchProps<TData, TError> {
  url: string;
  method: HTTPMethods;
  headers?: HeadersInit;
  authorized?: boolean;
  authTokenVariable?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

interface ApiResponse<TData> {
  status: 'success' | 'error';
  data: TData;
  message: string;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

export const useFetch = <TData = unknown, TError = ApiError>({
  url,
  method,
  headers = {},
  authorized = false,
  authTokenVariable,
  onSuccess,
  onError,
}: UseFetchProps<TData, TError>) => {
  const navigate = useNavigate();
  const dataRef = useRef<TData | null>(null);
  const [fetchState, setFetchState] = useState<FetchStates>(FetchStates.IDLE);
  const errorRef = useRef<TError | null>(null);

  const handleUnAuthorisedAccessError = useCallback(() => {
    setFetchState(FetchStates.ERROR);
    toast.error('Please login again');
    navigate('/login');
    localStorage.clear();
  }, []);

  const doFetch = useCallback(
    async (dataToSend?: Record<string, unknown> | FormData) => {
      setFetchState(FetchStates.LOADING);
      try {
        const fetchHeaders: HeadersInit = new Headers(headers);

        if (method !== AcceptedMethods.GET && dataToSend) {
          // eslint-disable-next-line no-empty
          if (dataToSend instanceof FormData) {
          } else {
            fetchHeaders.set('Content-Type', 'application/json');
          }
        }

        if (authorized) {
          const token = getTokenFromLocalStorage(authTokenVariable);
          if (!token) {
            console.log(url, '401 redirect ' + url);
            handleUnAuthorisedAccessError();
            return;
          }
          fetchHeaders.set('Authorization', `Bearer ${token}`);
          fetchHeaders.set('credentials', 'include');
        }

        const fetchOptions: RequestInit = {
          method,
          headers: fetchHeaders,
          body:
            dataToSend instanceof FormData
              ? dataToSend
              : JSON.stringify(dataToSend),
        };
        const req = await fetch(url, fetchOptions);
        if (!req.ok) {
          if (req.status === 401) {
            console.log(url, '401 redirect ' + url);
            handleUnAuthorisedAccessError();
            return;
          }
          const err = await req.json();
          console.log(url, err, 'usefetch err');
          if (req.statusText) throw new CustomError(err.message, req.status);
        }
        const res: ApiResponse<TData> = await req.json();
        if (onSuccess) {
          onSuccess(res.data);
        }
        setFetchState(FetchStates.SUCCESS);
        dataRef.current = res.data;
      } catch (error) {
        console.error(error, 'error from useFetch', url);
        setFetchState(FetchStates.ERROR);
        errorRef.current = error as TError;
        if (onError) {
          onError(error as TError);
        } else {
          toast.error('Something went wrong');
        }
      }
    },
    [url, method, headers, authorized, onSuccess, onError, navigate]
  );

  return { fetchState, dataRef, errorRef, doFetch };
};
