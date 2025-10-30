"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { supabase, Event, Category } from '@/lib/supabase';
import { Calendar, MapPin, Users, CheckCircle, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState<(Event & { category: Category; organizer: any }) | null>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [params.id, user]);

  const fetchEvent = async () => {
    const { data: eventData } = await supabase
      .from('events')
      .select(`*, category:categories(*), organizer:organizers(*, profiles(*))`)
      .eq('id', params.id)
      .maybeSingle();

    if (eventData) {
      setEvent(eventData as any);

      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', params.id)
        .eq('status', 'joined');

      setParticipantsCount(count || 0);

      if (user) {
        const { data: participation } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', params.id)
          .eq('user_id', user.id)
          .eq('status', 'joined')
          .maybeSingle();

        setHasJoined(!!participation);
      }
    }

    setLoading(false);
  };

  const handleJoinEvent = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setJoining(true);

    const { error } = await supabase.from('event_participants').insert({
      event_id: params.id as string,
      user_id: user.id,
      status: 'joined',
    });

    if (error) {
      toast.error('Failed to join event');
    } else {
      toast.success('Successfully joined the event!');
      setHasJoined(true);
      setParticipantsCount((prev) => prev + 1);
    }

    setJoining(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <Button asChild>
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/events">&larr; Back to Events</Link>
            </Button>
          </div>

          <div className="h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg overflow-hidden mb-6">
            {event.image_url && (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
                  <Badge>{event.category.name}</Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{format(new Date(event.event_date), 'EEEE, MMMM dd, yyyy • h:mm a')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>
                      {participantsCount} / {event.volunteers_needed} volunteers joined
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  {hasJoined ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="font-semibold text-green-600 mb-2">You're Registered!</p>
                      <p className="text-sm text-gray-600">We'll see you at the event.</p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleJoinEvent}
                      disabled={joining || participantsCount >= event.volunteers_needed}
                      className="w-full"
                      size="lg"
                    >
                      {joining ? 'Joining...' : participantsCount >= event.volunteers_needed ? 'Event Full' : 'Join This Event'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Organized By
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={event.organizer.profiles.profile_image || ''} />
                      <AvatarFallback>{event.organizer.organization_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{event.organizer.organization_name}</div>
                      <div className="text-sm text-gray-500">{event.organizer.contact_email}</div>
                    </div>
                  </div>
                  {event.organizer.description && (
                    <p className="text-sm text-gray-600 mt-4">{event.organizer.description}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
