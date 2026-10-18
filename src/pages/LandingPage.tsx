import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingFoodHero } from '../components/landing/FloatingFoodHero';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import { SignInSection } from '../components/landing/SignInSection';
import {
  CityPreview, CuisineGallery, Highlights, HowItWorks, VideoHero,
} from '../components/landing/sections';
import { getCityStats, getDistrictSummaries } from '../services/restaurantService';

/**
 * The first screen a visitor sees.
 *
 * The city used to be the landing page. It still is the product's centre, but
 * a visitor arriving cold got dropped straight into an isometric world with no
 * explanation of what they were looking at — so this page now sits in front of
 * it and the city is one scroll and one button away, at `/city`.
 *
 * Sign-in is deliberately last, after the page has made its case. That is also
 * why it is a section and not a redirect: **discovery stays public**. A visitor
 * can read all of this, press "Enter SNS", wander ten districts and open any
 * menu without an account — the guard only starts at the things that belong to
 * one, which is the arrangement the rest of the app is already built around.
 *
 * Every section reads the real services. The cuisine cards are the ten
 * districts that exist, with their real kitchen counts and ratings, and each
 * card opens the district it names.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const summaries = useMemo(() => getDistrictSummaries(), []);
  const stats = useMemo(() => getCityStats(), []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* Relative, so this works under "/" for a visitor and "/customer" for a
     signed-in customer without knowing which base it is mounted on. */
  const enterCity = useCallback(() => navigate('city'), [navigate]);

  const openDistrict = useCallback(
    (districtId: string) => navigate(`city?district=${districtId}`),
    [navigate],
  );

  return (
    <div className="lp-page">
      <LandingNav onSignIn={() => scrollTo('signin')} />

      <main>
        <VideoHero onExplore={() => scrollTo('explore')} onCuisines={() => scrollTo('cuisines')} />

        {/* A breath between the video and the blush section: dishes drifting
            around one line of copy, and the first light surface after the
            hero's dark. */}
        <FloatingFoodHero
          title="Better food, from more kitchens."
          description="Thirty kitchens across ten neighbourhoods, each cooking what it is known for — and every one of them a short walk through the city."
        />

        <CityPreview stats={stats} onEnter={enterCity} />
        <CuisineGallery summaries={summaries} onOpen={openDistrict} onAll={enterCity} />
        <HowItWorks />
        <Highlights />
        <SignInSection onExplore={enterCity} />
      </main>

      <LandingFooter onAbout={() => scrollTo('about')} />
    </div>
  );
}
