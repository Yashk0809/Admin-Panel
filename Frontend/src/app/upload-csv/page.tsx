'use client';
import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, Loader2, FileX, AlertCircle, Info, Download } from 'lucide-react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

export default function UploadCsv() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // const [role, setRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole !== 'master') {
      router.replace('/dashboard');
    } else {
      setCheckingAccess(false);
    }
  }, [router]);

  if (checkingAccess) return null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const onSubmit = async () => {
    if (!file) return alert('Please select a CSV file');

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const res = await api.post('/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message);
      setUploadSuccess(true);
      setTimeout(() => {
        setFile(null);
        setUploadSuccess(false);
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Upload Products CSV</h1>
          <p className="text-muted-foreground text-sm">Only accessible by master users</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
  {/* Upload File */}
  <div className="rounded-xl border bg-white shadow p-6">
    <div className="mb-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" /> Upload File
      </h2>
      <p className="text-gray-500 text-sm">Select your CSV file below</p>
    </div>

    <div className="space-y-4">
      <div className="border-2 border-dashed p-6 rounded-xl text-center relative">
        <input
          type="file"
          accept=".csv"
          title="Select CSV file"
          aria-label="Select CSV file"
          onChange={onFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={loading}
        />

        {!file ? (
          <>
            <Upload className="mx-auto h-10 w-10 text-blue-500" />
            <p className="mt-2 text-sm">Drag or click to select a CSV file</p>
          </>
        ) : (
          <div className="text-left space-y-2">
            <p className="font-medium text-green-700">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploadSuccess ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p>Upload successful</p>
              </div>
            ) : (
              <button
                onClick={removeFile}
                className="inline-flex items-center text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 text-sm"
              >
                <FileX className="h-4 w-4 mr-1" /> Remove
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !file}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Upload CSV
      </button>
    </div>
  </div>

  {/* Instructions */}
  <div className="rounded-xl border bg-white shadow p-6">
    <div className="mb-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Info className="h-5 w-5" /> Upload Instructions
      </h2>
      <p className="text-gray-500 text-sm">Ensure your CSV meets the format below</p>
    </div>

    <div className="text-sm space-y-4">
      <div>
        <strong>Required Columns:</strong>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Category', 'Category Description', 'Product Name', 'Product Description', 'Product Price', 'Available Units'].map((label) => (
            <span key={label} className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
              {label}
            </span>
          ))}
        </div>
      </div>

      <hr className="my-4 border-t border-gray-200" />

      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <p>Products with the same name will not be duplicated.</p>
      </div>

      <button className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm">
        <Download className="h-4 w-4 mr-2" /> Download Sample CSV
      </button>
    </div>
  </div>
</div>
      </div>
    </Layout>
  );
}
