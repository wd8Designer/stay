 
  
   
    gsap.registerPlugin(Draggable,Observer,ScrambleTextPlugin,ScrollTrigger,ScrollToPlugin,SplitText)

    ScrollSmoother.create({
      wrapper: ".viewport",
      content: "#smooth-wrapper",
      smooth: 1.5,
      effects: true
    });

    const lenis = new Lenis({
    lerp: 0.07
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time)=>{
    lenis.raf(time * 1000)
    })

    // Images parallax
    gsap.utils.toArray('.hero-backlayer').forEach(container => {
    const img = container.querySelector('img');

    const tl = gsap.timeline({
        scrollTrigger: {
        trigger: container,
        scrub: true,
        pin: false,
        }
    });

    tl.fromTo(img, {
        yPercent: -20,
        ease: 'none'
    }, {
        yPercent: 20,
        ease: 'none'
    });
    });
    
  

  // Split text into lines
  const split = new SplitText("#scroll-text", {
    type: "lines"
  });

  gsap.set(split.lines, { display: "block" });

  // Animate text lines with reverse on scroll back
  gsap.from(split.lines, {
    scrollTrigger: {
      trigger: "#scroll-text",
      start: "top 80%",
      toggleActions: "play reverse play reverse"
    },
    rotationX: -100,
    y: 40,
    opacity: 0,
    transformOrigin: "50% 50% -160px",
    duration: 1,
    ease: "power3.out",
    stagger: 0.2
  });

  // Parallax background image
  gsap.to(".background-layer", {
    y: "-20%", // parallax depth
    ease: "none",
    scrollTrigger: {
      trigger: ".scroll-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
   const split2 = new SplitText(".hero-content h1", {
    type: "chars"
  });

  gsap.from(split2.chars, {
    x: 150,
    opacity: 0,
    duration: 0.7, 
    ease: "power4.out",
    stagger: 0.04
  });
 const split3 = new SplitText(".bottom-text h2 , .bottom-text p ", {
    type: "chars"
  });

  gsap.from(split3.chars, {
    y: 450,
    opacity: 0,
    duration: 1.9, 
    ease: "power4.out"
  });
 const track = document.querySelector(".slider-track");
  const slides = gsap.utils.toArray(".slide");

  // Duplicate slides for infinite loop
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });

  let totalWidth = 0;
  slides.forEach(slide => {
    totalWidth += slide.offsetWidth + 10; // 10px = gap
  });

  // GSAP infinite horizontal loop
  const loop = gsap.to(track, {
    x: `-=${totalWidth}`,
    duration: 30,
    ease: "none",
    repeat: -1,
  });

  // Drag to control
  let proxy = document.createElement("div");
  let drag = Draggable.create(proxy, {
    type: "x",
    trigger: ".gsap-slider",
    onDrag: function () {
      loop.progress(loop.progress() - this.deltaX / totalWidth);
    },
    inertia: true
  })[0];
// update frome here



const stickySection = document.querySelector(".sticky-sections");
const verticalSlides = stickySection.querySelectorAll(".v-slide");

verticalSlides.forEach((slide, index) => {
  const content = slide.querySelector(".slide-content");
  const heading = content?.querySelector("h3");

  // Hide content initially
  gsap.set(content, { autoAlpha: 0 });

  // Prepare SplitText for heading but do NOT animate yet
  let split;
  if (heading) {
    split = new SplitText(heading, { type: "chars" });
    gsap.set(split.chars, { opacity: 0, x: 150 });
  }

  // SLIDE ANIMATIONS

  if (index === 0) {
    // First slide expands width/height
    gsap.to(slide, {
      width: "100%",
      height: "100vh",
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: slide,
        start: "top top",
        end: "+=100%",
        scrub: true,
        onUpdate: self => {
          if (self.progress >= 0.7) {  // start showing content earlier (70%)
            if (content._shown !== true) {
              showContent(content, split);
              content._shown = true;
            }
          } else {
            if (content._shown) {
              hideContent(content);
              content._shown = false;
            }
          }
        }
      }
    });
  } else {
    // Other slides slide in from bottom
    gsap.fromTo(
      slide,
      { y: "100%", zIndex: 100 + index },
      {
        y: "0%",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: stickySection,
          start: () => `top+=${window.innerHeight * index}`,
          end: () => `top+=${window.innerHeight * (index + 1)}`,
          scrub: true,
          onUpdate: self => {
            if (self.progress >= 0.7) {  // start showing content earlier (70%)
              if (content._shown !== true) {
                showContent(content, split);
                content._shown = true;
              }
            } else {
              if (content._shown) {
                hideContent(content);
                content._shown = false;
              }
            }
          }
        }
      }
    );

    // Scale down previous slide
    const prevSlide = verticalSlides[index - 1];
    gsap.to(prevSlide, {
      scale: 0.9,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: stickySection,
        start: () => `top+=${window.innerHeight * index}`,
        end: () => `top+=${window.innerHeight * (index + 1)}`,
        scrub: true,
      }
    });
  }
});

// Pin the whole sticky section during scroll
ScrollTrigger.create({
  trigger: stickySection,
  start: "top top",
  end: () => `+=${verticalSlides.length * window.innerHeight}`,
  pin: true,
  scrub: true
});

// Helper functions for showing/hiding content with SplitText animation
function showContent(content, split) {
  gsap.killTweensOf(content);
  gsap.to(content, { autoAlpha: 1, duration: 0.3 });
  if (split) {
    gsap.killTweensOf(split.chars);
    gsap.fromTo(
      split.chars,
      { opacity: 0, x: 150 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.04,
        overwrite: "auto"
      }
    );
  }
}

function hideContent(content) {
  gsap.killTweensOf(content);
  gsap.to(content, { autoAlpha: 0, duration: 0.3 });
}

let sections = gsap.utils.toArray("#capsules .capsule");

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: "#capsules",
    pin: true,
    scrub: 1,
    end: () => "+=" + document.querySelector("#capsules").offsetWidth,
  }
});


  gsap.utils.toArray(".testimonial").forEach((el, index) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      }
    );
  });


  const bookingPopup = document.getElementById('bookingPopup');

  document.querySelector('.footer-button').addEventListener('click', (e) => {
    e.preventDefault();
    bookingPopup.style.display = 'flex';
  });

  function closePopup() {
    bookingPopup.style.display = 'none';
  }