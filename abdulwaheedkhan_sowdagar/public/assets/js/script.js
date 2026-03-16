// fullPage scroll

new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    scrollOverflow: true
    });
    
    
    // Masonry grid
    
    var grid = document.querySelector('.poster-grid');
    
    new Masonry(grid, {
    itemSelector: 'a',
    columnWidth: 'a',
    percentPosition: true
    });
    
    
    // GSAP animation
    
    gsap.from(".title", {
    y:100,
    opacity:0,
    duration:1.2
    });
    
    gsap.from(".poster", {
    opacity:0,
    y:40,
    stagger:.2,
    duration:1
    });