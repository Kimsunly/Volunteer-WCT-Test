"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { supabase, Category } from '@/lib/supabase';
import { Plus, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [organizer, setOrganizer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    event_date: '',
    location: '',
    volunteers_needed: '10',
    image_url: '',
  });

  useEffect(() => {
    if (profile) {
      fetchOrganizerData();
    }
  }, [profile]);

  const fetchOrganizerData = async () => {
    if (!profile) return;

    const { data: organizerData } = await supabase
      .from('organizers')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    setOrganizer(organizerData);

    if (organizerData) {
      const { data: eventsData } = await supabase
        .from('events')
        .select(`*, category:categories(*)`)
        .eq('organizer_id', organizerData.id)
        .order('event_date', { ascending: true });

      setEvents(eventsData || []);
    }

    const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
    setCategories(categoriesData || []);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizer) return;

    const { error } = await supabase.from('events').insert({
      ...formData,
      organizer_id: organizer.id,
      volunteers_needed: parseInt(formData.volunteers_needed),
    });

    if (error) {
      toast.error('Failed to create event');
    } else {
      toast.success('Event created! Awaiting admin approval.');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category_id: '',
        event_date: '',
        location: '',
        volunteers_needed: '10',
        image_url: '',
      });
      fetchOrganizerData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <ProtectedRoute allowedRoles={['organizer']}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Organizer Profile Not Found</CardTitle>
                <CardDescription>Please complete your organizer registration.</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const pendingEvents = events.filter((e) => e.status === 'pending');
  const approvedEvents = events.filter((e) => e.status === 'approved');
  const totalVolunteers = events.reduce((acc, e) => acc + (e.participants_count || 0), 0);

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organizer.organization_name}</h1>
                <p className="text-gray-600 mt-2">Organizer Dashboard</p>
              </div>
              {organizer.verification_status === 'approved' && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>Fill in the details for your volunteer event</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="volunteers">Volunteers Needed</Label>
                          <Input
                            id="volunteers"
                            type="number"
                            min="1"
                            value={formData.volunteers_needed}
                            onChange={(e) => setFormData({ ...formData, volunteers_needed: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_date">Event Date & Time</Label>
                        <Input
                          id="event_date"
                          type="datetime-local"
                          value={formData.event_date}
                          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL (optional)</Label>
                        <Input
                          id="image_url"
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full">Create Event</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {organizer.verification_status !== 'approved' && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Verification {organizer.verification_status === 'pending' ? 'Pending' : 'Required'}</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      {organizer.verification_status === 'pending'
                        ? 'Your organizer account is under review. You\'ll be able to create events once approved.'
                        : 'Your organizer account needs verification before you can create events.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingEvents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVolunteers}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Events</CardTitle>
              <CardDescription>Manage your volunteer events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant={event.status === 'approved' ? 'default' : event.status === 'pending' ? 'secondary' : 'destructive'}>
                            {event.status}
                          </Badge>
                          <Badge variant="outline">{event.category.name}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(event.event_date), 'MMM dd, yyyy • h:mm a')} • {event.location}
                        </div>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No events created yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
