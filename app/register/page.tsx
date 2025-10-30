"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [userForm, setUserForm] = useState({ email: '', password: '', fullName: '' });
  const [organizerForm, setOrganizerForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationName: '',
    description: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(userForm.email, userForm.password, userForm.fullName, 'user');

    if (error) {
      toast.error(error.message || 'Registration failed');
      setLoading(false);
    } else {
      toast.success('Account created successfully!');
      router.push('/user/dashboard');
    }
  };

  const handleOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error: authError } = await signUp(
      organizerForm.email,
      organizerForm.password,
      organizerForm.fullName,
      'organizer'
    );

    if (authError) {
      toast.error(authError.message || 'Registration failed');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: orgError } = await supabase.from('organizers').insert({
        user_id: user.id,
        organization_name: organizerForm.organizationName,
        description: organizerForm.description,
        contact_email: organizerForm.contactEmail,
      });

      if (orgError) {
        toast.error('Failed to create organizer profile');
        setLoading(false);
        return;
      }
    }

    toast.success('Organizer account created! Awaiting admin verification.');
    router.push('/organizer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-blue-600 fill-blue-600" />
          </div>
          <CardTitle className="text-2xl">Join VolunteerHub</CardTitle>
          <CardDescription>Create your account and start making a difference</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Volunteer</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    placeholder="John Doe"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="you@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Volunteer Account'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="organizer">
              <form onSubmit={handleOrganizerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Your Full Name</Label>
                  <Input
                    id="org-name"
                    placeholder="John Doe"
                    value={organizerForm.fullName}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Your Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    placeholder="you@example.com"
                    value={organizerForm.email}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-password">Password</Label>
                  <Input
                    id="org-password"
                    type="password"
                    placeholder="••••••••"
                    value={organizerForm.password}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization-name">Organization Name</Label>
                  <Input
                    id="organization-name"
                    placeholder="Community Helpers"
                    value={organizerForm.organizationName}
                    onChange={(e) =>
                      setOrganizerForm({ ...organizerForm, organizationName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Organization Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="contact@organization.org"
                    value={organizerForm.contactEmail}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, contactEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Organization Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your organization..."
                    value={organizerForm.description}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                  Your organizer account will be reviewed by our admin team before you can post events.
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Organizer Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
