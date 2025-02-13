"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGoToWordInput = () => {
    router.push('/word-input');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '10px' }}>
      <h1>Welcome to the Home Page</h1>
      <button onClick={handleGoToWordInput}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded text-2xl">
        开始练习</button>
    </div>
  );
}