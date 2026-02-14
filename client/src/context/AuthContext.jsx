import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [partner, setPartner] = useState(() => {
    const saved = localStorage.getItem('partner');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (vendorCode, password) => {
    const { data } = await api.post('/auth/login', { vendorCode, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('partner', JSON.stringify(data));
    setPartner(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('partner');
    setPartner(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !partner) {
      setLoading(true);
      api.get('/auth/me')
        .then(({ data }) => setPartner(data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ partner, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
