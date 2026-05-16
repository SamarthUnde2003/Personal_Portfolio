document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const sliderBox = document.getElementById("sliderBox");

  if (!slides.length || !sliderBox) return;

  let index = 0;

  // 🔒 FIXED, CONSISTENT SPACING
  const slideWidth = slides[0].getBoundingClientRect().width;
  const SPACING = slideWidth * 0.7; // adjust 0.6–0.8 if needed

  function updateSlider() {
    slides.forEach((slide, i) => {
      const offset = i - index;
      slide.dataset.offset = offset;

      if (Math.abs(offset) > 3) {
        slide.style.opacity = "0";
        slide.style.pointerEvents = "none";
        return;
      }

      slide.style.opacity = "1";
      slide.style.pointerEvents = "auto";

      // 🔒 STABLE Z-ORDER
      slide.style.zIndex = offset === 0 ? 10 : 5 - Math.abs(offset);

      slide.style.transform = `
        translate(-50%, -50%)
        translateX(${offset * SPACING}px)
        scale(${offset === 0 ? 1 : 0.8})
        rotateY(${offset * -18}deg)
      `;
    });
  }

  slides.forEach((slide) => {
    slide.addEventListener("click", (e) => {
      e.stopPropagation();
      const offset = Number(slide.dataset.offset);

      if (offset < 0) {
        index = (index - 1 + slides.length) % slides.length;
      } else {
        index = (index + 1) % slides.length;
      }

      updateSlider();
    });
  });

  updateSlider();
});
