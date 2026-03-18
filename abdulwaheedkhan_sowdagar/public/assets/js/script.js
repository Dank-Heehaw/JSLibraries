function applyHeroChoice(choice) {
  var heroEl = document.querySelector(".hero");
  var nameEl = document.querySelector(".hero-location-name");
  var subEl = document.querySelector(".hero-location-sub");
  var titleSmallEl = document.querySelector(".hero-title-small");
  var titleLargeEl = document.querySelector(".hero-title-large");
  var locationBlock = document.querySelector(".hero-location");
  var labelWord = document.querySelector(".hero-label-word");
  var labelArrow = document.querySelector(".hero-label-arrow");

  if (!heroEl || !nameEl || !subEl || !choice) return;

  if (choice.image) heroEl.style.backgroundImage = 'url("' + choice.image + '")';
  if (choice.name) nameEl.textContent = choice.name;
  if (choice.sub) subEl.textContent = choice.sub;
  if (titleSmallEl && choice.titleSmall) titleSmallEl.textContent = choice.titleSmall;
  if (titleLargeEl && choice.titleLarge) titleLargeEl.textContent = choice.titleLarge;

  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      [labelWord, labelArrow, titleSmallEl, titleLargeEl, locationBlock],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "power2.out" }
    );
  }
}

// Load curated hero locations from JSON and sync background + text + dropdown
fetch("assets/data/heroLocations.json")
  .then(function (response) { return response.json(); })
  .then(function (locations) {
    if (!Array.isArray(locations) || !locations.length) return;

    var dropdownBtn = document.getElementById("heroDropdownButton");
    var dropdownMenu = document.getElementById("heroDropdownMenu");
    var dropdownLabel = document.getElementById("heroDropdownLabel");

    function getOptionLabel(loc, idx) {
      return (loc.titleLarge || loc.name || ("Location " + (idx + 1))).replace(/\.$/, "");
    }

    function closeDropdown() {
      if (!dropdownMenu || !dropdownBtn) return;
      dropdownMenu.classList.add("hidden");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }

    function openDropdown() {
      if (!dropdownMenu || !dropdownBtn) return;
      dropdownMenu.classList.remove("hidden");
      dropdownBtn.setAttribute("aria-expanded", "true");
    }

    function toggleDropdown() {
      if (!dropdownMenu) return;
      if (dropdownMenu.classList.contains("hidden")) openDropdown();
      else closeDropdown();
    }

    function setDropdownSelection(idx) {
      if (!locations[idx]) return;
      if (dropdownLabel) dropdownLabel.textContent = getOptionLabel(locations[idx], idx);
      applyHeroChoice(locations[idx]);
      closeDropdown();
    }

    if (dropdownMenu) {
      dropdownMenu.innerHTML = "";
      locations.forEach(function (loc, idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "hero-dropdown-item w-full text-right whitespace-nowrap px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none";
        btn.setAttribute("role", "menuitem");
        btn.textContent = getOptionLabel(loc, idx);
        btn.addEventListener("click", function () { setDropdownSelection(idx); });
        dropdownMenu.appendChild(btn);
      });
    }

    if (dropdownBtn) {
      dropdownBtn.addEventListener("click", function (e) {
        e.preventDefault();
        toggleDropdown();
      });
    }

    document.addEventListener("click", function (e) {
      var root = document.getElementById("heroDropdown");
      if (!root) return;
      if (!root.contains(e.target)) closeDropdown();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDropdown();
    });

    var randomIndex = Math.floor(Math.random() * locations.length);
    var choice = locations[randomIndex];
    applyHeroChoice(choice);
    if (dropdownLabel) dropdownLabel.textContent = getOptionLabel(choice, randomIndex);

    // Optional: set initial selection via dropdown click handlers only.
  })
  .catch(function () {
    // Fail silently; fallback CSS background and static text remain.
  });

function renderDestinationCards(destinations) {
  var cardsRoot = document.getElementById("storyCards");
  if (!cardsRoot || !Array.isArray(destinations)) return;
  var fallbackImage =
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=70";

  cardsRoot.innerHTML = "";

  destinations.forEach(function (item) {
    var slide = document.createElement("li");
    slide.className = "glide__slide";

    var card = document.createElement("figure");
    card.className = "story-card";

    var imageWrap = document.createElement("div");
    imageWrap.className = "story-card-image";

    var img = document.createElement("img");
    img.src = item.image || fallbackImage;
    img.alt = item.alt || item.title || "Destination image";
    img.addEventListener("error", function () {
      if (img.src !== fallbackImage) {
        img.src = fallbackImage;
        return;
      }

      // If fallback also fails, avoid broken-image icon/alt clipping artifacts.
      img.style.display = "none";
      imageWrap.style.backgroundImage = 'url("' + fallbackImage + '")';
      imageWrap.style.backgroundSize = "cover";
      imageWrap.style.backgroundPosition = "center";
    });
    imageWrap.appendChild(img);

    if (item.badge) {
      var badge = document.createElement("span");
      badge.className = "story-card-badge";
      badge.textContent = item.badge;
      imageWrap.appendChild(badge);
    }

    var body = document.createElement("div");
    body.className = "story-card-body";

    var meta = document.createElement("div");
    meta.className = "story-card-meta";

    var tag = document.createElement("span");
    tag.className = "story-card-tag";
    tag.textContent = item.meta || "";
    meta.appendChild(tag);

    var rating = document.createElement("span");
    rating.className = "story-card-rating";
    rating.textContent = typeof item.rating === "number" ? item.rating.toFixed(1) : "";
    meta.appendChild(rating);

    var title = document.createElement("h3");
    title.className = "story-card-title";
    title.textContent = item.title || "";

    var location = document.createElement("p");
    location.className = "story-card-location";
    location.textContent = [item.location, item.dateRange].filter(Boolean).join(" · ");

    var copy = document.createElement("p");
    copy.className = "story-card-copy";
    copy.textContent = item.copy || "";

    var footer = document.createElement("div");
    footer.className = "story-card-footer";

    var price = document.createElement("span");
    price.className = "story-card-price";
    price.innerHTML = "<strong>" + (item.currencySymbol || "$") + String(item.pricePerNight || "") + "</strong> night";

    var cta = document.createElement("button");
    cta.type = "button";
    cta.className = "story-card-cta";
    cta.textContent = "See this route";

    footer.appendChild(price);
    footer.appendChild(cta);

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(location);
    body.appendChild(copy);
    body.appendChild(footer);

    card.appendChild(imageWrap);
    card.appendChild(body);
    slide.appendChild(card);
    cardsRoot.appendChild(slide);
  });
}

function renderGallery(destinations) {
  var galleryRoot = document.getElementById("galleryGrid");
  if (!galleryRoot || !Array.isArray(destinations)) return;

  galleryRoot.innerHTML = "";

  var photoSlots = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
  photoSlots.forEach(function (slot, idx) {
    var item = destinations[idx % destinations.length];
    var tile = document.createElement("figure");
    tile.className = "gallery-item gallery-photo tile-" + slot;

    var img = document.createElement("img");
    img.src = item.image || "";
    img.alt = item.alt || item.title || "Japan destination";
    tile.appendChild(img);

    galleryRoot.appendChild(tile);
  });

  var quote = document.createElement("div");
  quote.className = "gallery-copy gallery-copy-quote";
  quote.textContent = "From cherry blossoms to neon nights, Japan rewards every detour.";
  galleryRoot.appendChild(quote);

  var title = document.createElement("div");
  title.className = "gallery-copy gallery-copy-title";
  title.innerHTML = "<span>WANDER</span><span>JAPAN</span><span>2026</span>";
  galleryRoot.appendChild(title);

  var tag = document.createElement("div");
  tag.className = "gallery-copy gallery-copy-tag";
  tag.textContent = "TOKYO TO HOKKAIDO";
  galleryRoot.appendChild(tag);

  var leftArrow = document.createElement("button");
  leftArrow.type = "button";
  leftArrow.className = "gallery-nav-block gallery-nav-left";
  leftArrow.textContent = "←";
  galleryRoot.appendChild(leftArrow);

  var rightArrow = document.createElement("button");
  rightArrow.type = "button";
  rightArrow.className = "gallery-nav-block gallery-nav-right";
  rightArrow.textContent = "→";
  galleryRoot.appendChild(rightArrow);

  var credit = document.createElement("div");
  credit.className = "gallery-copy gallery-copy-credit";
  credit.textContent = "Explore Japan visual board";
  galleryRoot.appendChild(credit);
}

var storyGlide = null;

function initStoryCarousel() {
  var carouselEl = document.getElementById("storyCarousel");
  if (!carouselEl || typeof Glide === "undefined") return;

  if (storyGlide) {
    storyGlide.destroy();
    storyGlide = null;
  }

  storyGlide = new Glide(carouselEl, {
    type: "carousel",
    startAt: 0,
    perView: 3,
    gap: 24,
    autoplay: 1,
    hoverpause: true,
    animationDuration: 3200,
    animationTimingFunc: "linear",
    breakpoints: {
      1100: { perView: 2 },
      760: { perView: 1 }
    }
  });

  storyGlide.mount();

  var cards = carouselEl.querySelectorAll(".story-card");
  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      if (storyGlide) storyGlide.pause();
    });
    card.addEventListener("mouseleave", function () {
      if (storyGlide) storyGlide.play();
    });
  });
}

fetch("assets/data/destinations.json")
  .then(function (response) { return response.json(); })
  .then(function (destinations) {
    if (!Array.isArray(destinations) || !destinations.length) return;
    renderDestinationCards(destinations);
    initStoryCarousel();
    renderGallery(destinations);
  })
  .catch(function () {
    // Fail silently if destinations are missing.
  });

// fullPage scroll
new fullpage('#fullpage', {
  autoScrolling: true,
  navigation: true,
  scrollOverflow: true
});

// GSAP animation
gsap.from(".hero-title-large", {
  opacity: 0,
  duration: 1.2
});

gsap.from(".hero-subtitle", {
  y: 30,
  opacity: 0,
  duration: 1,
  delay: .15
});

gsap.from(".hero-side", {
  x: 40,
  opacity: 0,
  duration: 1,
  delay: .25
});

gsap.to(".hero-scroll", {
  y: 10,
  opacity: 1,
  duration: 1,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true
});

