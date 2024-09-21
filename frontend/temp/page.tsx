'use client'
import Image from "next/image";

import { useEffect } from "react";

import AOS from "aos";
import "aos/dist/aos.css";

import Header from "../src/components/ui/header";
import Footer from "../src/components/ui/footer";


import Hero from "../src/components/hero-home";
import BusinessCategories from "../src/components/business-categories";
import FeaturesPlanet from "../src/components/features-planet";
import LargeTestimonial from "../src/components/large-testimonial";
import Cta from "../src/components/cta";

export default function Home({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <>
      <Header />
      {/* <main className="grow">{children}</main> */}
      <Hero />
      <FeaturesPlanet />
      <LargeTestimonial />
      <BusinessCategories />
      <Cta />
      <Footer border={true} />
    </>
  );
}