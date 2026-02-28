import Image from "next/image";

export function SideBrandRails() {
  return (
    <>
      <aside className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[max(24rem,calc((100vw-72rem)/2))] items-center justify-center border-r border-white/5 bg-gradient-to-r from-black/60 to-transparent xl:flex">
        <div className="relative h-[96vh] w-[28rem] opacity-[0.62]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-72 w-[12000px] -rotate-90">
              <Image src="/media/sponsors/martin-logo-white.svg" alt="" fill sizes="12000px" className="object-contain" />
            </div>
          </div>
        </div>
      </aside>
      <aside className="pointer-events-none fixed inset-y-0 right-0 z-0 hidden w-[max(24rem,calc((100vw-72rem)/2))] items-center justify-center border-l border-white/5 bg-gradient-to-l from-black/60 to-transparent xl:flex">
        <div className="relative h-[96vh] w-[28rem] opacity-[0.62]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-72 w-[12000px] rotate-90">
              <Image src="/media/sponsors/martin-logo-white.svg" alt="" fill sizes="12000px" className="object-contain" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
