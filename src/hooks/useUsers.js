import { useState, useEffect } from 'react';
import * as userApi from '../api/userApi';
import { useAuthRequest } from './useAuthRequest';
import { useErrorHandler } from './useErrorHandler';

export const useUsers = () => {
  const { canRequest, withToken } = useAuthRequest();
  const { handleError } = useErrorHandler('Помилка при завантаженні користувачів');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!canRequest) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await withToken(userApi.getUsers, search);
        const usersData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const newUsers = usersData.map((u) => ({ ...u, isActive: u.is_active === true }));
        setUsers(newUsers);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, canRequest]);

  const updateUserStatus = async (id, is_active) => {
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('Користувача не знайдено');
    if (user.role === 'admin') throw new Error('Не можна змінити статус користувача з роллю "admin".');
    
    const payload = { is_active };
    const response = await withToken(userApi.updateUser, id, payload);
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === id ? { ...u, isActive: is_active, is_active } : u
      )
    );
    return response;
  };

  return {
    users,
    loading,
    search,
    setSearch,
    updateUserStatus,
  };
};
