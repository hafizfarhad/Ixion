"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/hello')
      .then((response) => setMessage(response.data.message))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="container">
      <h1>IAM MVP Prototype</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <p>Backend says: {message}</p>
      )}
    </div>
  );
}