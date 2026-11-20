import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Inventory = ({ token }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) setTasks(data);
      } catch {
        if (active) setError('Failed to load products. Try refreshing the page.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) return <p role="status">Loading products…</p>;
  if (error) return <p role="alert">{error}</p>;

  return <TaskList tasks={tasks} setTasks={setTasks} token={token} />;
};

const Tasks = () => {
  const { user } = useAuth();
  const token = user?.token;

  return (
    <main className="container mx-auto p-6">
      {token ? (
        <Inventory key={token} token={token} />
      ) : (
        <p>Sign in to manage products.</p>
      )}
    </main>
  );
};

export default Tasks;