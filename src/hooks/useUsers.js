import { useState, useEffect, useCallback } from 'react';
import * as userApi from '../api/userApi';
import useAuth from './useAuth';

export const useUsers = () => {
  const { isAuthenticated, isLoading, currentUser  } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading || (currentUser && !currentUser.isActive)) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не знайдено');
      }
      const response = await userApi.getUsers(token, search);
      setUsers(
        (response.data || []).map((u) => ({
          ...u,
          isActive: u.is_active === true,
        }))
      );
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Помилка при завантаженні користувачів');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editUser = async (id, payload) => {
    const userToEdit = users.find(u => u.id === id);
    if (!userToEdit) {
      throw new Error('Користувача не знайдено');
    }
    if (userToEdit.role === 'admin') {
      throw new Error('Не можна редагувати користувача з роллю "admin".');
    }
    const token = localStorage.getItem('token');
    const response = await userApi.updateUser(token, id, payload);
    await fetchData();
    return response;
  };

  const removeUser = async (id) => {
    const userToRemove = users.find(u => u.id === id);
    if (!userToRemove) {
      throw new Error('Користувача не знайдено');
    }
    if (userToRemove.role === 'admin') {
      throw new Error('Не можна видалити користувача з роллю "admin".');
    }
    const token = localStorage.getItem('token');
    await userApi.deleteUser(token, id);
    await fetchData();
  };

  const updateUserStatus = async (id, is_active) => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new Error('Користувача не знайдено');
    }
    if (user.role === 'admin') {
      throw new Error('Не можна змінити статус користувача з роллю "admin".');
    }
    const token = localStorage.getItem('token');
    if (!user) throw new Error('Користувача не знайдено');
    const payload = { ...user, is_active };
    const response = await userApi.updateUser(token, id, payload);
    await fetchData();
    return response;
  };

  return {
    users,
    loading,
    search,
    setSearch,
    editUser,
    removeUser,
    updateUserStatus,
    error,
    setError,
  };
};
