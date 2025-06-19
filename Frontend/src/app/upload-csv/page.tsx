'use client';
import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';

export default function UploadCsv() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true); // 👈 controls initial redirect check

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    console.log(storedRole);
    if (storedRole !== 'master') {
      router.replace('/dashboard'); // ✅ safe redirect
    } else {
      setRole(storedRole);
      setCheckingAccess(false); // ✅ we’re allowed, show the form
    }
  }, [router]);

  if (checkingAccess) return null; // ⏳ prevent rendering until access is verified

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const onSubmit = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message);
      setFile(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Upload Products CSV (Master Only)</h1>
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="mb-4 border p-2 w-full"
          title="Select CSV file to upload"
        />
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>
    </Layout>
  );
}
