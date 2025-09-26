import { useState, useEffect, useCallback } from 'react';
import * as userApi from '../api/userApi';
import { useAuthContext } from '../contexts/AuthContext';

export const useUsers = () => {
  const { isAuthenticated, isLoading, user: currentUser, getToken, isBlocked } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading || isBlocked) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const response = await userApi.getUsers(token, search);
      const usersData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const newUsers = usersData.map((u) => ({ ...u, isActive: u.is_active === true }));
      setUsers(newUsers);
    } catch (err) {
      setError('Помилка при завантаженні користувачів');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading, currentUser, getToken, isBlocked]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editUser = useCallback(
    async (id, payload) => {
      if (isBlocked) throw new Error('User is blocked');
      const userToEdit = users.find((u) => u.id === id);
      if (!userToEdit) throw new Error('Користувача не знайдено');
      if (userToEdit.role === 'admin') throw new Error('Не можна редагувати користувача з роллю "admin".');

      const token = await getToken();
      if (!token) throw new Error('No token available');
      try {
        setError(null);
        const response = await userApi.updateUser(token, id, payload);
        await fetchData();
        return response;
      } catch (err) {
        setError('Помилка при редагуванні користувача');
        throw err;
      }
    },
    [users, fetchData, getToken, isBlocked]
  );

  const updateUserStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('User is blocked');
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error('Користувача не знайдено');
      if (user.role === 'admin') throw new Error('Не можна змінити статус користувача з роллю "admin".');

      const token = await getToken();
      if (!token) throw new Error('No token available');
      try {
        setError(null);
        const payload = { is_active };
        const response = await userApi.updateUser(token, id, payload);
        await fetchData();
        return response;
      } catch (err) {
        setError('Помилка при оновленні статусу користувача');
        throw err;
      }
    },
    [users, fetchData, getToken, isBlocked]
  );

  return {
    users,
    loading,
    search,
    setSearch,
    editUser,
    updateUserStatus,
    error,
    setError,
  };
};
