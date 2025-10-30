"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, Building, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, organizers: 0, events: 0, categories: 0 });
  const [pendingOrganizers, setPendingOrganizers] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [usersCount, organizersCount, eventsCount, categoriesCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('organizers').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      users: usersCount.count || 0,
      organizers: organizersCount.count || 0,
      events: eventsCount.count || 0,
      categories: categoriesCount.count || 0,
    });

    const { data: pendingOrgs } = await supabase
      .from('organizers')
      .select('*, profiles(*)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    const { data: pendingEvts } = await supabase
      .from('events')
      .select('*, organizer:organizers(organization_name), category:categories(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setPendingOrganizers(pendingOrgs || []);
    setPendingEvents(pendingEvts || []);
    setLoading(false);
  };

  const handleOrganizerAction = async (organizerId: string, action: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('organizers')
      .update({ verification_status: action, verified_at: new Date().toISOString() })
      .eq('id', organizerId);

    if (error) {
      toast.error('Failed to update organizer');
    } else {
      toast.success(`Organizer ${action}`);
      fetchData();
    }
  };

  const handleEventAction = async (eventId: string, action: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('events')
      .update({ status: action, approved_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) {
      toast.error('Failed to update event');
    } else {
      toast.success(`Event ${action}`);
      fetchData();
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage platform operations</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Organizers</CardTitle>
                <Building className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.organizers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrganizers.length + pendingEvents.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="organizers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="organizers">
                Pending Organizers ({pendingOrganizers.length})
              </TabsTrigger>
              <TabsTrigger value="events">Pending Events ({pendingEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="organizers">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : pendingOrganizers.length > 0 ? (
                    <div className="space-y-4">
                      {pendingOrganizers.map((org) => (
                        <div key={org.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{org.organization_name}</h3>
                              <p className="text-sm text-gray-600">{org.profiles.full_name}</p>
                              <p className="text-sm text-gray-500">{org.contact_email}</p>
                            </div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          {org.description && (
                            <p className="text-sm text-gray-700 mb-3">{org.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mb-3">
                            Applied: {format(new Date(org.created_at), 'MMM dd, yyyy')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOrganizerAction(org.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOrganizerAction(org.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No pending organizer verifications</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Event Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : pendingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {pendingEvents.map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm text-gray-600">By: {event.organizer.organization_name}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(event.event_date), 'MMM dd, yyyy • h:mm a')} • {event.location}
                              </p>
                            </div>
                            <Badge variant="secondary">{event.category.name}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEventAction(event.id, 'approved')}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEventAction(event.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No pending event approvals</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
