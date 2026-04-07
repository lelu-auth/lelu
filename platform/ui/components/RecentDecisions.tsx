"use client";

import { FaLocationArrow } from "react-icons/fa6";
import { decisions } from "@/data";
import { PinContainer } from "./ui/Pin";

const RecentDecisions = () => {
  return (
    <div className="py-20" id="decisions">
      <h1 className="heading">
        Real-time <span className="text-purple">Policy Enforcement</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-x-24 gap-y-8 mt-10">
        {decisions.map((item) => (
          <div
            className="lg:min-h-[32.5rem] h-[25rem] flex items-center justify-center sm:w-96 w-[80vw]"
            key={item.id}
          >
            <PinContainer title={item.link} href={item.link}>
              <div className="relative flex items-center justify-center sm:w-96 w-[80vw] overflow-hidden h-[20vh] lg:h-[30vh] mb-10">
                <div className="relative w-full h-full overflow-hidden lg:rounded-3xl dark:bg-[#13162D] bg-zinc-100">
                  <img src="/bg.png" alt="bgimg" />
                </div>
                <img src={item.img} alt="cover" className="z-10 absolute bottom-0" />
              </div>

              <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                {item.title}
              </h1>

              <p
                className="lg:text-xl lg:font-normal font-light text-sm line-clamp-2 dark:text-[#BEC1DD] text-zinc-600"
                style={{
                  margin: "1vh 0",
                }}
              >
                {item.des}
              </p>

              <div className="flex items-center justify-between mt-7 mb-3">
                <div className="flex items-center">
                  {item.iconLists.map((icon, index) => (
                    <div
                      key={index}
                      className="border border-white/[.2] dark:border-none rounded-full bg-zinc-200 dark:bg-black lg:w-10 lg:h-10 w-8 h-8 flex justify-center items-center"
                      style={{
                        transform: `translateX(-${5 * index + 2}px)`,
                      }}
                    >
                      <img src={icon} alt="icon5" className="p-2" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center">
                  <p className="flex lg:text-xl md:text-xs text-sm text-purple">View Audit Trace</p>
                  <FaLocationArrow className="ms-3" color="#CBACF9" />
                </div>
              </div>
            </PinContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDecisions;
