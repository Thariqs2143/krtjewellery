import { Instagram, ExternalLink } from 'lucide-react';

// Static Instagram posts - in production, you'd use Instagram Basic Display API
// Note: Instagram API requires authentication and business account
const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    likes: '2.4k',
    caption: 'Stunning diamond necklace ✨',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop',
    likes: '1.8k',
    caption: 'Traditional gold bangles 💛',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
    likes: '3.1k',
    caption: 'Bridal collection highlights 💍',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
    likes: '1.5k',
    caption: 'Pearl elegance 🤍',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
    likes: '2.9k',
    caption: 'Temple jewellery art 🙏',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    likes: '2.2k',
    caption: 'New arrivals! 🌟',
  },
];

export function InstagramFeed() {
  const instagramUrl = 'https://www.instagram.com/krtjewellers/';

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium mb-3">
            <span className="w-8 h-px bg-primary" />
            Follow Us
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold section-heading mb-6">
            @krtjewellers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our community of jewellery lovers. Tag us in your photos for a chance to be featured!
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={post.image}
                alt={post.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-rich-black/0 group-hover:bg-rich-black/60 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-ivory text-center">
                  <Instagram className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{post.likes} likes</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Follow Button */}
        <div className="text-center mt-10">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Instagram className="w-5 h-5" />
            Follow @krtjewellers
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
