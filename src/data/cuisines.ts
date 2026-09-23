import type { Cuisine } from './types';

/** table: cuisines — finer-grained than districts (a district groups several). */
export const cuisines: Cuisine[] = [
  { id: 'cui-north-indian', name: 'North Indian', icon: '🥘', description: 'Slow-cooked gravies, buttery naan and tandoori roasts' },
  { id: 'cui-south-indian', name: 'South Indian', icon: '🥞', description: 'Crisp dosas, fluffy idlis, tangy sambar and coconut chutney' },
  { id: 'cui-mughlai', name: 'Mughlai', icon: '🍖', description: 'Saffron biryanis, shahi kormas and slow-grilled kebabs' },
  { id: 'cui-street-chaat', name: 'Chaat & Street Food', icon: '🥣', description: 'Assembled to order — sharp, sweet, sour, loud' },
  { id: 'cui-chinese', name: 'Chinese', icon: '🥢', description: 'Wok-tossed noodles, Manchurian bowls and steamed dim sum' },
  { id: 'cui-thai', name: 'Thai', icon: '🥥', description: 'Lemongrass broths, green curries and pad thai' },
  { id: 'cui-japanese', name: 'Japanese', icon: '🍜', description: 'Tonkotsu ramen, handmade gyoza and crisp tempura' },
  { id: 'cui-korean', name: 'Korean', icon: '🌶️', description: 'Table-grilled meats, bubbling stews and kimchi' },
  { id: 'cui-italian', name: 'Italian', icon: '🍝', description: 'Hand-rolled pasta, slow ragù and fresh basil pesto' },
  { id: 'cui-pizza', name: 'Pizza', icon: '🍕', description: 'Neapolitan bases blistered in a wood-fired oven' },
  { id: 'cui-mexican', name: 'Mexican', icon: '🌮', description: 'Stone-ground corn tacos, fresh guacamole and sizzling fajitas' },
  { id: 'cui-tex-mex', name: 'Tex-Mex', icon: '🌯', description: 'Loaded burritos, queso nachos and chipotle bowls' },
  { id: 'cui-desserts', name: 'Desserts', icon: '🍰', description: 'Glazed choux, layered entremets and artisanal cakes' },
  { id: 'cui-bakery', name: 'Bakery', icon: '🥐', description: 'Laminated pastry, sourdough and morning buns' },
  { id: 'cui-ice-cream', name: 'Ice Cream', icon: '🍨', description: 'Slow-churned gelato, sundaes and warm waffles' },
  { id: 'cui-burgers', name: 'Burgers', icon: '🍔', description: 'Smash patties, brioche buns and crisp fries' },
  { id: 'cui-bbq', name: 'BBQ & Grill', icon: '🍖', description: 'Low-and-slow pit smoking and open-flame grills' },
  { id: 'cui-salads', name: 'Salads & Bowls', icon: '🥗', description: 'Grain bowls, leaves picked the same morning' },
  { id: 'cui-vegan', name: 'Plant-Based', icon: '🌱', description: 'Wholly plant-based cooking that is not an afterthought' },
  { id: 'cui-juices', name: 'Juices & Smoothies', icon: '🥤', description: 'Cold-pressed juice, smoothies and tonics' },
];
