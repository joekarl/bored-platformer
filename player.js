createPlayer = function(g){
	var maxXDeform = 2,
		maxYDeform = 3;

	function leftRightState() {
		var airborn = this.state.name == "jumpState"
				|| this.state.name == "fallingState";

		var dx = airborn ? g.playerSpeed : 1;

		if (g.input.isActive(g.input.LEFT)
			&& g.input.isActive(g.input.RIGHT)) {
            this.vx = 0;
        } else if (g.input.isActive(g.input.LEFT)) {
        	this.vx -= dx;
        	if (this.vx < -g.playerSpeed) {
        		this.vx = -g.playerSpeed;
        	}
        } else if (g.input.isActive(g.input.RIGHT)) {
        	this.vx += dx;
        	if (this.vx > g.playerSpeed) {
        		this.vx = g.playerSpeed;
        	}
        } else if (!airborn) {
        	if (this.vx < 0) {
        		this.vx += g.playerFriction;
        	} else if (this.vx > 0) {
        		this.vx -= g.playerFriction;
        	}
        	if (this.vx >= -1 || this.vx <= 1) {
        		this.vx = 0;
        	}
        }
    }

	function restState() {
        leftRightState.apply(this);
		if (g.input.isActiveOnce(g.input.UP)) {
            this.state = jumpState.bind(this)();
        }
	}

	function jumpState() {
		this.vy = 60;
		var jumpStateImpl = function jumpStateImpl() {
        	leftRightState.apply(this);
			this.vy -= g.gravity;
	        if (this.vy <= 0) {
	        	this.state = fallingState;
	        }
		};
		return jumpStateImpl;
	}

	function fallingState() {
        leftRightState.apply(this);
		this.vy -= g.gravity;
		if (this.y <= 100) {
			this.y = 100;
			this.vy = 0;
			this.state = restState;
		}
	}

	function clip(value, min, max) {
		if (value < min) {
			return min;
		} else if (value > max) {
			return max;
		} else {
			return value;
		}
	}

	return {
        x: 50,
        y: 100,
        vx: 0,
        vy: 0,
        state: restState,
        update: function(t){
        	this.x = this.x + this.vx;
        	this.y = this.y + this.vy;
            this.state();
        },
        render: function(dt, ctx){
        	var xDeform = clip(this.vx, -maxXDeform, maxXDeform);
        	var yDeform = clip(this.vy, -maxYDeform, maxYDeform);

            ctx.fillStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-5, -5);
            ctx.lineTo(5, -5);
            ctx.lineTo(5 - xDeform, 5 - yDeform);
            ctx.lineTo(-5 - xDeform, 5 - yDeform);
            ctx.lineTo(-5, -5);
            ctx.fill();
        }
    };
};
