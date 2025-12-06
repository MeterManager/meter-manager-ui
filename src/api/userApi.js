import createApi from './baseApi';

export const getUsers = async (token, search = '') => {
  const url = new URL('/api/users', window.location.origin);
  if (search) {
    url.searchParams.append('search', search);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  return response.json();
};

export const getUserById = async (token, id) => {
  const response = await fetch(`/api/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
};

export const updateUser = async (token, id, data) => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  return response.json();
};

export const deleteUser = async (token, id) => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }
};

export const verifyUser = async (token) => {
  const response = await fetch('/api/auth/verify-token', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error(`Token verification failed: ${response.status}`);
    error.status = response.status;
    
    if (response.status !== 403) {
      console.error('Error verifying user:', error.message);
    }
    
    throw error;
  }

  return response.json();
};

