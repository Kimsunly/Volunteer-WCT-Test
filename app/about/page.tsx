import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About VolunteerHub</h1>
          <p className="text-lg text-gray-600">Connecting volunteers with meaningful opportunities</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg mb-12">
            <p className="text-gray-700 text-lg leading-relaxed">
              VolunteerHub is a platform dedicated to connecting passionate volunteers with organizations
              that need their help. We believe that everyone has the power to make a positive impact in their
              community, and we're here to make that process as easy and rewarding as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To create a world where volunteering is accessible, impactful, and celebrated. We connect
                  people who want to make a difference with organizations that need support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  A thriving community where every person can easily find and participate in volunteer
                  opportunities that align with their passions and skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-blue-600 fill-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                <p className="text-gray-600">
                  Community, compassion, and commitment drive everything we do. We believe in the power of
                  collective action and the ripple effect of individual kindness.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2024, VolunteerHub was born from a simple observation: there are countless people
              who want to volunteer and countless organizations that need volunteers, but connecting them
              was often complicated and time-consuming.
            </p>
            <p className="text-gray-700 mb-4">
              We set out to build a platform that would make volunteering as simple as possible. Today,
              we're proud to serve thousands of volunteers and hundreds of organizations, facilitating
              meaningful connections that create real impact in communities around the world.
            </p>
            <p className="text-gray-700">
              Whether you're looking to give back, develop new skills, meet like-minded people, or make a
              tangible difference in your community, VolunteerHub is here to support your journey.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Join Our Community</h2>
            <p className="text-gray-600 mb-8">
              Ready to start making a difference? Join thousands of volunteers who are already creating
              positive change in their communities.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
