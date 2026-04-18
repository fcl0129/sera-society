import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: string;
  images: { src: string; alt: string }[];
  slideDetails?: { heading: string; description: string }[];
}

export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ title, subtitle, images, slideDetails, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(
      Math.floor(images.length / 2),
    );

    const handleNext = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    React.useEffect(() => {
      const timer = setInterval(() => {
        handleNext();
      }, 4000);
      return () => clearInterval(timer);
    }, [handleNext]);

    const hasHeader = Boolean(title) || Boolean(subtitle?.trim());
    const currentSlideDetail = slideDetails?.[currentIndex];

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full flex flex-col items-center justify-center overflow-x-hidden bg-background text-foreground px-4 py-16 md:py-24",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0 opacity-30" aria-hidden="true">
          <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(128,90,213,0.16),rgba(255,255,255,0))]" />
          <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,123,255,0.16),rgba(255,255,255,0))]" />
        </div>

        <div className="z-10 flex w-full max-w-6xl flex-col items-center text-center space-y-8 md:space-y-12">
          {hasHeader && (
            <div className="space-y-4">
              {title && (
                <h2 className="sera-heading text-sera-navy text-4xl sm:text-5xl md:text-6xl max-w-4xl">
                  {title}
                </h2>
              )}
              {subtitle?.trim() && (
                <p className="sera-body max-w-2xl mx-auto text-muted-foreground md:text-xl">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
              {images.map((image, index) => {
                const offset = index - currentIndex;
                const total = images.length;
                let pos = (offset + total) % total;
                if (pos > Math.floor(total / 2)) {
                  pos = pos - total;
                }

                const isCenter = pos === 0;
                const isAdjacent = Math.abs(pos) === 1;

                return (
                  <div
                    key={image.src}
                    className={cn(
                      "absolute w-48 h-96 md:w-64 md:h-[450px] transition-all duration-500 ease-in-out",
                      "flex items-center justify-center",
                    )}
                    style={{
                      transform: `
                        translateX(${pos * 45}%)
                        scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                        rotateY(${pos * -10}deg)
                      `,
                      zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                      opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                      filter: isCenter ? "blur(0px)" : "blur(4px)",
                      visibility: Math.abs(pos) > 1 ? "hidden" : "visible",
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="object-cover w-full h-full rounded-3xl border-2 border-foreground/10 shadow-2xl"
                    />
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm"
              onClick={handlePrev}
              aria-label="Show previous invitation"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm"
              onClick={handleNext}
              aria-label="Show next invitation"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {currentSlideDetail && (
            <div className="max-w-3xl space-y-3 text-center">
              <h3 className="sera-heading text-sera-navy text-2xl sm:text-3xl md:text-4xl">
                {currentSlideDetail.heading}
              </h3>
              <p className="sera-body text-muted-foreground md:text-lg">
                {currentSlideDetail.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

HeroSection.displayName = "HeroSection";
