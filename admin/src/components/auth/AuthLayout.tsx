import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type ReactNode, useMemo } from 'react';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  // Generate random seeds for images on mount to get different images each session
  const imageSeeds = useMemo(
    () => ({
      img1: Math.random().toString(36).substring(7),
      img2: Math.random().toString(36).substring(7),
      img3: Math.random().toString(36).substring(7),
      img4: Math.random().toString(36).substring(7),
      img5: Math.random().toString(36).substring(7),
    }),
    [],
  );

  const images = [
    {
      url: `https://source.unsplash.com/600x400/?meditation,yoga&sig=${imageSeeds.img1}`,
      alt: 'Meditation',
    },
    {
      url: `https://source.unsplash.com/600x400/?zen,nature&sig=${imageSeeds.img2}`,
      alt: 'Zen',
    },
    {
      url: `https://source.unsplash.com/1200x400/?spiritual,peace&sig=${imageSeeds.img3}`,
      alt: 'Nature meditation',
    },
    {
      url: `https://source.unsplash.com/600x400/?calm,mindfulness&sig=${imageSeeds.img4}`,
      alt: 'Calm',
    },
    {
      url: `https://source.unsplash.com/600x400/?buddhism,temple&sig=${imageSeeds.img5}`,
      alt: 'Spiritual',
    },
  ];

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              CalyxGuru Admin
            </h1>
            <p className="text-muted-foreground">
              Manage your spiritual journey platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Decorative images */}
      <div className="hidden lg:block relative overflow-hidden bg-muted">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-2 p-2">
          {/* Top row */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={images[0].url}
              alt={images[0].alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={images[1].url}
              alt={images[1].alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Middle row - spans both columns */}
          <div className="col-span-2 relative overflow-hidden rounded-lg">
            <img
              src={images[2].url}
              alt={images[2].alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-lg font-semibold">Finding Peace Within</p>
              <p className="text-sm opacity-90">Guiding spiritual journeys</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={images[3].url}
              alt={images[3].alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={images[4].url}
              alt={images[4].alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
