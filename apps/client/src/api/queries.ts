import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './index';
import type { ApiResponse } from '@repo/shared';

// AUTH
export const useRegister = () => useMutation({ mutationFn: (data: any) => api.post('/auth/register', data).then(r => r.data) });
export const useVerifyOtp = () => useMutation({ mutationFn: (data: any) => api.post('/auth/verify-otp', data).then(r => r.data) });
export const useSaveName = () => useMutation({ mutationFn: (data: any) => api.post('/auth/save-name', data).then(r => r.data) });
export const useLogin = () => useMutation({ mutationFn: (data: any) => api.post('/auth/login', data).then(r => r.data) });
export const useRefreshToken = () => useMutation({ mutationFn: (data: any) => api.post('/auth/refresh-token', data).then(r => r.data) });
export const useLogout = () => useMutation({ mutationFn: (data: any) => api.post('/auth/logout', data).then(r => r.data) });

// USER
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: () => api.get('/user/profile').then(r => r.data.data) });
export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/user/dashboard').then(r => r.data.data) });

// WALLET
export const useWallet = () => useQuery({ queryKey: ['wallet'], queryFn: () => api.get('/wallet').then(r => r.data.data) });
export const useAddMoney = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/wallet/add-money', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });
};
export const useWithdraw = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/wallet/withdraw', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });
};
export const usePassbook = (page: number) => useQuery({ 
  queryKey: ['passbook', page], 
  queryFn: () => api.get(`/wallet/passbook?page=${page}`).then(r => r.data.data) 
});
export const useTransactions = (params: any) => useQuery({ 
  queryKey: ['transactions', params], 
  queryFn: () => api.get('/wallet/transactions', { params }).then(r => r.data.data) 
});

// KYC
export const useKycStatus = () => useQuery({ queryKey: ['kyc-status'], queryFn: () => api.get('/kyc/status').then(r => r.data.data) });

export const useKycGenerateOtp = () => {
  return useMutation({
    mutationFn: async (aadhaarNumber: string) => {
      const { data } = await api.post<ApiResponse<{ message: string }>>('/kyc/generate-otp', { aadhaarNumber });
      return data.data!;
    },
  });
};

export const useKycVerifyOtp = () => {
  return useMutation({
    mutationFn: async (otp: string) => {
      const { data } = await api.post<ApiResponse<any>>('/kyc/verify-otp', { otp });
      return data.data!;
    },
  });
};
export const useSubmitKyc = () => useMutation({ mutationFn: (data: any) => api.post('/kyc/submit', data).then(r => r.data) });

// PROMO
export const useApplyPromo = () => useMutation({ mutationFn: (data: any) => api.post('/promo/validate', data).then(r => r.data) });
