import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('enquiries').insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      toast({
        title: 'Message sent!',
        description: 'We will get back to you within 24 hours.',
      });

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-r from-rich-black via-charcoal to-rich-black">
        <div className="container mx-auto px-4 text-center">
          <span className="text-gold-light text-sm uppercase tracking-[0.3em]">Get in Touch</span>
          <h1 className="font-serif text-4xl md:text-5xl text-ivory font-semibold mt-2 mb-4">
            Contact Us
          </h1>
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Have questions about our collections? Need help with an order? 
            Our team is here to assist you.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Call Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="tel:+919843010986" className="text-lg hover:text-primary transition-colors">
                    +91 98430 10986
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Mon-Sun, 10AM-9PM</p>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="mailto:info@krtjewels.com" className="text-lg hover:text-primary transition-colors">
                    info@krtjewels.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">We reply within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Visit Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    1154, Big Bazaar St, Prakasam,<br />
                    Town Hall, Coimbatore,<br />
                    Tamil Nadu 641001
                  </p>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Store Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monday - Sunday<br />
                    10:00 AM - 9:00 PM
                  </p>
                </CardContent>
              </Card>

              {/* WhatsApp CTA */}
              <Button
                onClick={() => window.open('https://wa.me/919843010986', '_blank')}
                className="w-full py-6 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Button>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-luxury">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="input-luxury"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="input-luxury"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="input-luxury"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="input-luxury"
                          placeholder="What is this about?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="input-luxury min-h-[150px]"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-premium w-full py-6 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
