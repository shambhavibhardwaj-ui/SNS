import type { Cuisine } from './types';

/** table: cuisines — finer-grained than districts (a district groups several). */
export const cuisines: Cuisine[] = [
  { id: 'cui-north-indian', name: 'North Indian' },
  { id: 'cui-south-indian', name: 'South Indian' },
  { id: 'cui-street-chaat', name: 'Chaat & Street Food' },
  { id: 'cui-chinese', name: 'Chinese' },
  { id: 'cui-thai', name: 'Thai' },
  { id: 'cui-japanese', name: 'Japanese' },
  { id: 'cui-korean', name: 'Korean' },
  { id: 'cui-italian', name: 'Italian' },
  { id: 'cui-pizza', name: 'Pizza' },
  { id: 'cui-mexican', name: 'Mexican' },
  { id: 'cui-tex-mex', name: 'Tex-Mex' },
  { id: 'cui-desserts', name: 'Desserts' },
  { id: 'cui-bakery', name: 'Bakery' },
  { id: 'cui-ice-cream', name: 'Ice Cream' },
  { id: 'cui-burgers', name: 'Burgers' },
  { id: 'cui-bbq', name: 'BBQ & Grill' },
];
