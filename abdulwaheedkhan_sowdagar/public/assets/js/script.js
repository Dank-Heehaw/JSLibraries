"use strict";

const PATHS = {
  heroLocations: "assets/data/heroLocations.json",
  destinations: "assets/data/destinations.json"
};

const SELECTORS = {
  hero: ".hero",
  heroLocationName: ".hero-location-name",
  heroLocationSub: ".hero-location-sub",
  heroTitleSmall: ".hero-title-small",
  heroTitleLarge: ".hero-title-large",
  heroLocation: ".hero-location",
  heroLabelWord: ".hero-label-word",
  heroLabelArrow: ".hero-label-arrow"
};

const FALLBACKS = {
  cardImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=70",
  galleryAlt: "Japan destination"
};

const PHOTO_SLOTS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

const state = {
  heroLocations: [],
  latestDestinations: [],
  storyGlide: null
};

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const fetchJson = (url) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to fetch " + url);
    return response.json();
  });

function applyHeroChoice(choice) {
  if (!choice) return;

  const heroEl = document.querySelector(SELECTORS.hero);
  const nameEl = document.querySelector(SELECTORS.heroLocationName);
  const subEl = document.querySelector(SELECTORS.heroLocationSub);
  const titleSmallEl = document.querySelector(SELECTORS.heroTitleSmall);
  const titleLargeEl = document.querySelector(SELECTORS.heroTitleLarge);
  const locationBlock = document.querySelector(SELECTORS.heroLocation);
  const labelWord = document.querySelector(SELECTORS.heroLabelWord);
  const labelArrow = document.querySelector(SELECTORS.heroLabelArrow);

  if (!heroEl || !nameEl || !subEl) return;

  if (choice.image) heroEl.style.backgroundImage = 'url("' + choice.image + '")';
  if (choice.name) nameEl.textContent = choice.name;
  if (choice.sub) subEl.textContent = choice.sub;
  if (titleSmallEl && choice.titleSmall) titleSmallEl.textContent = choice.titleSmall;
  if (titleLargeEl && choice.titleLarge) titleLargeEl.textContent = choice.titleLarge;

  if (typeof gsap === "undefined") return;

  gsap.fromTo(
    [labelWord, labelArrow, titleSmallEl, titleLargeEl, locationBlock],
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "power2.out" }
  );
}

function createPriceElement(item) {
  const price = document.createElement("span");
  price.className = "story-card-price";

  const strong = document.createElement("strong");
  strong.textContent = (item.currencySymbol || "$") + String(item.pricePerNight || "");
  price.appendChild(strong);
  price.append(" night");

  return price;
}

function renderDestinationCards(destinations) {
  const cardsRoot = document.getElementById("storyCards");
  if (!cardsRoot || !Array.isArray(destinations)) return;

  cardsRoot.innerHTML = "";

  destinations.forEach((item) => {
    const slide = document.createElement("li");
    slide.className = "glide__slide";

    const card = document.createElement("figure");
    card.className = "story-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "story-card-image";

    const img = document.createElement("img");
    img.src = item.image || FALLBACKS.cardImage;
    img.alt = item.alt || item.title || "Destination image";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      if (img.src !== FALLBACKS.cardImage) {
        img.src = FALLBACKS.cardImage;
        return;
      }

      // If the fallback image also fails, use the wrapper as a final visual fallback.
      img.style.display = "none";
      imageWrap.style.backgroundImage = 'url("' + FALLBACKS.cardImage + '")';
      imageWrap.style.backgroundSize = "cover";
      imageWrap.style.backgroundPosition = "center";
    });
    imageWrap.appendChild(img);

    if (item.badge) {
      const badge = document.createElement("span");
      badge.className = "story-card-badge";
      badge.textContent = item.badge;
      imageWrap.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "story-card-body";

    const meta = document.createElement("div");
    meta.className = "story-card-meta";

    const tag = document.createElement("span");
    tag.className = "story-card-tag";
    tag.textContent = item.meta || "";
    meta.appendChild(tag);

    const rating = document.createElement("span");
    rating.className = "story-card-rating";
    rating.textContent = typeof item.rating === "number" ? item.rating.toFixed(1) : "";
    meta.appendChild(rating);

    const title = document.createElement("h3");
    title.className = "story-card-title";
    title.textContent = item.title || "";

    const location = document.createElement("p");
    location.className = "story-card-location";
    location.textContent = [item.location, item.dateRange].filter(Boolean).join(" · ");

    const copy = document.createElement("p");
    copy.className = "story-card-copy";
    copy.textContent = item.copy || "";

    const footer = document.createElement("div");
    footer.className = "story-card-footer";

    const cta = document.createElement("button");
    cta.type = "button";
    cta.className = "story-card-cta";
    cta.textContent = "See this route";

    footer.appendChild(createPriceElement(item));
    footer.appendChild(cta);

    body.append(meta, title, location, copy, footer);
    card.append(imageWrap, body);
    slide.appendChild(card);
    cardsRoot.appendChild(slide);
  });
}

function normalizeImageUrl(url) {
  return String(url || "").trim();
}

function getUniqueFallbackImage(slotIndex) {
  return "https://source.unsplash.com/1200x1600/?japan,travel&sig=" + (slotIndex + 1);
}

function createGalleryCopyBlock(className, text) {
  const node = document.createElement("div");
  node.className = className;
  node.textContent = text;
  return node;
}

function createGalleryTitleBlock() {
  const title = document.createElement("div");
  title.className = "gallery-copy gallery-copy-title";

  ["EXPLORE", "JAPAN", "2026"].forEach((word) => {
    const span = document.createElement("span");
    span.textContent = word;
    title.appendChild(span);
  });

  return title;
}

function renderGallery(destinations) {
  const galleryRoot = document.getElementById("galleryGrid");
  if (!galleryRoot || !Array.isArray(destinations)) return;

  galleryRoot.innerHTML = "";

  const uniqueGalleryItems = [];
  const seenImages = new Set();

  const appendUniqueItem = (image, alt) => {
    const normalized = normalizeImageUrl(image);
    if (!normalized || seenImages.has(normalized)) return;

    seenImages.add(normalized);
    uniqueGalleryItems.push({
      image: normalized,
      alt: alt || FALLBACKS.galleryAlt
    });
  };

  destinations.forEach((item) => {
    appendUniqueItem(item && item.image, item && (item.alt || item.title));
  });

  state.heroLocations.forEach((item) => {
    appendUniqueItem(item && item.image, item && (item.alt || item.name));
  });

  PHOTO_SLOTS.forEach((slot, idx) => {
    const item = uniqueGalleryItems[idx];
    const image = item ? item.image : getUniqueFallbackImage(idx);
    const alt = item ? item.alt : FALLBACKS.galleryAlt;

    const tile = document.createElement("figure");
    tile.className = "gallery-item gallery-photo tile-" + slot;

    const img = document.createElement("img");
    img.src = image;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";

    tile.appendChild(img);
    galleryRoot.appendChild(tile);
  });

  galleryRoot.appendChild(
    createGalleryCopyBlock(
      "gallery-copy gallery-copy-quote",
      "From cherry blossoms to neon nights, Japan rewards every detour."
    )
  );
  galleryRoot.appendChild(createGalleryTitleBlock());
  galleryRoot.appendChild(createGalleryCopyBlock("gallery-copy gallery-copy-tag", "FUKOKA TO HOKKAIDO"));

  const leftArrow = document.createElement("button");
  leftArrow.type = "button";
  leftArrow.className = "gallery-nav-block gallery-nav-left";
  leftArrow.textContent = "←";
  galleryRoot.appendChild(leftArrow);

  const rightArrow = document.createElement("button");
  rightArrow.type = "button";
  rightArrow.className = "gallery-nav-block gallery-nav-right";
  rightArrow.textContent = "→";
  galleryRoot.appendChild(rightArrow);

  galleryRoot.appendChild(createGalleryCopyBlock("gallery-copy gallery-copy-credit", "Explore Japan visual board"));
}

function initHeroDropdown(locations) {
  const dropdownRoot = document.getElementById("heroDropdown");
  const dropdownBtn = document.getElementById("heroDropdownButton");
  const dropdownMenu = document.getElementById("heroDropdownMenu");
  const dropdownLabel = document.getElementById("heroDropdownLabel");

  const getOptionLabel = (loc, idx) =>
    (loc.titleLarge || loc.name || ("Location " + (idx + 1))).replace(/\.$/, "");

  const closeDropdown = () => {
    if (!dropdownMenu || !dropdownBtn) return;
    dropdownMenu.classList.add("hidden");
    dropdownBtn.setAttribute("aria-expanded", "false");
  };

  const openDropdown = () => {
    if (!dropdownMenu || !dropdownBtn) return;
    dropdownMenu.classList.remove("hidden");
    dropdownBtn.setAttribute("aria-expanded", "true");
  };

  const toggleDropdown = () => {
    if (!dropdownMenu) return;
    if (dropdownMenu.classList.contains("hidden")) openDropdown();
    else closeDropdown();
  };

  const setDropdownSelection = (idx) => {
    if (!locations[idx]) return;

    if (dropdownLabel) dropdownLabel.textContent = getOptionLabel(locations[idx], idx);
    applyHeroChoice(locations[idx]);
    closeDropdown();
  };

  if (dropdownMenu) {
    dropdownMenu.innerHTML = "";

    locations.forEach((loc, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "hero-dropdown-item w-full text-right whitespace-nowrap px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none";
      btn.setAttribute("role", "menuitem");
      btn.textContent = getOptionLabel(loc, idx);
      btn.addEventListener("click", () => setDropdownSelection(idx));
      dropdownMenu.appendChild(btn);
    });
  }

  if (dropdownBtn) {
    dropdownBtn.addEventListener("click", (event) => {
      event.preventDefault();
      toggleDropdown();
    });
  }

  document.addEventListener("click", (event) => {
    if (!dropdownRoot) return;
    if (!dropdownRoot.contains(event.target)) closeDropdown();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDropdown();
  });

  const randomIndex = Math.floor(Math.random() * locations.length);
  const choice = locations[randomIndex];
  applyHeroChoice(choice);
  if (dropdownLabel) dropdownLabel.textContent = getOptionLabel(choice, randomIndex);
}

function initStoryCarousel() {
  const carouselEl = document.getElementById("storyCarousel");
  if (!carouselEl || typeof Glide === "undefined") return;

  if (state.storyGlide) {
    state.storyGlide.destroy();
    state.storyGlide = null;
  }

  state.storyGlide = new Glide(carouselEl, {
    type: "carousel",
    startAt: 0,
    perView: 3,
    gap: 24,
    // Extra clones reduce visible blank space during loop handoff.
    cloningRatio: 4,
    // Keep autoplay cadence aligned with animation to avoid clone-edge flicker.
    autoplay: 3300,
    hoverpause: true,
    animationDuration: 3200,
    animationTimingFunc: "linear",
    breakpoints: {
      1100: { perView: 2 },
      760: { perView: 1 }
    }
  });

  state.storyGlide.mount();

  // Delegate hover handling to cover original and cloned Glide slides.
  carouselEl.addEventListener("mouseover", (event) => {
    if (!state.storyGlide) return;

    const enteredCard = event.target && event.target.closest(".story-card");
    if (!enteredCard) return;

    const from = event.relatedTarget;
    if (from && enteredCard.contains(from)) return;
    state.storyGlide.pause();
  });

  carouselEl.addEventListener("mouseout", (event) => {
    if (!state.storyGlide) return;

    const exitedCard = event.target && event.target.closest(".story-card");
    if (!exitedCard) return;

    const to = event.relatedTarget;
    if (to && exitedCard.contains(to)) return;
    if (to && carouselEl.contains(to) && to.closest(".story-card")) return;
    state.storyGlide.play();
  });
}

function initFullpageScroll() {
  if (typeof fullpage === "undefined") return;

  new fullpage("#fullpage", {
    autoScrolling: true,
    navigation: true,
    scrollOverflow: true,
    // Allow natural document scrolling on smaller screens.
    responsiveWidth: 900
  });
}

function initGsapAnimations() {
  if (typeof gsap === "undefined") return;

  gsap.from(".hero-title-large", {
    opacity: 0,
    duration: 1.2
  });

  gsap.from(".hero-subtitle", {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.15
  });

  gsap.from(".hero-side", {
    x: 40,
    opacity: 0,
    duration: 1,
    delay: 0.25
  });

  gsap.to(".hero-scroll", {
    y: 10,
    opacity: 1,
    duration: 1,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });
}

function loadHeroLocations() {
  fetchJson(PATHS.heroLocations)
    .then((locations) => {
      if (!isNonEmptyArray(locations)) return;

      state.heroLocations = locations.slice();
      initHeroDropdown(locations);

      // Re-render once hero data is available to maximize unique gallery tiles.
      if (isNonEmptyArray(state.latestDestinations)) renderGallery(state.latestDestinations);
    })
    .catch(() => {
      // Fail silently; fallback CSS background and static text remain.
    });
}

function loadDestinations() {
  fetchJson(PATHS.destinations)
    .then((destinations) => {
      if (!isNonEmptyArray(destinations)) return;

      state.latestDestinations = destinations.slice();
      renderDestinationCards(destinations);
      initStoryCarousel();
      renderGallery(destinations);
    })
    .catch(() => {
      // Fail silently if destinations are missing.
    });
}

loadHeroLocations();
loadDestinations();
initFullpageScroll();
initGsapAnimations();

