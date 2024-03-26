import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import AutoPlay from 'embla-carousel-autoplay';

const imagesArr = [
  'https://images.pexels.com/photos/5093968/pexels-photo-5093968.jpeg?auto=compress&cs=tinysrgb&w=1560&h=1200&dpr=1',
  'https://images.pexels.com/photos/3705962/pexels-photo-3705962.jpeg?auto=compress&cs=tinysrgb&w=1560&h=1200&dpr=1',
  'https://images.pexels.com/photos/3705645/pexels-photo-3705645.jpeg?auto=compress&cs=tinysrgb&w=1560&h=1200&dpr=1',
  'https://images.pexels.com/photos/8985272/pexels-photo-8985272.jpeg?auto=compress&cs=tinysrgb&w=1560&h=1200&dpr=1',
  'https://images.pexels.com/photos/4392552/pexels-photo-4392552.jpeg?auto=compress&cs=tinysrgb&w=1560&h=1200&dpr=1',
];

function RegisterPageCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', dragFree: true },
    [Fade(), AutoPlay()]
  );

  useEffect(() => {
    if (emblaApi) {
      emblaApi.slideNodes(); // Access API
    }
  }, [emblaApi]);

  return (
    <div className="embla h-screen" ref={emblaRef}>
      <div className="embla__container">
        {imagesArr.map((image, index) => (
          <div className="embla__slide" key={index}>
            <img src={image} alt="illustration" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RegisterPageCarousel;
