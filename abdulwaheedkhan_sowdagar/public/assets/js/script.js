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

// fullPage scroll
new fullpage('#fullpage', {
  autoScrolling: true,
  navigation: true,
  scrollOverflow: true
});

// Masonry grid
var grid = document.querySelector('.poster-grid');
if (grid) {
  new Masonry(grid, {
    itemSelector: 'a',
    columnWidth: 'a',
    percentPosition: true
  });
}

// GSAP animation
gsap.from(".hero-title-large", {
  y: 100,
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

gsap.from(".poster", {
  opacity: 0,
  y: 40,
  stagger: .2,
  duration: 1
});