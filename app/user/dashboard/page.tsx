"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { profile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchUserEvents();
    }
  }, [profile]);

  const fetchUserEvents = async () => {
    if (!profile) return;

    const { data: upcoming } = await supabase
      .from('event_participants')
      .select(`*, event:events(*, category:categories(*), organizer:organizers(*))`)
      .eq('user_id', profile.id)
      .eq('status', 'joined')
      .gte('event.event_date', new Date().toISOString())
      .order('event.event_date', { ascending: true });

    const { data: past } = await supabase
      .from('event_participants')
      .select(`*, event:events(*, category:categories(*))`)
      .eq('user_id', profile.id)
      .in('status', ['completed', 'joined'])
      .lt('event.event_date', new Date().toISOString())
      .order('event.event_date', { ascending: false })
      .limit(5);

    setUpcomingEvents(upcoming || []);
    setPastEvents(past || []);
    setLoading(false);
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your volunteer journey</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Clock className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Events Completed</CardTitle>
                <Trophy className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pastEvents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hours Volunteered</CardTitle>
                <Calendar className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pastEvents.length * 3}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you've registered for</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((participation) => (
                    <div
                      key={participation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{participation.event.title}</h3>
                          <Badge variant="outline">{participation.event.category.name}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(participation.event.event_date), 'MMM dd, yyyy • h:mm a')}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {participation.event.location}
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/events/${participation.event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't joined any events yet.</p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>Your volunteer history</CardDescription>
            </CardHeader>
            <CardContent>
              {pastEvents.length > 0 ? (
                <div className="space-y-3">
                  {pastEvents.map((participation) => (
                    <div key={participation.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{participation.event.title}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(participation.event.event_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No past events yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
