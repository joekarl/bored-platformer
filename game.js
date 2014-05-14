GAME = (function(){

    var g = {
        input: undefined,
        width: 800,
        height: 600,
        ups: 30,
        gravity: 10,
        playerSpeed: 10,
        playerFriction: 2,
        gameObjects: []
    };

    function initInput() {
        g.input = {
            _pressed: {},

            UP: 38,
            LEFT: 37,
            RIGHT: 39,
            DOWN: 40,
            SPACE: 32,

            update: function() {
                Object.keys(this._pressed).forEach(function(keyCode){
                    if (this._pressed[keyCode] == 2) {
                        this._pressed[keyCode] = 3;
                    }
                }.bind(this));
            },

            isActive: function(code) {
                return this._pressed[code] > 0;
            },

            isActiveOnce: function(code) {
                var pressedState = this._pressed[code];
                switch(pressedState) {
                case 0:
                    return false;
                case 1:
                case 2:
                    this._pressed[code] = 2;
                    return true;
                case 3:
                    return false;
                default:
                    this._pressed[code] = 0;
                    return false;
                }
            },

            onKeydown: function(e) {
                var pressedState = this._pressed[e.keyCode];
                switch(pressedState) {
                case 0:
                case 1:
                    this._pressed[e.keyCode] = 1;
                    break;
                case 2:
                case 3:
                    this._pressed[e.keyCode] = 3;
                    break;
                default:
                    this._pressed[e.keyCode] = 1;
                }
            },

            onKeyup: function(e) {
                this._pressed[e.keyCode] = 0;
            }
        };

        window.addEventListener('keyup', function(event) { g.input.onKeyup(event); }, false);
        window.addEventListener('keydown', function(event) { g.input.onKeydown(event); }, false);
    }

    function startGame() {
        var player = createPlayer(g);
        g.gameObjects.push(player);
    }

    function update(t){
        g.input.update();
        var gameObjects = g.gameObjects;
        gameObjects.forEach(function updateObj(obj){
            obj.update(t);
        });
        var numberOfObjects = gameObjects.length;
        for(var i = 0; i < numberOfObjects; ++i) {
            if (gameObjects[i].dead) {
                gameObjects.splice(i, 1);
                numberOfObjects--;
            }
        }
    }

    function render(dt, ctx){
        clearScreen(ctx);
        g.gameObjects.forEach(function renderObj(obj){
            ctx.save();
            ctx.translate(obj.x + dt * (obj.vx || 0), -obj.y - dt * (obj.vy || 0) + g.height);
            //ctx.translate(obj.x, g.height - obj.y);
            ctx.scale((obj.sx || 1), (obj.sy || 1)); //flip axis
            ctx.rotate(obj.angle || 0);
            obj.render(dt, ctx);
            ctx.restore();
        });
    }

    function clearScreen(ctx) {
        ctx.translate(0,0);
        ctx.scale(1,1);
        ctx.rotate(0);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.clearRect (0, 0, g.width, g.height);
        ctx.fillStyle = undefined;
        ctx.strokeStyle = undefined;
    }

    function startMainLoop(ctx, fpsStats) {
        var loops = 0,
            skipTicks = 1000 / g.ups,
            maxFrameSkip = 10,
            nextGameTick = new Date().getTime();

        var _loop = function() {
            fpsStats.begin();
            loops = 0;
            var currentTime = new Date().getTime();

            while (currentTime > nextGameTick && loops < maxFrameSkip) {
                update(skipTicks);
                nextGameTick += skipTicks;
                if (nextGameTick < currentTime) {
                    nextGameTick = currentTime + skipTicks;
                }
                loops++;
            }

            var interpolation = (nextGameTick - currentTime) / skipTicks;
            interpolation = interpolation > 1 ? 1 : interpolation;
            interpolation = interpolation < 0 ? 0 : interpolation;
            render(1 - interpolation, ctx);
            fpsStats.end();
            window.requestAnimationFrame(_loop);
        };
        _loop();
    }

    return {
        init: function init(stats){
            var container = document.getElementById("container");
            var canvas = document.getElementById("game");
            var ctx = canvas.getContext('2d');

            var fpsStats = new Stats();
            fpsStats.setMode(0);

            if (stats) {
                container.appendChild(fpsStats.domElement);
            }

            initInput();
            startMainLoop(ctx, fpsStats);
            startGame();
        }
    };
}());
