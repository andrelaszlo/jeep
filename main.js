function log(txt) {
  var out = $("#out");
  var prev = out.html();
  if (prev) {
    prev += "<br>";
  }
  out.html(prev + txt)
  out.scrollTop(out.prop("scrollHeight"));
}

function logClear() {
  var out = $("#out");
  out.html('');
}

function supportsHTML5Storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function Jeep(game) {
  var self = this;
  var gasoline = 2000;
  var gasoline_per_km = 4;
  this.game = game;
  position = 0;

  this.getGasoline = function() {
    return gasoline;
  }

  this.getPosition = function() {
    return position;
  }

  function move(step) {
    position += step;
    if (position >= 10000) {
      log("*** YOU WIN ***");
      return;
    }
    gasoline -= gasoline_per_km;
    if (position <= 0) {
      position = 0;
      gasoline = 2000;
    }
    if (gasoline <= 0) {
      log("*** You ran out of gasoline at " + position + " ***");
    }
  }

  this.performAction = function performaction(action) {
    if (action == self.forward) {
      //log("Going forward");
      move(1);
    } else if (action == self.backward) {
      //log("Going backwards");
      move(-1);
    } else if (action.put) {
      var amount = action.put;
      if (amount < 0) {
        log("Sneaky!");
        return;
      }
      gasoline -= amount;
      //log("Storing " + amount + " gasoline at " + self.getPosition());
    } else if (action.get) {
      var amount = action.get;
      var all = '';
      if (typeof(amount) == 'undefined') {
        amount = self.game.stored
        all = ' (all)'
      }
      //log("Loading " + amount + " liters" + all + "of gasoline from " + self.getPosition());
    } else {
      console.log("Unknown action " + action);
    }
  }

  /* Actions */
  this.forward = 'forward'
  this.backward = 'backward'
  this.put = function put(amount) { return { put: amount } };
  this.get = function get(amount) { return { get: amount } };
}

function Game(code) {
  var self = this;
  this.jeep = new Jeep(self);
  this.id = "the game";
  this.stored = {}
  this.stepTimeout = null;

  var jeep = this.jeep;
  var game = this;
  // "Yes, eval() is used here, leaving you at mortal risk of XSS-attacking
  // yourself." -- qntm (http://qntm.org/gods)
  eval(code)
  // TODO: check that act is defined
  self.act = act

  this.stop = function stop() {
    log("*** Stopping simulation ***");
    clearTimeout(self.stepTimeout);
  }
  this.step = function step() {
    jeep.performAction(self.act());
    self.printState();
  }
  this.run = function run(code) {
    self.step();
    self.stepTimeout = setTimeout(self.run, 50);
  }

  this.getStored = function getStored(position) {
    return this.stored[position] || 0;
  }

  this.printState = function printState() {
    var output = "";
    output += "Jeep at " + self.jeep.getPosition();
    output += ", " + self.jeep.getGasoline()/10 + " liters of gasoline left";
    log(output);
  }
}

$(function main() {
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/solarized_dark");
  editor.getSession().setMode("ace/mode/javascript");
  editor.setValue(localStorage['code']);
  editor.on('change', function editorChange() {
    localStorage['code'] = editor.getValue();
  });
  editor.focus();

  var game = null;

  $("#run").click(function run_click() {
    if (!game) {
      game = new Game(editor.getValue());
    }
    game.run();
  })

  $("#step").click(function step() {
    if (!game) {
      game = new Game(editor.getValue());
    }
    game.step();
  })

  $("#stop").click(function stop_click() {
    game && game.stop();
  })

  $("#reload").click(function reload_click() {
    logClear();
    game = new Game(editor.getValue());
  })
})
