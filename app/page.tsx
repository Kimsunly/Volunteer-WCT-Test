"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { supabase, Event, Category } from '@/lib/supabase';
import { Calendar, MapPin, Users, ArrowRight, Leaf, BookOpen, HeartPulse, UsersIcon, Dog, Palette } from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons: Record<string, any> = {
  leaf: Leaf,
  'book-open': BookOpen,
  'heart-pulse': HeartPulse,
  users: UsersIcon,
  dog: Dog,
  palette: Palette,
};

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<(Event & { category: Category; organizer: any })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        *,
        category:categories(*),
        organizer:organizers(*, profiles(*))
      `)
      .eq('status', 'approved')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(6);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (eventsData) setFeaturedEvents(eventsData as any);
    if (categoriesData) setCategories(categoriesData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect. Volunteer. <span className="text-blue-600">Make a Difference.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of volunteers making an impact in their communities. Find meaningful opportunities
              that match your passions and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/register">Join Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/events">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Getting started is easy. Follow these simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your free account and tell us about your interests and availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Events</h3>
              <p className="text-gray-600">
                Browse volunteer opportunities that match your passions and schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make an Impact</h3>
              <p className="text-gray-600">
                Join events and start making a real difference in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600">Discover upcoming volunteer opportunities near you</p>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-400 relative overflow-hidden">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Badge className="absolute top-4 right-4">
                      {event.category.name}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.event_date), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.volunteers_needed} volunteers needed
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && featuredEvents.length === 0 && (
            <p className="text-center text-gray-500">No upcoming events available at the moment.</p>
          )}
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Categories</h2>
            <p className="text-gray-600">Find opportunities in areas you care about</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon || 'users'] || UsersIcon;
              return (
                <Link
                  key={category.id}
                  href={`/events?category=${category.id}`}
                  className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                    <IconComponent className="h-6 w-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">1,000+</div>
                <div className="text-blue-100">Active Volunteers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Events Organized</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-100">Partner Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Volunteers Say</h2>
            <p className="text-gray-600">Hear from our community members</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "This platform made it so easy to find volunteering opportunities that align with my
                  schedule and interests. I've made lasting connections and truly feel like I'm making a
                  difference."
                </p>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Regular Volunteer</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "As an organizer, this platform has been invaluable. It connects us with passionate
                  volunteers and makes event management seamless. Highly recommend!"
                </p>
                <div className="font-semibold">Michael Chen</div>
                <div className="text-sm text-gray-500">Event Organizer</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "I love how diverse the opportunities are. Whether it's environmental work or community
                  outreach, there's something for everyone. It's transformed how I give back."
                </p>
                <div className="font-semibold">Emily Rodriguez</div>
                <div className="text-sm text-gray-500">Active Volunteer</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
