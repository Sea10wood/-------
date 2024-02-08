import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import "../App.css";

gsap.registerPlugin(ScrollTrigger, Draggable);

const Gallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let iteration = 0;
    gsap.set(".cards li", { xPercent: 400, opacity: 0, scale: 0 });

    const spacing = 0.1;
    const snapTime = gsap.utils.snap(spacing);
    const cards = gsap.utils.toArray<HTMLElement>(".cards li");

    const animateFunc = (element: HTMLElement) => {
      const tl = gsap.timeline();
      tl.fromTo(
        element,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          zIndex: 100,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power1.in",
          immediateRender: false,
        }
      ).fromTo(
        element,
        { xPercent: 400 },
        { xPercent: -400, duration: 1, ease: "none", immediateRender: false },
        0
      );
      return tl;
    };

    const seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc);

    const playhead = { offset: 0 };
    const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());
    const scrub = gsap.to(playhead, {
      offset: 0,
      onUpdate() {
        seamlessLoop.time(wrapTime(playhead.offset));
      },
      duration: 0.5,
      ease: "power3",
      paused: true,
    });

    const trigger = ScrollTrigger.create({
      start: 0,
      onUpdate(self) {
        const scroll = self.scroll();
        if (scroll > self.end - 1) {
          wrap(1, 2);
        } else if (scroll < 1 && self.direction < 0) {
          wrap(-1, self.end - 2);
        } else {
          scrub.vars.offset =
            (iteration + self.progress) * seamlessLoop.duration();
          scrub.invalidate().restart();
        }
      },
      end: "+=3000",
      pin: ".gallery",
    });

    const progressToScroll = (progress: number) =>
      gsap.utils.clamp(
        1,
        trigger.end - 1,
        gsap.utils.wrap(0, 1, progress) * trigger.end
      );

    const wrap = (iterationDelta: number, scrollTo: number) => {
      iteration += iterationDelta;
      trigger.scroll(scrollTo);
      trigger.update();
    };

    ScrollTrigger.addEventListener("scrollEnd", () =>
      scrollToOffset(scrub.vars.offset)
    );

    function scrollToOffset(offset: number) {
      const snappedTime = snapTime(offset);
      const progress =
        (snappedTime - seamlessLoop.duration() * iteration) /
        seamlessLoop.duration();
      const scroll = progressToScroll(progress);
      if (progress >= 1 || progress < 0) {
        return wrap(Math.floor(progress), scroll);
      }
      trigger.scroll(scroll);
    }

    const nextButton = document.querySelector(".next");

    if (nextButton) {
      nextButton.addEventListener("click", () =>
        scrollToOffset(scrub.vars.offset + spacing)
      );
    }

    Draggable.create(".drag-proxy", {
      type: "x",
      trigger: ".cards",
      onPress() {
        this.startOffset = scrub.vars.offset;
      },
      onDrag() {
        scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
        scrub.invalidate().restart();
      },
      onDragEnd() {
        scrollToOffset(scrub.vars.offset);
      },
    });
  }, []);

  const CardA = () => {
    return (
      <div className="card-content" style={{backgroundColor:"#757575"}}>
        <h2>Who is Sea10</h2>
        <p> Hi!</p>
      </div>
    );
  };
  
  const CardB = () => {
    return (
      <div className="card-content">
        <h2>Twitter</h2>
        <p> Hi！</p>
      </div>
    );
  };
  const CardC = () => {
    return (
      <div className="card-content">
        <h2>Instagram</h2>
        <p> Hi!</p>
      </div>
    );
  };
  
  const CardD = () => {
    return (
      <div className="card-content">
        <h2>その他</h2>
        <p> Hi！</p>
      </div>
    );
  };
  
  return (
    <div className="gallery" ref={galleryRef}>
      <ul className="cards">
  {[...Array(31).keys()].map((num) => (
    <li key={num}>
      {num % 4 === 0 ? <CardA /> : num % 4 === 1 ? <CardB /> : num % 4 === 2 ? <CardC /> : <CardD />}
    </li>
  ))}
</ul>
      <div className="actions">
        <button className="buttonOutlineGradient">
          <div className="buttonOutlineGradient_item">Next</div>
        </button>
      </div>
      <div className="drag-proxy"></div>
    </div>
  );
};

const buildSeamlessLoop = (
  items: HTMLElement[], // HTMLElementの配列として型を指定
  spacing: number,
  animateFunc: (element: HTMLElement) => gsap.core.Timeline
) => {
  const rawSequence = gsap.timeline({ paused: true });
  const seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      this._time === this._dur && (this._tTime += this._dur - 0.01);
    },
    onReverseComplete() {
      this.totalTime(this.rawTime() + this.duration() * 100);
    },
  });
  const cycleDuration = spacing * items.length;
  let dur: number | null = null; // 初期値をnullに設定

  items
    .concat(items)
    .concat(items)
    .forEach((_item, i) => {
      const anim = animateFunc(items[i % items.length]);
      rawSequence.add(anim, i * spacing);
      if (!dur) dur = anim.duration();
    });

  if (dur === null) {
    return seamlessLoop;
  }

  seamlessLoop.fromTo(
    rawSequence,
    {
      time: cycleDuration + dur / 2,
    },
    {
      time: "+=" + cycleDuration,
      duration: cycleDuration,
      ease: "none",
    }
  );

  return seamlessLoop;
};

export default Gallery;
