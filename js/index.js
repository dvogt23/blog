(function() {
  var Flip;

  Flip = (function() {
    function Flip(el) {
      this.el = el;
      this.el = $(this.el);
      this.currentStep = 0;
      console.log("Created new Flip");
      $('.next').on('click', $.proxy(this.next, this));
    }

    Flip.prototype.next = function(event) {
      var currentStepEl, nextStepEl, nextStepNum;
      if (event) {
        event.preventDefault();
      }
      nextStepNum = this.currentStep + 1;
      currentStepEl = this.el.find(".step" + this.currentStep);
      nextStepEl = this.el.find(".step" + nextStepNum);
      if (nextStepEl.length) {
        console.log('we found the next step', nextStepEl);
        currentStepEl.prev().removeClass('down');
        currentStepEl.removeClass('set');
        currentStepEl.addClass('down');
        nextStepEl.addClass('set');
        nextStepEl.removeClass('down');
        nextStepEl.next().removeClass('down');
        return this.currentStep++;
      } else {
        this.el.find(".step").removeClass('set');
        this.el.find(".step" + this.currentStep).addClass('down');
        this.el.find(".step").not(".step" + this.currentStep).removeClass('down');
        this.currentStep = -1;
        return this.next();
      }
    };

    return Flip;

  })();

  $(function() {
    var f;
    f = new Flip(document.getElementById('flipper'));
    return setInterval((function() {
      return f.next();
    }), 1500);
  });

}).call(this);

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-18748384-1', 'auto');
ga('send', 'pageview');
