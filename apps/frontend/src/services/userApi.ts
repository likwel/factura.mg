// apps/frontend/src/services/userApi.ts
import api from './api';

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

class UserApi {
  async getCompanyUsers(): Promise<UserOption[]> {
    const response = await api.get<UserOption[]>('/users/company');
    return response.data;
  }
}

export const userApi = new UserApi();