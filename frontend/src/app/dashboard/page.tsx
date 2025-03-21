'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data.message);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          router.push('/login');
        } else {
          setError(err.response?.data?.error || 'Something went wrong');
        }
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ixios Dashboard</h1>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          {data || 'Loading security data...'}
        </div>
      )}
    </div>
  );
}