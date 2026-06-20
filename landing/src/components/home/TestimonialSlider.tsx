"use client";

import Image, { type StaticImageData } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import {
  testimonial1,
  testimonial2,
  testimonial3,
  testimonial4,
  testimonial5,
  testimonial6,
} from "@/assets";

const slides: { image: StaticImageData; text: string; name: string }[] = [
  {
    image: testimonial1,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
  {
    image: testimonial2,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
  {
    image: testimonial3,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
  {
    image: testimonial4,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
  {
    image: testimonial5,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
  {
    image: testimonial6,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
    name: "Harry Hank",
  },
];

export function TestimonialSlider() {
  return (
    <div className="as_testimonial_slider_inner">
      <Swiper
        className="as_testimonialSlider"
        modules={[Pagination]}
        spaceBetween={30}
        slidesPerView={2}
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1200: { slidesPerView: 2, spaceBetween: 30 },
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="as_testimonial_inner_content">
              <Image src={slide.image} alt={slide.name} />
              <p>{slide.text}</p>
              <h5>{slide.name}</h5>
              <a href="#" className="as_btn as_astrologer">
                Astrologer
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
