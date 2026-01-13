"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyImagesPage() {
  const { user, loading } = useAuth();
  const [images, setImages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch(`/api/my-images?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          setImages(data.images || []);
          setFetching(false);
        });
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Generated Images</h1>
      {images.length === 0 ? (
        <p>You haven't generated any images yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="border rounded-lg overflow-hidden shadow">
              <Image src={img.url} alt={img.prompt} width={400} height={400} className="w-full h-auto" />
              <div className="p-2 text-sm text-gray-700">{img.prompt}</div>
              <div className="p-2 text-xs text-gray-500">Generated: {new Date(img.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
