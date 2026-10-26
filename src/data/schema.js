// Shared JSON-LD structured data. Imported by pages that need Organization/Person schema
// (homepage + about page per the brief). Keep contact details in sync with Footer.astro.

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://futureforth.com/#organization',
  name: 'Futureforth',
  legalName: 'Futureforth LLC',
  url: 'https://futureforth.com',
  logo: 'https://futureforth.com/images/logo.png',
  image: 'https://futureforth.com/images/og-default.jpg',
  telephone: '+1-615-823-1608',
  email: 'info@futureforth.com',
  description:
    'Futureforth is the Nashville parent company behind keynote speaker and communication coach Dave Delaney, the ADHD Wise Squirrels podcast, and 10X Conference Coaching.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2517 Lebanon Road',
    addressLocality: 'Nashville',
    addressRegion: 'TN',
    addressCountry: 'US',
  },
  sameAs: [
    'https://linkedin.com/in/davedelaney',
    'https://instagram.com/davedelaney',
    'https://www.youtube.com/@davedelaneyspeaks',
  ],
  founder: {
    '@id': 'https://futureforth.com/about#dave',
  },
};

export const daveDelaneyPersonSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://futureforth.com/about#dave',
  name: 'Dave Delaney',
  jobTitle: 'Keynote Speaker, Communication Strategist & Coach',
  url: 'https://futureforth.com/about#dave',
  image: 'https://futureforth.com/images/dave-headshot.jpg',
  worksFor: {
    '@id': 'https://futureforth.com/#organization',
  },
  sameAs: [
    'https://linkedin.com/in/davedelaney',
    'https://instagram.com/davedelaney',
    'https://www.youtube.com/@davedelaneyspeaks',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nashville',
    addressRegion: 'TN',
    addressCountry: 'US',
  },
};
