// src/pages/FAQ.tsx
import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

type FaqItem = {
  q: string;
  a: string;
};

const ITEMS: FaqItem[] = [
  {
    q: "Lorem ipsum dolor sit amet?",
    a: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo, eius. Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae, perspiciatis.",
  },
  {
    q: "Consectetur adipiscing elit sed do?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque totam, deserunt dolore quasi quos culpa illum iste earum assumenda.",
  },
  {
    q: "Eiusmod tempor incididunt ut labore?",
    a: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, unde? Iusto dolorem esse, dolorum deserunt accusantium numquam atque natus.",
  },
  {
    q: "Ut enim ad minim veniam quis?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam earum amet veniam commodi soluta possimus adipisci eligendi.",
  },
  {
    q: "Duis aute irure dolor in reprehenderit?",
    a: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus quaerat molestias voluptatibus qui eaque, suscipit ad tempore sapiente.",
  },
  // 👇 +5 more FAQs
  {
    q: "Excepteur sint occaecat cupidatat non proident?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, deleniti. Dignissimos, reprehenderit expedita animi facilis nam delectus libero molestias.",
  },
  {
    q: "Sunt in culpa qui officia deserunt mollit anim id est?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, iusto. Aliquam, libero debitis. Ipsam alias cumque at aspernatur illum.",
  },
  {
    q: "Sed ut perspiciatis unde omnis iste natus error?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et consequuntur, voluptatibus amet iure incidunt alias nihil? Amet, minima!",
  },
  {
    q: "At vero eos et accusamus et iusto odio dignissimos?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, dolore. Quas laboriosam quae accusantium quia temporibus sit itaque architecto.",
  },
  {
    q: "Quis autem vel eum iure reprehenderit qui in ea voluptate?",
    a: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore suscipit ad rem natus libero nulla saepe totam eaque.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx)); // only one open at a time
  };

  return (
    <div className="bg-primary-gray">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary-blue mb-2">FAQ</h1>
        <p className="text-sm text-gray-600 mb-8">
          Frequently asked questions. This is a placeholder — replace with real content later.
        </p>

        <div className="bg-white rounded-2xl p-2 md:p-4 border border-black/5 shadow-sm">
          {ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 mb-2 md:mb-3 overflow-hidden"
              >
                {/* Header (clickable) */}
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-4 md:px-6 py-4 md:py-5 text-left"
                >
                  <span className="text-sm md:text-base font-medium text-[#0b0d3b]">
                    {item.q}
                  </span>
                  <FiChevronDown
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer (smooth slide) */}
                <div
                  className={`px-4 md:px-6 overflow-hidden transition-[max-height] duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="pb-4 md:pb-6">
                    <p className="text-sm md:text-base leading-relaxed text-gray-700">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
