import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@app/ui/button';
import { Input } from '@app/ui/input';
import { Label } from '@app/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/ui/card';
import { Separator } from '@app/ui/separator';
import { CheckCircle } from 'lucide-react';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<ForgotPasswordForm>({
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Handle forgot password logic here
    // console.log('Password reset request for:', formData.email);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-sm text-slate-400 mb-4">
                We've sent a password reset link to {formData.email}
              </p>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Back to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          )}
          <div className="mt-4">
            <Separator className="my-4" />
            <div className="text-center text-sm">
              Remember your password?{' '}
              <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// export default ForgotPassword;
