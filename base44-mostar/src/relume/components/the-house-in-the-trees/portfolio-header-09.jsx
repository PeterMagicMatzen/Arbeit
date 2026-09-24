import { Badge } from "@/relume/ui/badge";
import React from "react";

export function PortfolioHeader9() {
  return (
    <section className="px-[5%] scheme-1 alternate logo-alt">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-6 py-16 md:grid-cols-2 md:gap-x-12 md:py-24 lg:gap-20 lg:py-28">
          <div>
            <h1 className="mb-5 text-h1 font-bold md:mb-6">
              The house in the trees
            </h1>
            <div className="mt-5 flex flex-wrap gap-2 md:mt-6">
              <Badge>
                <a href="#">Architecture</a>
              </Badge>
              <Badge>
                <a href="#">Vestige</a>
              </Badge>
              <Badge>
                <a href="#">Seven planes</a>
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-medium">
              An ivy-covered wooden house, a sunlit garden, and blue plant pots.
              Told the way the Mostar story is told.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
