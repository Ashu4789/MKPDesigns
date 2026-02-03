import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { sendContactMessage } = await import('../services/api');
      await sendContactMessage(formData);

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      detail: 'nationalacdashboard2025@gmail.com',
      link: 'mailto:nationalacdashboard2025@gmail.com',
      color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      detail: '+91 93488 25087',
      link: 'tel:+919348825087',
      color: 'bg-blue-500/15 text-blue-400 border border-blue-500/40'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Address',
      detail: 'MKP Designs, Sambalpur, Odisha, India',
      link: null,
      color: 'bg-red-500/15 text-red-400 border border-red-500/40'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Working Hours',
      detail: 'Mon - Fri: 9:00 AM - 6:00 PM',
      link: null,
      color: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40'
    }
  ];

  const faqs = [
    {
      question: 'What architectural services do you provide?',
      answer: 'MKP Designs provides a full suite of services including residential and commercial architecture, interior design, landscape planning, and structural consultancy.'
    },
    {
      question: 'How long does a typical design project take?',
      answer: 'The timeline varies based on project scale. A residential design typically takes 4-8 weeks from the initial concept to final construction drawings.'
    },
    {
      question: 'Do you assist with building permits and local approvals?',
      answer: 'Yes, we handle the preparation of all necessary drawings and documentation required for municipal approvals and building permits.'
    },
    {
      question: 'Can I see your previous work?',
      answer: 'Certainly! You can explore our portfolio section on this website to see our completed projects across various categories.'
    }
  ];

  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="bg-card border-b border-border py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-muted-foreground mt-3">
            We're here to help with your queries and feedback.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, i) => (
            <div
              key={i}
              className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl p-6 hover:-translate-y-1 transition hover:border-border"
            >
              <div className={`${info.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {info.icon}
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{info.title}</h3>
              {info.link ? (
                <a href={info.link} className="text-primary hover:underline text-sm">
                  {info.detail}
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">{info.detail}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
            </div>

            {submitted && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 px-4 py-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Your message has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input name="name" value={formData.name} onChange={handleChange} required
                placeholder="Full Name *"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />

              <input name="email" value={formData.email} onChange={handleChange} required
                placeholder="Email *"
                type="email"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />

              <input name="subject" value={formData.subject} onChange={handleChange} required
                placeholder="Subject *"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />

              <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                placeholder="Your Message *"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ + Map */}
          <div>
            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>

              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-border/50 pb-5">
                    <h3 className="font-semibold mb-1 text-foreground">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-foreground">Visit Us</h3>
              <div className="w-full h-64 rounded-lg overflow-hidden border border-border/50">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118864.48530412854!2d83.89184424335938!3d21.48757040000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a21167f047050d7%3A0x65c00d6364747fd5!2sSambalpur%2C%20Odisha!5e0!3m2!1sen!2sin!4v1710345678901!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Support Banner */}
        <div className="mt-16 bg-card border border-border rounded-xl p-8 text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Need Immediate Assistance?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is available during business hours to support you
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <a href="tel:+919348825087"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary/20">
              Call Now
            </a>

            <a href="mailto:nationalacdashboard2025@gmail.com"
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-full font-semibold">
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
