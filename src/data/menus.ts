/**
 * Menus and menu items.
 *
 * The rule this file exists to enforce: **a restaurant offers several cuisines,
 * and each one gets its own menu. Menus are never merged.** That is the core
 * requirement of the brief, so it is built into the shape of the data rather
 * than left to the UI to respect — there is one `Menu` row per
 * (restaurant, cuisine) pair, and every `MenuItem` belongs to exactly one of
 * them. Nothing here can produce a combined list even by accident.
 *
 * Items come from a per-cuisine catalogue rather than being written out 67
 * times. That is not a shortcut around the requirement, it is the requirement:
 * a cuisine has characteristic dishes, and what differs between two kitchens
 * cooking the same cuisine is price and a signature or two, not the whole card.
 * Restaurants differ by:
 *
 *   - price band — a ₹₹₹ kitchen charges more for the same dish;
 *   - signatures — a house dish that appears on no other menu;
 *   - a deterministic omission, so no two cards are identical.
 *
 * When this moves to Supabase, `menus` and `menuItems` become two tables and
 * the catalogue disappears into seed rows. Nothing above the service changes.
 */
import { restaurants, restaurantCuisines } from './restaurants';
import type { ID, Menu, MenuItem } from './types';

interface CatalogueItem {
  name: string;
  description: string;
  /** Base rupee price at a ₹₹ kitchen; scaled per restaurant below. */
  price: number;
  category: string;
  isVeg: boolean;
  isSpicy?: boolean;
}

/* ------------------------------------------------------------- catalogue -- */

const CATALOGUE: Record<ID, CatalogueItem[]> = {
  'cui-north-indian': [
    { name: 'Dal Makhani', description: 'Black lentils simmered overnight with butter and cream', price: 320, category: 'Main Course', isVeg: true },
    { name: 'Paneer Butter Masala', description: 'Cottage cheese in a tomato and cashew gravy', price: 360, category: 'Main Course', isVeg: true },
    { name: 'Butter Chicken', description: 'Tandoori chicken folded into a slow-reduced makhani sauce', price: 430, category: 'Main Course', isVeg: false },
    { name: 'Rogan Josh', description: 'Kashmiri lamb curry, deep red from ratan jot', price: 490, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Tandoori Chicken (Half)', description: 'Yoghurt and spice marinade, charred in the clay oven', price: 380, category: 'From the Tandoor', isVeg: false, isSpicy: true },
    { name: 'Paneer Tikka', description: 'Skewered cottage cheese with peppers and onion', price: 340, category: 'From the Tandoor', isVeg: true },
    { name: 'Garlic Naan', description: 'Leavened flatbread, garlic and coriander', price: 90, category: 'Breads', isVeg: true },
    { name: 'Laccha Paratha', description: 'Layered wholewheat paratha, pulled apart at the table', price: 80, category: 'Breads', isVeg: true },
    { name: 'Jeera Rice', description: 'Basmati tempered with cumin', price: 190, category: 'Rice', isVeg: true },
  ],
  'cui-mughlai': [
    { name: 'Chicken Biryani', description: 'Sealed dum biryani, saffron and fried onion', price: 450, category: 'Biryani', isVeg: false, isSpicy: true },
    { name: 'Mutton Biryani', description: 'Long-grain rice layered with slow-cooked mutton', price: 560, category: 'Biryani', isVeg: false, isSpicy: true },
    { name: 'Vegetable Dum Biryani', description: 'Seasonal vegetables, whole spices, sealed and baked', price: 380, category: 'Biryani', isVeg: true },
    { name: 'Chicken Shahi Korma', description: 'Mild almond and cream gravy, finished with kewra', price: 470, category: 'Main Course', isVeg: false },
    { name: 'Seekh Kebab', description: 'Minced lamb on the skewer, charcoal-grilled', price: 420, category: 'Kebabs', isVeg: false, isSpicy: true },
    { name: 'Galouti Kebab', description: 'Melt-in-the-mouth patties, served with warqi paratha', price: 480, category: 'Kebabs', isVeg: false },
    { name: 'Sheermal', description: 'Saffron-sweetened flatbread', price: 110, category: 'Breads', isVeg: true },
  ],
  'cui-street-chaat': [
    { name: 'Pani Puri (6 pc)', description: 'Hollow puris, spiced water poured to order', price: 120, category: 'Chaat', isVeg: true, isSpicy: true },
    { name: 'Sev Puri', description: 'Crisp puris, chutneys, potato and a shower of sev', price: 140, category: 'Chaat', isVeg: true },
    { name: 'Dahi Puri', description: 'Cooled with whisked yoghurt and tamarind', price: 150, category: 'Chaat', isVeg: true },
    { name: 'Vada Pav', description: 'Potato fritter in a soft pav with dry garlic chutney', price: 70, category: 'Street Plates', isVeg: true, isSpicy: true },
    { name: 'Pav Bhaji', description: 'Mashed vegetable bhaji, butter-toasted pav', price: 200, category: 'Street Plates', isVeg: true },
    { name: 'Aloo Tikki Chaat', description: 'Griddled potato patties under chutney and yoghurt', price: 160, category: 'Chaat', isVeg: true, isSpicy: true },
  ],
  'cui-south-indian': [
    { name: 'Sambar Rice', description: 'Rice folded through lentil and tamarind sambar', price: 180, category: 'Rice', isVeg: true },
    { name: 'Curd Rice', description: 'Set curd, rice, mustard and curry leaf tempering', price: 160, category: 'Rice', isVeg: true },
    { name: 'Lemon Rice', description: 'Turmeric, peanut and lemon, tempered fresh', price: 170, category: 'Rice', isVeg: true },
    { name: 'Rasam', description: 'Peppery tamarind broth, drunk or poured over rice', price: 120, category: 'Soups', isVeg: true, isSpicy: true },
    { name: 'Avial', description: 'Mixed vegetables in coconut and yoghurt', price: 220, category: 'Main Course', isVeg: true },
    { name: 'Kerala Fish Curry', description: 'Kokum-soured coconut curry', price: 390, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Chettinad Chicken', description: 'Roasted spice paste, black pepper forward', price: 420, category: 'Main Course', isVeg: false, isSpicy: true },
  ],
  'cui-dosa': [
    { name: 'Masala Dosa', description: 'Fermented crepe, potato masala, chutney and sambar', price: 180, category: 'Dosa', isVeg: true },
    { name: 'Plain Dosa', description: 'Batter ground overnight, griddled thin', price: 140, category: 'Dosa', isVeg: true },
    { name: 'Mysore Masala Dosa', description: 'Red chilli chutney spread inside', price: 200, category: 'Dosa', isVeg: true, isSpicy: true },
    { name: 'Ghee Roast', description: 'Crisp and lacquered with ghee, nearly a foot across', price: 220, category: 'Dosa', isVeg: true },
    { name: 'Idli (2 pc)', description: 'Steamed rice cakes, sambar and two chutneys', price: 120, category: 'Steamed', isVeg: true },
    { name: 'Medu Vada (2 pc)', description: 'Lentil doughnuts, crisp outside and soft within', price: 130, category: 'Steamed', isVeg: true },
    { name: 'Rava Kesari', description: 'Semolina, ghee and saffron', price: 110, category: 'Sweet', isVeg: true },
  ],
  'cui-filter-coffee': [
    { name: 'Filter Coffee', description: 'Decoction and hot milk, pulled between two tumblers', price: 70, category: 'Coffee', isVeg: true },
    { name: 'Strong Filter Coffee', description: 'Double decoction, less milk', price: 80, category: 'Coffee', isVeg: true },
    { name: 'Masala Chai', description: 'Ginger, cardamom and clove, boiled through', price: 60, category: 'Tea', isVeg: true },
    { name: 'Badam Milk', description: 'Almond and saffron, served hot or cold', price: 110, category: 'Cold', isVeg: true },
    { name: 'Rose Milk', description: 'Chilled milk with rose syrup', price: 100, category: 'Cold', isVeg: true },
  ],
  'cui-sichuan': [
    { name: 'Mapo Tofu', description: 'Silken tofu, fermented bean and numbing peppercorn', price: 340, category: 'Main Course', isVeg: true, isSpicy: true },
    { name: 'Kung Pao Chicken', description: 'Dried chilli, peanuts and scallion', price: 410, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Dry Fried Green Beans', description: 'Blistered in the wok with preserved vegetable', price: 290, category: 'Vegetables', isVeg: true, isSpicy: true },
    { name: 'Chilli Oil Wontons', description: 'Pork wontons under red oil and black vinegar', price: 320, category: 'Small Plates', isVeg: false, isSpicy: true },
    { name: 'Twice-Cooked Pork', description: 'Boiled, sliced, then returned to a hot wok', price: 450, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Dan Dan Noodles', description: 'Sesame, chilli and minced pork', price: 330, category: 'Noodles', isVeg: false, isSpicy: true },
  ],
  'cui-cantonese': [
    { name: 'Roast Duck (Quarter)', description: 'Lacquered skin, hung and carved to order', price: 520, category: 'Roast Meats', isVeg: false },
    { name: 'Char Siu', description: 'Honey-glazed barbecued pork', price: 460, category: 'Roast Meats', isVeg: false },
    { name: 'Steamed Sea Bass', description: 'Ginger, spring onion and hot oil poured over', price: 620, category: 'Main Course', isVeg: false },
    { name: 'Clay Pot Tofu', description: 'Braised with mushroom and greens', price: 310, category: 'Main Course', isVeg: true },
    { name: 'Hakka Noodles', description: 'Tossed with julienned vegetables', price: 280, category: 'Noodles', isVeg: true },
    { name: 'Chicken Fried Rice', description: 'Wok-tossed over high heat, egg and scallion', price: 300, category: 'Rice', isVeg: false },
    { name: 'Wonton Soup', description: 'Clear stock, pork and prawn wontons', price: 260, category: 'Soups', isVeg: false },
  ],
  'cui-dim-sum': [
    { name: 'Har Gow (4 pc)', description: 'Prawn dumplings in a translucent wrapper', price: 320, category: 'Steamed', isVeg: false },
    { name: 'Siu Mai (4 pc)', description: 'Open-topped pork and prawn dumplings', price: 300, category: 'Steamed', isVeg: false },
    { name: 'Vegetable Crystal Dumplings (4 pc)', description: 'Water chestnut, carrot and coriander', price: 280, category: 'Steamed', isVeg: true },
    { name: 'Char Siu Bao (3 pc)', description: 'Fluffy buns filled with barbecued pork', price: 290, category: 'Buns', isVeg: false },
    { name: 'Spring Rolls (4 pc)', description: 'Fried to order, sweet chilli on the side', price: 240, category: 'Fried', isVeg: true },
    { name: 'Turnip Cake', description: 'Pan-fried until the edges catch', price: 260, category: 'Fried', isVeg: true },
  ],
  'cui-italian': [
    { name: 'Tagliatelle al Ragù', description: 'Four-hour beef ragù, hand-cut ribbons', price: 520, category: 'Pasta', isVeg: false },
    { name: 'Cacio e Pepe', description: 'Pecorino and cracked black pepper, nothing else', price: 440, category: 'Pasta', isVeg: true },
    { name: 'Pesto Genovese', description: 'Basil pounded with pine nuts and parmesan', price: 460, category: 'Pasta', isVeg: true },
    { name: 'Lasagne al Forno', description: 'Layered with béchamel, baked until the top crisps', price: 540, category: 'Baked', isVeg: false },
    { name: 'Melanzane alla Parmigiana', description: 'Aubergine, tomato and mozzarella, baked', price: 480, category: 'Baked', isVeg: true },
    { name: 'Bruschetta al Pomodoro', description: 'Grilled bread, tomato, garlic and basil', price: 260, category: 'Antipasti', isVeg: true },
    { name: 'Burrata with Tomatoes', description: 'Torn by hand, olive oil and sea salt', price: 420, category: 'Antipasti', isVeg: true },
  ],
  'cui-pizza': [
    { name: 'Margherita', description: 'San Marzano, fior di latte, basil', price: 420, category: 'Pizza', isVeg: true },
    { name: 'Marinara', description: 'Tomato, garlic, oregano — no cheese', price: 360, category: 'Pizza', isVeg: true },
    { name: 'Diavola', description: 'Spicy salami and chilli', price: 520, category: 'Pizza', isVeg: false, isSpicy: true },
    { name: 'Quattro Formaggi', description: 'Four cheeses, honey on the side', price: 560, category: 'Pizza', isVeg: true },
    { name: 'Funghi e Tartufo', description: 'Mushroom and truffle oil', price: 580, category: 'Pizza', isVeg: true },
    { name: 'Garlic Focaccia', description: 'From the same dough, rosemary and salt', price: 240, category: 'From the Oven', isVeg: true },
  ],
  'cui-seafood': [
    { name: 'Butter Garlic Prawns', description: 'Shell-on, cooked hard and fast', price: 620, category: 'Small Plates', isVeg: false },
    { name: 'Grilled Catch of the Day', description: 'Whatever came off the boat, lemon and herbs', price: 780, category: 'From the Grill', isVeg: false },
    { name: 'Crab Masala', description: 'Cracked and cooked in a dark roasted masala', price: 840, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Squid Rings', description: 'Semolina crust, tossed with pepper', price: 520, category: 'Small Plates', isVeg: false },
    { name: 'Prawn Pulao', description: 'Rice cooked in prawn stock', price: 560, category: 'Rice', isVeg: false },
    { name: 'Tawa Pomfret', description: 'Whole, marinated in green masala', price: 720, category: 'From the Grill', isVeg: false, isSpicy: true },
  ],
  'cui-coastal': [
    { name: 'Goan Fish Curry', description: 'Coconut, kokum and red chilli', price: 480, category: 'Curries', isVeg: false, isSpicy: true },
    { name: 'Solkadhi', description: 'Kokum and coconut milk, drunk alongside', price: 140, category: 'To Drink', isVeg: true },
    { name: 'Prawn Balchao', description: 'Sharp, vinegared and hot', price: 560, category: 'Curries', isVeg: false, isSpicy: true },
    { name: 'Neer Dosa', description: 'Lace-thin rice crepes, three to a plate', price: 180, category: 'Breads', isVeg: true },
    { name: 'Coconut Rice', description: 'Fresh coconut, curry leaf, cashew', price: 220, category: 'Rice', isVeg: true },
    { name: 'Clams Sukka', description: 'Dry-roasted with coconut and spice', price: 520, category: 'Curries', isVeg: false, isSpicy: true },
  ],
  'cui-grill': [
    { name: 'Smoked Half Chicken', description: 'Six hours over applewood', price: 560, category: 'From the Pit', isVeg: false },
    { name: 'Beef Brisket (250g)', description: 'Salt, pepper, smoke and patience', price: 720, category: 'From the Pit', isVeg: false },
    { name: 'Pork Ribs', description: 'Glazed and finished hot', price: 680, category: 'From the Pit', isVeg: false, isSpicy: true },
    { name: 'Grilled Corn', description: 'Charred, lime and chilli butter', price: 200, category: 'Sides', isVeg: true, isSpicy: true },
    { name: 'Smoked Cauliflower', description: 'Whole head, tahini and pomegranate', price: 380, category: 'From the Pit', isVeg: true },
    { name: 'Slaw', description: 'Cabbage, apple and mustard seed', price: 180, category: 'Sides', isVeg: true },
  ],
  'cui-mexican': [
    { name: 'Tacos al Pastor (3 pc)', description: 'Marinated pork, pineapple, stone-ground corn tortillas', price: 420, category: 'Tacos', isVeg: false, isSpicy: true },
    { name: 'Tacos de Hongos (3 pc)', description: 'Mushroom, epazote and salsa verde', price: 380, category: 'Tacos', isVeg: true },
    { name: 'Guacamole & Totopos', description: 'Mashed to order in a molcajete', price: 320, category: 'To Start', isVeg: true },
    { name: 'Elote', description: 'Grilled corn, crema, cotija and chilli', price: 240, category: 'To Start', isVeg: true, isSpicy: true },
    { name: 'Enchiladas Verdes', description: 'Rolled, sauced in tomatillo, baked', price: 460, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Chiles Rellenos', description: 'Poblano stuffed with cheese, lightly battered', price: 440, category: 'Main Course', isVeg: true, isSpicy: true },
  ],
  'cui-tex-mex': [
    { name: 'Loaded Nachos', description: 'Queso, beans, jalapeño and pico', price: 380, category: 'To Share', isVeg: true, isSpicy: true },
    { name: 'Chicken Burrito', description: 'Rice, beans, cheese, wrapped and griddled', price: 420, category: 'Burritos', isVeg: false },
    { name: 'Bean & Cheese Burrito', description: 'Refried beans and melted jack', price: 360, category: 'Burritos', isVeg: true },
    { name: 'Chipotle Bowl', description: 'No tortilla — rice, beans, salsa and crema', price: 400, category: 'Bowls', isVeg: true, isSpicy: true },
    { name: 'Beef Fajitas', description: 'Brought sizzling, peppers and onion', price: 540, category: 'Main Course', isVeg: false, isSpicy: true },
    { name: 'Churros con Chocolate', description: 'Cinnamon sugar, thick chocolate to dip', price: 260, category: 'Sweet', isVeg: true },
  ],
  'cui-ice-cream': [
    { name: 'Pistachio Gelato', description: 'Bronte pistachio, slow-churned', price: 220, category: 'Gelato', isVeg: true },
    { name: 'Dark Chocolate Sorbet', description: 'No dairy, 70% cocoa', price: 200, category: 'Sorbet', isVeg: true },
    { name: 'Alphonso Mango Sorbet', description: 'Seasonal, nothing added but sugar', price: 210, category: 'Sorbet', isVeg: true },
    { name: 'Tender Coconut Ice Cream', description: 'Scraped fresh coconut through the base', price: 230, category: 'Gelato', isVeg: true },
    { name: 'Hot Fudge Sundae', description: 'Three scoops, fudge poured at the table', price: 320, category: 'Sundaes', isVeg: true },
    { name: 'Affogato', description: 'Vanilla gelato drowned in espresso', price: 260, category: 'Sundaes', isVeg: true },
  ],
  'cui-desserts': [
    { name: 'Tiramisu', description: 'Mascarpone, espresso-soaked savoiardi', price: 340, category: 'Plated', isVeg: true },
    { name: 'Gulab Jamun (2 pc)', description: 'Warm, in cardamom syrup', price: 180, category: 'Mithai', isVeg: true },
    { name: 'Rasmalai (2 pc)', description: 'Soft chenna discs in saffron milk', price: 220, category: 'Mithai', isVeg: true },
    { name: 'Chocolate Fondant', description: 'Twelve minutes to order, molten centre', price: 360, category: 'Plated', isVeg: true },
    { name: 'Kaju Katli (250g)', description: 'Cashew and silver leaf, cut in diamonds', price: 420, category: 'Mithai', isVeg: true },
    { name: 'Baklava (4 pc)', description: 'Layered filo, pistachio and honey', price: 300, category: 'Plated', isVeg: true },
  ],
  'cui-bakery': [
    { name: 'Butter Croissant', description: 'Laminated over three days', price: 160, category: 'Viennoiserie', isVeg: true },
    { name: 'Pain au Chocolat', description: 'Two batons of dark chocolate', price: 180, category: 'Viennoiserie', isVeg: true },
    { name: 'Sourdough Loaf', description: 'Long ferment, baked dark', price: 280, category: 'Bread', isVeg: true },
    { name: 'Cinnamon Morning Bun', description: 'Rolled, sugared and baked in a ring', price: 190, category: 'Viennoiserie', isVeg: true },
    { name: 'Focaccia Slab', description: 'Rosemary, olive oil, flaked salt', price: 220, category: 'Bread', isVeg: true },
    { name: 'Lemon Tart', description: 'Sharp curd, torched meringue', price: 300, category: 'Patisserie', isVeg: true },
  ],
  'cui-pure-veg': [
    { name: 'Paneer Lababdar', description: 'Cottage cheese in a tomato and cashew gravy', price: 360, category: 'Main Course', isVeg: true },
    { name: 'Malai Kofta', description: 'Potato and paneer dumplings in a mild gravy', price: 340, category: 'Main Course', isVeg: true },
    { name: 'Dal Tadka', description: 'Yellow lentils, ghee tempering poured at the pass', price: 280, category: 'Main Course', isVeg: true },
    { name: 'Bhindi Masala', description: 'Okra cooked dry with onion and amchur', price: 300, category: 'Vegetables', isVeg: true },
    { name: 'Vegetable Pulao', description: 'Basmati, whole spices and seasonal vegetables', price: 260, category: 'Rice', isVeg: true },
    { name: 'Tandoori Roti', description: 'Wholewheat, straight off the clay wall', price: 60, category: 'Breads', isVeg: true },
  ],
  'cui-jain': [
    { name: 'Jain Paneer Tikka Masala', description: 'No onion, no garlic — tomato and cashew base', price: 370, category: 'Main Course', isVeg: true },
    { name: 'Jain Dal Fry', description: 'Toor dal, asafoetida in place of onion and garlic', price: 280, category: 'Main Course', isVeg: true },
    { name: 'Raw Banana Kofta', description: 'Nothing grown underground; raw banana stands in for potato', price: 330, category: 'Main Course', isVeg: true },
    { name: 'Jain Vegetable Handi', description: 'Above-ground vegetables, slow-cooked in a sealed pot', price: 350, category: 'Main Course', isVeg: true },
    { name: 'Jain Pav Bhaji', description: 'Made without potato, onion or garlic', price: 240, category: 'Street Plates', isVeg: true },
    { name: 'Phulka (2 pc)', description: 'Puffed on an open flame', price: 60, category: 'Breads', isVeg: true },
  ],
  'cui-gujarati': [
    { name: 'Undhiyu', description: 'Winter vegetables and muthia, slow-cooked', price: 340, category: 'Main Course', isVeg: true },
    { name: 'Dhokla', description: 'Steamed and tempered with mustard and curry leaf', price: 180, category: 'Farsan', isVeg: true },
    { name: 'Khandvi', description: 'Gram flour rolled thin, coconut and coriander', price: 190, category: 'Farsan', isVeg: true },
    { name: 'Gujarati Dal', description: 'Sweet, sour and sharp all at once', price: 240, category: 'Main Course', isVeg: true },
    { name: 'Thepla (3 pc)', description: 'Fenugreek flatbreads, travel food by tradition', price: 150, category: 'Breads', isVeg: true },
    { name: 'Shrikhand', description: 'Strained yoghurt with saffron and cardamom', price: 200, category: 'Sweet', isVeg: true },
  ],
  'cui-thali': [
    { name: 'Regular Thali', description: 'Two vegetables, dal, rice, four rotis, salad and sweet', price: 380, category: 'Thali', isVeg: true },
    { name: 'Special Thali', description: 'Adds a paneer dish, farsan and a second sweet', price: 520, category: 'Thali', isVeg: true },
    { name: 'Mini Thali', description: 'One vegetable, dal, rice and two rotis', price: 280, category: 'Thali', isVeg: true },
    { name: 'Unlimited Thali', description: 'Refilled until you stop them', price: 620, category: 'Thali', isVeg: true },
    { name: 'Extra Sweet', description: 'One more from the day’s two', price: 90, category: 'Add On', isVeg: true },
  ],
  'cui-salads': [
    { name: 'Quinoa & Roast Pumpkin Bowl', description: 'Feta, seeds and a lemon dressing', price: 380, category: 'Bowls', isVeg: true },
    { name: 'Grilled Chicken Caesar', description: 'Cos, parmesan, anchovy dressing', price: 420, category: 'Salads', isVeg: false },
    { name: 'Greek Salad', description: 'Cucumber, olive, tomato and a slab of feta', price: 340, category: 'Salads', isVeg: true },
    { name: 'Falafel Mezze Bowl', description: 'Hummus, pickles, tabbouleh and flatbread', price: 390, category: 'Bowls', isVeg: true },
    { name: 'Soba Noodle Bowl', description: 'Edamame, sesame and pickled ginger', price: 360, category: 'Bowls', isVeg: true },
    { name: 'Soup of the Day', description: 'Whatever the market gave us', price: 240, category: 'Soups', isVeg: true },
  ],
  'cui-vegan': [
    { name: 'Jackfruit Sliders (3 pc)', description: 'Pulled and glazed, slaw on top', price: 400, category: 'Plates', isVeg: true },
    { name: 'Cashew Cheese Flatbread', description: 'Fermented cashew, tomato and basil', price: 420, category: 'Plates', isVeg: true },
    { name: 'Tofu Poke Bowl', description: 'Marinated tofu, brown rice, avocado', price: 440, category: 'Bowls', isVeg: true },
    { name: 'Coconut Yoghurt Parfait', description: 'Granola, compote and toasted seeds', price: 300, category: 'Sweet', isVeg: true },
    { name: 'Roast Beet & Walnut Salad', description: 'Orange, chicory and a mustard dressing', price: 360, category: 'Bowls', isVeg: true },
    { name: 'Mushroom Bourguignon', description: 'Red wine, pearl onion, soft polenta', price: 480, category: 'Plates', isVeg: true },
  ],
  'cui-juices': [
    { name: 'Cold-Pressed Orange', description: 'Pressed on order, nothing added', price: 180, category: 'Juice', isVeg: true },
    { name: 'Green Press', description: 'Cucumber, celery, spinach, apple and lime', price: 220, category: 'Juice', isVeg: true },
    { name: 'Beet & Ginger', description: 'Earthy and sharp', price: 200, category: 'Juice', isVeg: true },
    { name: 'Banana Date Smoothie', description: 'Almond milk, dates, a pinch of salt', price: 240, category: 'Smoothie', isVeg: true },
    { name: 'Berry Smoothie', description: 'Mixed berries and coconut yoghurt', price: 260, category: 'Smoothie', isVeg: true },
    { name: 'Turmeric Tonic', description: 'Ginger, turmeric, black pepper, lemon', price: 160, category: 'Tonic', isVeg: true },
  ],
};

/* ------------------------------------------------------------ signatures -- */

/**
 * House dishes, keyed `restaurantId::cuisineId`. One kitchen's version of a
 * cuisine differs from another's by what it is known for, so a menu that is
 * only the catalogue would make every Italian place identical.
 */
const SIGNATURES: Record<string, CatalogueItem[]> = {
  'res-mumbai-spice::cui-north-indian': [
    { name: 'Mumbai Spice Butter Chicken', description: 'The house recipe — thirty-year-old gravy base', price: 480, category: 'House Specials', isVeg: false },
  ],
  'res-mumbai-spice::cui-street-chaat': [
    { name: 'Bombay Sandwich', description: 'Green chutney, beetroot, cucumber, pressed and grilled', price: 130, category: 'House Specials', isVeg: true },
  ],
  'res-delhi-darbar::cui-mughlai': [
    { name: 'Darbar Raan', description: 'Whole leg of lamb, marinated two days', price: 1180, category: 'House Specials', isVeg: false },
  ],
  'res-tandoori-nights::cui-north-indian': [
    { name: 'Midnight Tandoori Platter', description: 'Four skewers, served after ten', price: 760, category: 'House Specials', isVeg: false, isSpicy: true },
  ],
  'res-annas-tiffin::cui-dosa': [
    { name: "Anna's Paper Roast", description: 'Two feet of dosa, brought upright', price: 240, category: 'House Specials', isVeg: true },
  ],
  'res-kaveri-mess::cui-thali': [
    { name: 'Kaveri Banana Leaf Meal', description: 'Served on leaf, refilled without asking', price: 420, category: 'House Specials', isVeg: true },
  ],
  'res-jade-lantern::cui-dim-sum': [
    { name: 'Jade Basket (8 pc)', description: 'The kitchen chooses; no two baskets alike', price: 520, category: 'House Specials', isVeg: false },
  ],
  'res-sichuan-house::cui-sichuan': [
    { name: 'Chongqing Chicken', description: 'More dried chilli than chicken, by design', price: 460, category: 'House Specials', isVeg: false, isSpicy: true },
  ],
  'res-nonnas-table::cui-italian': [
    { name: "Nonna's Sunday Ragù", description: 'Made once a week, served until it runs out', price: 580, category: 'House Specials', isVeg: false },
  ],
  'res-forno-rosso::cui-pizza': [
    { name: 'Forno Rosso Doppio', description: 'Double-fermented dough, 48 hours', price: 620, category: 'House Specials', isVeg: true },
  ],
  'res-harbour-shack::cui-seafood': [
    { name: 'Shack Seafood Platter', description: 'Whatever the boats brought, for two', price: 1450, category: 'House Specials', isVeg: false },
  ],
  'res-kokum-coast::cui-coastal': [
    { name: 'Kokum Coast Fish Thali', description: 'Curry, fry, solkadhi, rice and bhakri', price: 560, category: 'House Specials', isVeg: false, isSpicy: true },
  ],
  'res-casa-verde::cui-mexican': [
    { name: 'Casa Verde Mole Poblano', description: 'Thirty ingredients, ground down over two days', price: 620, category: 'House Specials', isVeg: false },
  ],
  'res-sweet-scoops::cui-ice-cream': [
    { name: 'Scoops Flight (5 mini)', description: 'Five of the day’s churns, in a row', price: 380, category: 'House Specials', isVeg: true },
  ],
  'res-mithai-room::cui-desserts': [
    { name: 'Mithai Box (500g)', description: 'Assorted, boxed and tied', price: 780, category: 'House Specials', isVeg: true },
  ],
  'res-green-table-co::cui-pure-veg': [
    { name: 'Green Table Harvest Platter', description: 'Whatever the kitchen garden gave up that morning', price: 520, category: 'House Specials', isVeg: true },
  ],
  'res-quiet-court-jain::cui-jain': [
    { name: 'Quiet Court Jain Thali', description: 'No root vegetables anywhere on the plate', price: 460, category: 'House Specials', isVeg: true },
  ],
  'res-greenhouse-co::cui-salads': [
    { name: 'Greenhouse Grain Bowl', description: 'Built at the counter from eleven components', price: 440, category: 'House Specials', isVeg: true },
  ],
  'res-root-and-stem::cui-vegan': [
    { name: 'Root & Stem Tasting Plate', description: 'Six small plates, entirely plant-based', price: 680, category: 'House Specials', isVeg: true },
  ],
};

/* ------------------------------------------------------------- generation -- */

/** A ₹₹₹ kitchen charges more for the same dish than a ₹ one. */
const BAND_MULTIPLIER: Record<string, number> = { '₹': 0.8, '₹₹': 1, '₹₹₹': 1.35 };

/** Stable per-key hash, so a menu is the same on every load. */
function hash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const menuRows: Menu[] = [];
const itemRows: MenuItem[] = [];

for (const link of restaurantCuisines) {
  const restaurant = restaurants.find((r) => r.id === link.restaurantId);
  const catalogue = CATALOGUE[link.cuisineId];
  if (!restaurant || !catalogue) continue;

  const menuId = `menu-${link.restaurantId.replace(/^res-/, '')}-${link.cuisineId.replace(/^cui-/, '')}`;
  menuRows.push({ id: menuId, restaurantId: link.restaurantId, cuisineId: link.cuisineId });

  const key = `${link.restaurantId}::${link.cuisineId}`;
  const multiplier = BAND_MULTIPLIER[restaurant.priceRange] ?? 1;

  /*
   * A pure-veg kitchen does not serve the meat dishes in a shared catalogue —
   * it drops them, and this runs before anything else so the counts below are
   * counts of what the kitchen actually sells.
   *
   * This used to be `isVeg: restaurant.isPureVeg ? true : item.isVeg` on the
   * row below, which relabelled them instead: Anna's Tiffin Room listed a
   * Kerala Fish Curry marked vegetarian, and Herb & Husk a vegetarian Butter
   * Chicken — nine dishes across six kitchens. On a veg filter, or under a
   * suggestion captioned "Vegetarian", that is not a cosmetic slip: it is the
   * app telling someone with a dietary or religious restriction that fish is
   * vegetarian.
   */
  const servable = restaurant.isPureVeg ? catalogue.filter((i) => i.isVeg) : catalogue;
  const signatures = (SIGNATURES[key] ?? []).filter((i) => !restaurant.isPureVeg || i.isVeg);

  /* Drop one dish per menu so two kitchens never show an identical card.
     Measured after the veg filter, or a pure-veg menu that lost dishes to it
     could be cut below the five-item floor this promises — one was, down to
     four. Never touches a signature. */
  const dropped = servable.length > 6 ? hash(key) % servable.length : -1;

  const items = [...servable.filter((_, i) => i !== dropped), ...signatures];

  for (const item of items) {
    itemRows.push({
      id: `${menuId}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      menuId,
      name: item.name,
      description: item.description,
      /* Rounded to the nearest five — nobody prices a dish at ₹347. */
      price: Math.round((item.price * multiplier) / 5) * 5,
      category: item.category,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
    });
  }
}

/** table: menus — one row per (restaurant, cuisine). Never merged. */
export const menus: Menu[] = menuRows;

/** table: menu_items — every item belongs to exactly one menu. */
export const menuItems: MenuItem[] = itemRows;
