import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loader({ size = 'md', text }: LoaderProps) {
  const sizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 size={sizes[size]} className="text-blue-800 animate-spin" />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}
