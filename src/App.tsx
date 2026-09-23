import { FoodCity } from './components/foodcity/FoodCity';
import { TopBar } from './components/layout/TopBar';

export default function App() {
  return (
    <div className="fc-shell" id="top">
      <TopBar />
      <FoodCity />
    </div>
  );
}
