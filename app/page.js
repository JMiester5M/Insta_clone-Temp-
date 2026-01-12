'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setGeneratedImage(null);
    setPublishSuccess(false);

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedImage) return;

    setPublishing(true);
    setError('');
    setPublishSuccess(false);

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: generatedImage.imageUrl,
          prompt: generatedImage.prompt,
          userId: user.uid,
          userName: user.displayName || user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish image');
      }

      setPublishSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  AI Image Generator
                </h1>
                <p className="text-gray-600">
                  Create amazing images with DALL·E 2
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            <Link
              href="/feed"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              View Gallery →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleGenerate}>
              <div className="mb-6">
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter your prompt
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {publishSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-8">
              <p className="font-medium">Success!</p>
              <p className="text-sm">
                Your image has been published to the feed.{' '}
                <Link href="/feed" className="underline font-medium">
                  View it now
                </Link>
              </p>
            </div>
          )}

          {generatedImage && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Generated Image
                </h2>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Prompt</h3>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {generatedImage.prompt}
                </p>
              </div>

              <button
                onClick={handlePublish}
                disabled={publishing || publishSuccess}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {publishing
                  ? 'Publishing...'
                  : publishSuccess
                  ? 'Published ✓'
                  : 'Publish to Gallery'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
