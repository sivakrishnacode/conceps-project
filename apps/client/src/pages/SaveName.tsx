import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaveName } from '../api/queries';
import { useAuthStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const SaveName = () => {
  const [name, setName] = useState('');
  const { mutate: saveName, isPending } = useSaveName();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveName(
      { name },
      {
        onSuccess: (response) => {
          const data = response.data;
          setAuth(data.accessToken, data.refreshToken, data.user);
          navigate('/', { replace: true });
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to save name');
        }
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md animate-fade-in text-center">
        <h1 className="text-2xl font-bold mb-2">What should we call you?</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Set up your profile to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            required
            className="text-center text-lg"
          />

          <Button type="submit" isLoading={isPending} disabled={name.length < 3}>
            Complete Profile
          </Button>
        </form>
      </Card>
    </div>
  );
};
