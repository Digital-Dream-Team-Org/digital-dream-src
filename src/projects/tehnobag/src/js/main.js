(function($) {
  $(document).ready(function() {
    // parallax
    var scene = document.getElementById("scene_1");
    var parallaxInstance = new Parallax(scene, {
      selector: ".layer"
    });

    // Lazy load
    $(".lazy").lazy();

    // Load features on mobile
    $("#loadFeaturesBtn").on("click", function() {
      $(this)
        .removeClass("d-block")
        .addClass("d-none");
      $(".feature").removeClass("d-none");
    });

    // Open video overlay
    $("#videoBtn, #aboutVideoBtn").on("click", function() {
      $("#video-popup").addClass("active");
      $("body").addClass("overflow-hidden");
      $(".youtube-video-place").html(
        '<iframe allowfullscreen allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="embed-responsive-item" src="' +
          $(".youtube-video-place").data("yt-url") +
          '" ></iframe>'
      );
    });

    $(".message__close, .popup-form__close").on("click", function() {
      $(".cdk-overlay").removeClass("active");
      $("body").removeClass("overflow-hidden");
    });

    // Close overlay on outside click
    $(".cdk-overlay").on("click", function() {
      $(this).removeClass("active");
      $("body").removeClass("overflow-hidden");

      // Destroy iframe video player
      $(".youtube-video-place").html(
        `
        <div class="play-youtube-video">
          <i class="icon-play-circled"></i>
        </div>
        `
      );
    });

    // Prevent overlay close on overlay content click
    $(".cdk-overlay__content").on("click", function(e) {
      e.stopPropagation();
    });

    $("#contactForm").on("submit", function(e) {
      e.preventDefault();
      const url = $(this).attr("action");
      const method = $(this).attr("method");
      const serialized = $(this).serialize();

      $.ajax({
        url,
        type: method,
        data: serialized,
        success: function(data) {
          $("#success-popup").addClass("active");
        },
        error: function(data) {
          $("#error-popup").addClass("active");
        }
      });
    });

    $(".open-popup-form-btn").on("click", function() {
      $("#form-popup").addClass("active");
      $("body").addClass("overflow-hidden");
    });

    $("#popupContactForm").on("submit", function(e) {
      e.preventDefault();
      const url = $(this).attr("action");
      const method = $(this).attr("method");
      const serialized = $(this).serialize();

      $.ajax({
        url,
        type: method,
        data: serialized,
        success: function(data) {
          $(".cdk-overlay").removeClass("active");
          $("body").removeClass("overflow-hidden");
          $("#success-popup").addClass("active");
        },
        error: function(data) {
          $(".cdk-overlay").removeClass("active");
          $("body").removeClass("overflow-hidden");
          $("#error-popup").addClass("active");
        }
      });
    });
    // Simple phone input mask
    $("#popupFormPhoneInput").on("keypress paste", function(evt) {
      // ^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$
      // console.log($(this).val());
      var theEvent = evt || window.event;

      var key = null;
      // Handle paste
      if (theEvent.type === "paste") {
        key = event.clipboardData.getData("text/plain");
      } else {
        // Handle key press
        key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
      }
      var regex = /([1-9()+-])/;
      if (!regex.test(key)) {
        // console.log(1);
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
      }
    });

    // Branches table load more
    let branchStep = 1;
    const branchLimit = 9;
    const branchItems = $(".branches-table__content .row");

    if (branchItems.length > 0) {
      hideExtraBranches(branchStep, branchLimit);
      $("#loadBranchesBtn").on("click", function() {
        branchStep += 1;
        hideExtraBranches(branchStep, branchLimit);
        if (!$(".branches-table__content .row").hasClass("d-none")) {
          $(this).addClass("d-none");
        }
      });
    }

    function hideExtraBranches(step, limit) {
      branchItems.each(function(index) {
        const stepLimit = step * limit;
        if (index + 1 > stepLimit) {
          $(this).addClass("d-none");
        } else {
          $(this).removeClass("d-none");
        }
      });
    }

    // Branches search

    $("#branchesSearch").on("keyup change", function() {
      const searchValue = $(this).val()
        ? $(this)
            .val()
            .toLowerCase()
        : null;
      if (!searchValue) {
        branchStep = 1;
        hideExtraBranches(branchStep, branchLimit);
        $("#loadBranchesBtn").removeClass("d-none");
        return;
      }
      $("#loadBranchesBtn").addClass("d-none");
      branchItems.each(function() {
        let contentValue = "";
        $(this)
          .find(".branches-table__for-search")
          .each(function() {
            contentValue = $(this)
              .text()
              .trim();
          });

        // filter
        const result = contentValue.toLowerCase().indexOf(searchValue) > -1;
        if (result) {
          $(this).removeClass("d-none");
        } else {
          $(this).addClass("d-none");
        }
      });
    });

    // On resize
    resizeHander();
    window.addEventListener("resize", function(event) {
      resizeHander();
    });

    // Read more for mobile version
    $("#aboutReadMoreBtn").on("click", function() {
      $(".about-section__text").removeClass("d-none");
      $(".about-section__text-truncated").remove();
      $(this).addClass("activated");
    });

    function resizeHander() {
      // About section read more on mobile
      if ($("#aboutReadMoreBtn").hasClass("activated")) {
        return;
      }
      const windowWidth = window.innerWidth;
      if (windowWidth <= 768) {
        $("#branchesSearch").attr("placeholder", "Поиск по городу");

        if ($(".about-section__text-truncated").length === 0) {
          $(".about-section__text").addClass("d-none");
          const truncated =
            $(".about-section__text")
              .text()
              .trim()
              .slice(0, 177) + " ...";

          $(".about-section__text")
            .clone()
            .attr("class", "about-section__text-truncated")
            .html(truncated)
            .appendTo($(".about-section__text-wrapper"));
        } else {
          $(".about-section__text").addClass("d-none");
          $(".about-section__text-truncated").removeClass("d-none");
        }
      } else {
        $("#branchesSearch").attr(
          "placeholder",
          "Узнайте, есть ли наш филиал в вашем городе..."
        );
        $(".about-section__text").removeClass("d-none");
        $(".about-section__text-truncated").addClass("d-none");
      }
    }
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      if (this.getAttribute("href") === "#") {
        return;
      }
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });
})(jQuery);
