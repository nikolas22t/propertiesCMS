// Placeholder demo listings (fictional).
const img = n => `https://picsum.photos/seed/prop${n}/800/500`;
module.exports = [
  { id: 1, title: 'Modern 3-Bedroom Villa with Pool', type: 'Villa', status: 'sale', price: 450000, city: 'Coastal Town', bedrooms: 3, bathrooms: 2, area: 180, featured: true, description: 'Bright contemporary villa with private pool, open-plan living and sea views.', images: [img(1), img(2)], createdAt: '2026-01-10' },
  { id: 2, title: 'City Centre 2-Bedroom Apartment', type: 'Apartment', status: 'rent', price: 1200, city: 'Capital City', bedrooms: 2, bathrooms: 1, area: 85, featured: true, description: 'Renovated apartment close to shops, transport and amenities.', images: [img(3)], createdAt: '2026-02-01' },
  { id: 3, title: 'Family House with Garden', type: 'House', status: 'sale', price: 320000, city: 'Hill Village', bedrooms: 4, bathrooms: 3, area: 210, featured: false, description: 'Spacious detached house with large garden and covered parking.', images: [img(4)], createdAt: '2026-02-15' },
  { id: 4, title: 'Residential Building Plot', type: 'Land', status: 'sale', price: 95000, city: 'Hill Village', bedrooms: 0, bathrooms: 0, area: 600, featured: false, description: 'Level plot with planning permission for a residential home.', images: [img(5)], createdAt: '2026-03-01' },
  { id: 5, title: 'Studio near the Beach', type: 'Apartment', status: 'rent', price: 650, city: 'Coastal Town', bedrooms: 0, bathrooms: 1, area: 40, featured: true, description: 'Furnished studio a short walk from the beach.', images: [img(6)], createdAt: '2026-03-20' }
];
