import { useState, useEffect, useCallback } from 'react';
import * as userApi from '../api/userApi';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getUsers(page, 10, search);
      setUsers(
        (response.data || []).map((u) => ({
          ...u,
          isActive: u.is_active === true,
        }))
      );
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні користувачів');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const editUser = async (id, payload) => {
    try {
      const updatedUser = await userApi.updateUser(id, payload);
      await fetchData();
      return updatedUser.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні користувача');
    }
  };

  const removeUser = async (id) => {
    try {
      await userApi.deleteUser(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні користувача');
    }
  };

  const updateUserStatus = async (id, newStatus) => {
    try {
      const payload = { is_active: newStatus };
      const updatedUser = await userApi.updateUser(id, payload);
      await fetchData();
      return updatedUser.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу');
    }
  };


  return {
    users,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    editUser,
    removeUser,
    updateUserStatus,
    error,
    setError,
  };
};
