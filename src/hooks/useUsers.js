import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import * as userApi from '../api/userApi';

export const useUsers = () => {
  const { getAccessTokenSilently } = useAuth0();
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
      const response = await userApi.getUsers(getAccessTokenSilently, page, 10, search);
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
  }, [getAccessTokenSilently, page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editUser = async (id, payload) => {
    try {
      await userApi.updateUser(getAccessTokenSilently, id, payload);
      await fetchData();
      return updatedUser.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні користувача');
    }
  };

  const removeUser = async (id) => {
    try {
      await userApi.deleteUser(getAccessTokenSilently, id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні користувача');
    }
  };

  const updateUserStatus = async (id, newStatus) => {
    try {
      const payload = { is_active: newStatus };
      await userApi.updateUser(getAccessTokenSilently, id, payload);
      await fetchData();
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
