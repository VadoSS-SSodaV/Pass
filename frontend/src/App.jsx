import React, { useState, useEffect, createContext, useContext } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Users, LogOut, PlusCircle } from 'lucide-react';

// Auth Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// API Service
const API_URL = 'http://localhost:8080/api';

const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Помилка входу');
    return res.json();
  },

  register: async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Помилка реєстрації');
    return res.json();
  },

  getMyPasses: async (token) => {
    const res = await fetch(`${API_URL}/passes/my-passes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Помилка отримання пропусків');
    return res.json();
  },

  createPass: async (token, data) => {
    const res = await fetch(`${API_URL}/passes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Помилка створення пропуску');
    return res.json();
  },

  getAllPasses: async (token) => {
    const res = await fetch(`${API_URL}/passes/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Помилка отримання пропусків');
    return res.json();
  },

  approvePass: async (token, id) => {
    const res = await fetch(`${API_URL}/passes/admin/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Помилка схвалення');
    return res.json();
  },

  rejectPass: async (token, id, reason) => {
    const res = await fetch(`${API_URL}/passes/admin/${id}/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Помилка відхилення');
    return res.json();
  }
};

// Login Component
const Login = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(username, password);
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Вхід в систему</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Логін</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Увійти
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Реєстрація
          </button>
        </form>
      </div>
    </div>
  );
};

// Register Component
const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.register(formData);
      setSuccess(true);
      setTimeout(onBack, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Реєстрація</h1>
        {success ? (
          <div className="text-center text-green-600 font-medium">
            Реєстрація успішна! Повертаємось до входу...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Логін</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ПІБ</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Відділ</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Зареєструватися
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Назад
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// User Dashboard
const UserDashboard = () => {
  const { user, token, logout } = useAuth();
  const [passes, setPasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'TEMPORARY_PASS',
    purpose: '',
    location: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      const data = await api.getMyPasses(token);
      setPasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createPass(token, formData);
      setShowForm(false);
      setFormData({
        type: 'TEMPORARY_PASS',
        purpose: '',
        location: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
      loadPasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const typeLabels = {
    TEMPORARY_PASS: 'Тимчасовий пропуск',
    PERMANENT_PASS: 'Постійний пропуск',
    VEHICLE_PASS: 'Пропуск для транспорту',
    VISITOR_PASS: 'Пропуск для відвідувача',
    EQUIPMENT_PASS: 'Дозвіл на винос обладнання',
    AFTER_HOURS_ACCESS: 'Доступ після робочих годин'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Мої пропуски</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.fullName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Створити заявку
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Нова заявка на пропуск</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип пропуску</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Місце</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата початку</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата закінчення</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Мета</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Примітки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Подати заявку
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {passes.map((pass) => (
            <div key={pass.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{typeLabels[pass.type]}</h3>
                  <p className="text-gray-600 mt-1">{pass.purpose}</p>
                </div>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pass.status)}`}>
                  {getStatusIcon(pass.status)}
                  {pass.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Період:</span>
                  <p className="font-medium">{new Date(pass.startDate).toLocaleString('uk-UA')} - {new Date(pass.endDate).toLocaleString('uk-UA')}</p>
                </div>
                {pass.location && (
                  <div>
                    <span className="text-gray-600">Місце:</span>
                    <p className="font-medium">{pass.location}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Подано:</span>
                  <p className="font-medium">{new Date(pass.requestedAt).toLocaleString('uk-UA')}</p>
                </div>
              </div>
              {pass.approvedBy && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-gray-600 text-sm">Розглянув: </span>
                  <span className="font-medium text-sm">{pass.approvedBy}</span>
                  {pass.rejectionReason && (
                    <p className="text-red-600 text-sm mt-2">Причина відхилення: {pass.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {passes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Ви ще не подавали заявок на пропуски
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [passes, setPasses] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      const data = await api.getAllPasses(token);
      setPasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approvePass(token, id);
      loadPasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Вкажіть причину відхилення');
      return;
    }
    try {
      await api.rejectPass(token, id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      loadPasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredPasses = passes.filter(pass => 
    filter === 'ALL' || pass.status === filter
  );

  const stats = {
    total: passes.length,
    pending: passes.filter(p => p.status === 'PENDING').length,
    approved: passes.filter(p => p.status === 'APPROVED').length,
    rejected: passes.filter(p => p.status === 'REJECTED').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const typeLabels = {
    TEMPORARY_PASS: 'Тимчасовий пропуск',
    PERMANENT_PASS: 'Постійний пропуск',
    VEHICLE_PASS: 'Пропуск для транспорту',
    VISITOR_PASS: 'Пропуск для відвідувача',
    EQUIPMENT_PASS: 'Дозвіл на винос обладнання',
    AFTER_HOURS_ACCESS: 'Доступ після робочих годин'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Панель адміністратора</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.fullName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Всього</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Очікують</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Схвалено</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Відхилено</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL' ? 'Всі' : status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPasses.map((pass) => (
            <div key={pass.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{typeLabels[pass.type]}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pass.status)}`}>
                      {pass.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{pass.purpose}</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Користувач:</span>
                      <p className="font-medium">{pass.userName}</p>
                      <p className="text-gray-500">{pass.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{pass.userEmail}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Період:</span>
                      <p className="font-medium">{new Date(pass.startDate).toLocaleDateString('uk-UA')} - {new Date(pass.endDate).toLocaleDateString('uk-UA')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Подано:</span>
                      <p className="font-medium">{new Date(pass.requestedAt).toLocaleString('uk-UA')}</p>
                    </div>
                  </div>
                  {pass.notes && (
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Примітки: </span>
                      <span className="text-sm">{pass.notes}</span>
                    </div>
                  )}
                </div>
                {pass.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(pass.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Схвалити
                    </button>
                    <button
                      onClick={() => setRejectingId(pass.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Відхилити
                    </button>
                  </div>
                )}
              </div>
              {rejectingId === pass.id && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Причина відхилення</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                    rows="2"
                    placeholder="Вкажіть причину відхилення..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(pass.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Підтвердити відхилення
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredPasses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Немає пропусків для відображення
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <AuthContent showRegister={showRegister} setShowRegister={setShowRegister} />
    </AuthProvider>
  );
}

function AuthContent({ showRegister, setShowRegister }) {
  const { user } = useAuth();

  if (!user) {
    return showRegister ? (
      <Register onBack={() => setShowRegister(false)} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} />
    );
  }

  return user.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />;
}