(function($) {
  $(document).ready(function() {
    // lazy load
    progressively.init();

    // translation
    const languages = ["ru", "en"];
    const localStorageLang = localStorage.lang;
    const browserLang = window.navigator.language || null;

    let selectedLang = "ru";
    if (localStorageLang && languages.includes(localStorageLang)) {
      selectedLang = localStorageLang;
    } else if (browserLang !== "ru-RU") {
      selectedLang = "en";
    }

    if (selectedLang === "en") {
      $('[data-lang="en"]')
        .parent()
        .addClass("active");
    } else {
      $('[data-lang="ru"]')
        .parent()
        .addClass("active");
    }

    const translator = domI18n({
      selector: "[data-translatable]",
      languages,
      defaultLanguage: selectedLang,
      currentLanguage: selectedLang,
    });

    $(".language-switcher__item-link").on("click", function() {
      $(this).data("lang");
      const lang = $(this).data("lang");
      if (!languages.includes(lang)) {
        return;
      }

      translator.changeLanguage(lang);
      $(".language-switcher__item-link")
        .parent()
        .removeClass("active");
      $(this)
        .parent()
        .addClass("active");
      localStorage.lang = lang;
    });

    // Floating header
    $(window).on("mousewheel", function(e) {
      // Scroll up
      if (e.originalEvent.wheelDelta >= 0) {
        const scrollPosition = $(document).scrollTop();
        const heroHeight = $("#hero").height();

        if (scrollPosition >= heroHeight) {
          $("#header").addClass("floating");
        } else {
          $("#header").removeClass("floating");
        }
      }
      // Scroll down
      else {
        $("#header").removeClass("floating");
      }
    });

    // Flying rocket
    $("#rocket_fly").on("click", function() {
      $(this)
        .find(".rocket")
        .addClass("rocket-fly");
    });

    // Footer music
    const sound = new Howl({
      src: "../sounds/Sega_-_Streets_Of_Rage.mp3",
      loop: true,
      preload: false,
      volume: 0.05,
    });

    let musicLoaded = false;
    let musicLoading = false;
    $("#play_music").on("click", function() {
      if (musicLoading) {
        return;
      }
      if (!musicLoaded) {
        musicLoading = true;
        return sound.load();
      }

      if (sound && sound.seek() > 0) {
        return sound.stop();
      }
      sound.play();
    });
    // Clear listener after first call.
    sound.once("load", function() {
      sound.play();
      musicLoaded = true;
      musicLoading = false;
    });

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function(e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      });
    });

    // Disable canvas save on rmb default option
    $(document).on("contextmenu", "canvas", function() {
      console.log("test");
    });

    // Scroll animations
    const animatedFadeIn = $(".scroll-fadeIn").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          animateCSS(el, "fadeIn");
        }
      },
      offset: "100%",
    });

    const animatedPreImgNet = $(".image-net__core-wrapper").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          if ($(el).hasClass("played")) {
            return;
          }
          const lines = $(el).find(".net-line");
          lines.addClass("invisible");
        }
      },
      offset: "125%",
    });

    const animatedImgNet = $(".image-net__core-wrapper").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          if ($(el).hasClass("played")) {
            return;
          }
          const lines = $(el).find(".net-line");

          $(el).addClass("played");
          lines.addClass("invisible");
          setTimeout(() => {
            lines.each(function(index) {
              const self = $(this);
              if (index === 0) {
                setTimeout(() => {
                  self.removeClass("invisible");
                  self.addClass("net-top-left");
                }, 0);
              }
              if (index === 1) {
                setTimeout(() => {
                  self.removeClass("invisible");
                  self.addClass("net-top-right");
                }, 500);
              }
              if (index === 2) {
                setTimeout(() => {
                  self.removeClass("invisible");
                  self.addClass("net-bottom-left");
                }, 1000);
              }
              if (index === 3) {
                setTimeout(() => {
                  self.removeClass("invisible");
                  self.addClass("net-bottom-right");
                }, 1500);
              }
            });
          }, 500);
        }
      },
      offset: "100%",
    });

    const animatedHero = $(".hero-section").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const tEl = $(this.element).find(".hero-section__title")[0];
          const sEl = $(this.element).find(".hero-section__subtitle")[0];
          animateCSS(tEl, "fadeIn");
          animateCSS(sEl, "fadeIn");
        }
      },
      offset: "100%",
    });

    const animatedRocket = $(".rocket").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          animateCSS(el, "bounceInUp");
        }
      },
      offset: "100%",
    });

    const animatedPreServiceCards = $(".service-card").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          if (!$(el).hasClass("animated")) {
            $(el).addClass("invisible");
          }
        }
      },
      offset: "150%",
    });

    const animatedServiceCards = $(".service-card-wrapper").waypoint({
      handler: function(direction) {
        if (direction === "down") {
          const el = this.element;
          const cards = $(el).find(".service-card");
          const qty = cards.length;

          cards.each(function(index) {
            // const delay = 250 * (qty - index); // reverse
            const delay = 250 * qty - 250 * (qty - index);
            setTimeout(() => {
              $(this).removeClass("invisible");
              animateCSS($(this)[0], "fadeIn", "slow");
            }, delay);
          });
        }
      },
      offset: "100%",
    });

    // Compatibility check
    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    window.requestAnimationFrame = requestAnimationFrame;

    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    // Hero canvas animation
    const heroSectionEl = document.getElementById("hero");
    const heroCanvas = document.getElementById("hero-canvas");
    const heroCtx = heroCanvas.getContext("2d");
    let heroAnimation = true;
    let heroPoints = [];
    let heroTarget = { x: windowWidth / 2, y: windowHeight / 2 };

    initHero();
    init_animateHero();

    function initHero() {
      // heroSectionEl.style.height = windowHeight + "px";

      heroCanvas.width = windowWidth;
      heroCanvas.height = windowHeight;

      // create points
      heroPoints = [];
      let multiplier = 20;
      if (windowWidth <= 425) {
        multiplier = 5;
      }
      for (var x = 0; x < windowWidth; x = x + windowWidth / multiplier) {
        for (var y = 0; y < windowHeight; y = y + windowHeight / multiplier) {
          var px = x + (Math.random() * windowWidth) / multiplier;
          var py = y + (Math.random() * windowHeight) / multiplier;
          var p = { x: px, originX: px, y: py, originY: py };
          heroPoints.push(p);
        }
      }

      // for each point find the 5 closest points
      for (var i = 0; i < heroPoints.length; i++) {
        var closest = [];
        var p1 = heroPoints[i];
        for (var j = 0; j < heroPoints.length; j++) {
          var p2 = heroPoints[j];
          if (!(p1 == p2)) {
            var placed = false;
            for (var k = 0; k < 5; k++) {
              if (!placed) {
                if (closest[k] == undefined) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }

            for (var k = 0; k < 5; k++) {
              if (!placed) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // assign a circle to each point
      for (var i in heroPoints) {
        var c = new Circle(
          heroPoints[i],
          2 + Math.random() * 2,
          "rgba(255,255,255,0.3)",
        );
        heroPoints[i].circle = c;
      }
    }

    // animation
    function init_animateHero() {
      animateHero();
      for (var i in heroPoints) {
        shiftHeroPoint(heroPoints[i]);
      }
    }

    function animateHero() {
      if (heroAnimation) {
        heroCtx.clearRect(0, 0, windowWidth, windowHeight);
        for (var i in heroPoints) {
          // detect points in range
          if (Math.abs(getDistance(heroTarget, heroPoints[i])) < 4000) {
            heroPoints[i].active = 0.3;
            heroPoints[i].circle.active = 0.6;
          } else if (Math.abs(getDistance(heroTarget, heroPoints[i])) < 20000) {
            heroPoints[i].active = 0.1;
            heroPoints[i].circle.active = 0.3;
          } else if (Math.abs(getDistance(heroTarget, heroPoints[i])) < 40000) {
            heroPoints[i].active = 0.02;
            heroPoints[i].circle.active = 0.1;
          } else {
            heroPoints[i].active = 0;
            heroPoints[i].circle.active = 0;
          }

          drawHeroLines(heroPoints[i]);
          heroPoints[i].circle.draw();
        }
      }
      requestAnimationFrame(animateHero);
    }

    function shiftHeroPoint(p) {
      TweenLite.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: function() {
          shiftHeroPoint(p);
        },
      });
    }

    // Canvas manipulation
    function drawHeroLines(p) {
      if (!p.active) return;
      for (var i in p.closest) {
        heroCtx.beginPath();
        heroCtx.moveTo(p.x, p.y);
        heroCtx.lineTo(p.closest[i].x, p.closest[i].y);
        heroCtx.strokeStyle = "rgba(130,142,158," + p.active + ")";
        heroCtx.stroke();
      }
    }

    function Circle(pos, rad, color) {
      var _this = this;

      // constructor
      (function() {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
      })();

      this.draw = function() {
        if (!_this.active) return;
        heroCtx.beginPath();
        heroCtx.arc(
          _this.pos.x,
          _this.pos.y,
          _this.radius,
          0,
          2 * Math.PI,
          false,
        );
        heroCtx.fillStyle = "rgba(156,217,249," + _this.active + ")";
        heroCtx.fill();
      };
    }

    // Util
    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // Footer canvas animation
    // Terrain stuff.
    const footerBackground = document.getElementById("footer-canvas"),
      fbgCtx = footerBackground.getContext("2d"),
      footerEl = $("#footer")[0],
      footerCanvasClassName = "footer-canvas";

    let footerHeight = $("#footer").height();
    let footerAnimation = true;

    footerHeight = footerHeight < 880 ? 880 : footerHeight;

    footerBackground.width = windowWidth;
    footerBackground.height = footerHeight;

    function Terrain(options) {
      options = options || {};
      this.terrain = document.createElement("canvas");
      this.terCtx = this.terrain.getContext("2d");
      this.scrollDelay = options.scrollDelay || 90;
      this.lastScroll = new Date().getTime();

      this.terrain.className = footerCanvasClassName;
      this.terrain.width = windowWidth;
      this.terrain.height = footerHeight;
      this.fillStyle = options.fillStyle || "#191D4C";
      this.mHeight = options.mHeight || footerHeight;

      // generate
      this.points = [];

      var displacement = options.displacement || 140,
        power = Math.pow(2, Math.ceil(Math.log(windowWidth) / Math.log(2)));

      // set the start height and end height for the terrain
      this.points[0] = this.mHeight; //(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
      this.points[power] = this.points[0];

      // create the rest of the points
      for (var i = 1; i < power; i *= 2) {
        for (var j = power / i / 2; j < power; j += power / i) {
          this.points[j] =
            (this.points[j - power / i / 2] + this.points[j + power / i / 2]) /
              2 +
            Math.floor(Math.random() * -displacement + displacement);
        }
        displacement *= 0.6;
      }

      // document.body.appendChild(this.terrain);
      footerEl.appendChild(this.terrain);
    }

    Terrain.prototype.update = function() {
      // draw the terrain
      this.terCtx.clearRect(0, 0, windowWidth, footerHeight);
      this.terCtx.fillStyle = this.fillStyle;

      if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
        this.lastScroll = new Date().getTime();
        this.points.push(this.points.shift());
      }

      this.terCtx.beginPath();
      for (var i = 0; i <= windowWidth; i++) {
        if (i === 0) {
          this.terCtx.moveTo(0, this.points[0]);
        } else if (this.points[i] !== undefined) {
          this.terCtx.lineTo(i, this.points[i]);
        }
      }

      this.terCtx.lineTo(windowWidth, this.terrain.height);
      this.terCtx.lineTo(0, this.terrain.height);
      this.terCtx.lineTo(0, this.points[0]);
      this.terCtx.fill();
    };

    // Second canvas used for the stars
    fbgCtx.fillStyle = "#05004c";
    fbgCtx.fillRect(0, 0, windowWidth, footerHeight);

    // stars
    function Star(options) {
      this.size = Math.random() * 2;
      this.speed = Math.random() * 0.05;
      this.x = options.x;
      this.y = options.y;
    }

    Star.prototype.reset = function() {
      this.size = Math.random() * 2;
      this.speed = Math.random() * 0.05;
      this.x = windowWidth;
      this.y = Math.random() * footerHeight;
    };

    Star.prototype.update = function() {
      this.x -= this.speed;
      if (this.x < 0) {
        this.reset();
      } else {
        fbgCtx.fillRect(this.x, this.y, this.size, this.size);
      }
    };

    function ShootingStar() {
      this.reset();
    }

    ShootingStar.prototype.reset = function() {
      this.x = Math.random() * windowWidth;
      this.y = 0;
      this.len = Math.random() * 80 + 10;
      this.speed = Math.random() * 10 + 6;
      this.size = Math.random() * 1 + 0.1;
      // this is used so the shooting stars arent constant
      this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
      this.active = false;
    };

    ShootingStar.prototype.update = function() {
      if (this.active) {
        this.x -= this.speed;
        this.y += this.speed;
        if (this.x < 0 || this.y >= footerHeight) {
          this.reset();
        } else {
          fbgCtx.lineWidth = this.size;
          fbgCtx.beginPath();
          fbgCtx.moveTo(this.x, this.y);
          fbgCtx.lineTo(this.x + this.len, this.y - this.len);
          fbgCtx.stroke();
        }
      } else {
        if (this.waitTime < new Date().getTime()) {
          this.active = true;
        }
      }
    };

    var footerEntities = [];

    // init the stars
    for (var i = 0; i < footerHeight; i++) {
      footerEntities.push(
        new Star({
          x: Math.random() * windowWidth,
          y: Math.random() * footerHeight,
        }),
      );
    }

    // Add 2 shooting stars that just cycle.
    footerEntities.push(new ShootingStar());
    footerEntities.push(new ShootingStar());
    footerEntities.push(
      new Terrain({ mHeight: footerHeight / 1.4 - 120, fillStyle: "#94A2B5" }),
    );
    footerEntities.push(
      new Terrain({
        displacement: 120,
        scrollDelay: 50,
        fillStyle: "#828E9E",
        mHeight: footerHeight / 1.4 - 60,
      }),
    );
    footerEntities.push(
      new Terrain({
        displacement: 100,
        scrollDelay: 20,
        fillStyle: "#4A4A4A",
        mHeight: footerHeight / 1.4,
      }),
    );

    //animate footer background
    function animateFooter() {
      if (footerAnimation) {
        fbgCtx.fillStyle = "#3F3D56"; //bg
        fbgCtx.fillRect(0, 0, windowWidth, footerHeight);
        fbgCtx.fillStyle = "#E9E9EB"; //stars
        fbgCtx.strokeStyle = "#E9E9EB"; // shooting stars

        var entLen = footerEntities.length;

        while (entLen--) {
          footerEntities[entLen].update();
        }
      }
      requestAnimationFrame(animateFooter);
    }
    animateFooter();

    // Event handling
    function addListeners() {
      if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", mouseMove);
      }
      window.addEventListener("scroll", scrollCheck);
      window.addEventListener("resize", resize);
    }
    addListeners();
    scrollCheck();
    resize();

    function resize() {
      // reasign variables on window resize
      windowWidth = $(window).width();
      windowHeight = $(window).height();

      // reasign hero animation variables
      // heroSectionEl.style.height = windowHeight + "px";
      heroCanvas.width = windowWidth;
      heroCanvas.height = windowHeight;

      if ($(".footer-canvas").length > 0) {
        $(".footer-canvas").each(function() {
          $(this)[0].width = windowWidth;
        });
      }
    }

    function scrollCheck() {
      // disable hero animation if header out of viewpoint
      if ($(document).scrollTop() > heroSectionEl.offsetHeight)
        heroAnimation = false;
      else heroAnimation = true;

      // disable footer animation if footer out of viewpoint
      if ($(document).scrollTop() < $("body").height() + footerHeight)
        footerAnimation = false;
      else footerAnimation = true;
    }

    function mouseMove(e) {
      // Update hero animation on mouse move
      var posx,
        posy = 0;

      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
        posy =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;
      }
      heroTarget.x = posx;
      heroTarget.y = posy;
    }
    // end of code
  }); // ready closer
})(jQuery);

function animateCSS(element, animationName, speed, callback) {
  // const node = document.querySelector(element);
  const node = element;
  node.classList.add("animated", animationName);
  if (speed) {
    node.classList.add(speed, animationName);
  }

  function handleAnimationEnd() {
    // node.classList.remove("animated", animationName);
    // if (speed) {
    //   node.classList.remove(speed, animationName);
    // }

    node.removeEventListener("animationend", handleAnimationEnd);

    if (typeof callback === "function") callback();
  }

  node.addEventListener("animationend", handleAnimationEnd);
}

// animateCSS('.my-element', 'bounce')

// // or
// animateCSS('.my-element', 'bounce', function() {
//   // Do something after animation
// })
