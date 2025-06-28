'use client';
import { useState } from 'react';
import Image from 'next/image';
import { MoveRight, MoveLeft } from "lucide-react";


export default function Carousel({slides}) {
  const [current, setCurrent] = useState(0);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="bg-primary relative w-full max-w-250 h-70 rounded-md">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}>
          {/* <Image
            src={slide.image}
            alt={slide.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover"
          /> */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4 max-w-[80%] mx-auto gap-1">
            <span className="text-h2">{slide.title}</span>
            <span className="text-h3">{slide.description}</span>
          </div>
        </div>
      ))}

        <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-white"
        >
            <MoveLeft size={50} strokeWidth={2}></MoveLeft>
        </button>
        <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white"
        >
            <MoveRight size={50} strokeWidth={2}></MoveRight>
      </button>
    </div>
  );
}
