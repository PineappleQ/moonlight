(function () {

	var text = ['一起去看电影吗', '❀'];
	var textPoints = [];
	var distance = 8;
	var timer;
	var pointMoving = false;
	/**
	 * 获取文字粒子的圆心坐标
	 * @param {*} apple 
	 */
	function getTextCoords(apple) {
		var imageData, pixel, height, width;
		imageData = apple.getImageData(0, 0, apple.width, apple.height);
		for (height = 0; height < apple.height; height += distance) {
			for (width = 0; width < apple.width; width += distance) {
				pixel = imageData.data[((width + (height * apple.width)) * 4) - 1];
				if (pixel == 255) {
					var particle = new Particle(width, height, random(3, 6));
					particle.color = random(colors);
					textPoints.push(particle);
				}
			}
		}
	}

	function Particle(x, y, radius) {
		this.init(x, y, radius);
	}

	Particle.prototype = {

		init: function (x, y, radius) {

			this.alive = true;

			this.radius = radius || 10;
			this.wander = 0.15;
			this.theta = random(TWO_PI);
			this.drag = 0.92;
			this.color = '#fff';

			this.x = x || 0.0;
			this.y = y || 0.0;

			this.originX = x || 0.0;
			this.originY = y || 0.0;

			this.vx = 0.0;
			this.vy = 0.0;
			var dirX = 0;
			if (random(-1, 1) > 0) {
				dirX = 1
			} else {
				dirX = -1
			}
			var dirY = 0;
			if (random(-1, 1) > 0) {
				dirY = 1
			} else {
				dirY = -1
			}
			this.speedX = random(3, 5) * dirX;
			this.gravity = random(0.1, 2) * dirY
		},

		move: function () {

			this.x += this.vx;
			this.y += this.vy;

			this.vx *= this.drag;
			this.vy *= this.drag;

			this.theta += random(-0.5, 0.5) * this.wander;
			this.vx += sin(this.theta) * 0.1;
			this.vy += cos(this.theta) * 0.1;

			this.radius *= 0.96;
			this.alive = this.radius > 0.5;
		},
		textPointMove: function () {
			this.x += this.speedX;
			this.y += this.gravity;

			if (this.x < 0 || this.x > Apple.width) {
				this.alive = false;
			}
			if (this.y >= Apple.height || this.y <= 0) {
				this.alive = false;
			}
		},
		draw: function (ctx) {

			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
			ctx.fillStyle = this.color;
			ctx.fill();
		}
	};

	var MAX_PARTICLES = 280;
	var colors = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423'];

	var particles = [];
	var pool = [];

	var Apple = Sketch.create({
		container: document.getElementById('container'),
		retina: 'auto',
		fullscreen: false,
		width: 1280,
		height: 768
	});
	/**
	 * 初始化设置
	 */
	Apple.setup = function () {
		var i, x, y;
		createTextPoints(Apple, text[0]);
		for (i = 0; i < 20; i++) {
			x = (Apple.width * 0.5) + random(-100, 100);
			y = (Apple.height * 0.5) + random(-100, 100);
			Apple.spawn(x, y);
		}
	};
	/**
	 * 生产粒子
	 */
	Apple.spawn = function (x, y) {

		var particle, theta, force;

		if (particles.length >= MAX_PARTICLES) {
			pool.push(particles.shift());
		}

		particle = pool.length ? pool.pop() : new Particle();
		particle.init(x, y, random(5, 40));

		particle.wander = random(0.5, 2.0);
		particle.color = random(colors);
		particle.drag = random(0.9, 0.99);

		theta = random(TWO_PI);
		force = random(2, 8);

		particle.vx = sin(theta) * force;
		particle.vy = cos(theta) * force;

		particles.push(particle);
	};
	/**
	 * 更新粒子信息
	 */
	Apple.update = function () {

		var i, j, particle, textPoint;

		for (i = particles.length - 1; i >= 0; i--) {

			particle = particles[i];

			if (particle.alive) {
				particle.move()
			}
			else {
				pool.push(particles.splice(i, 1)[0])
			}
		}
	};
	/**
	 * 绘制canvas图像
	 */
	Apple.draw = function () {

		Apple.globalCompositeOperation = 'lighter';

		for (var i = particles.length - 1; i >= 0; i--) {
			particles[i].draw(Apple);
		}
		for (var j = textPoints.length - 1; j >= 0; j--) {
			textPoints[j].draw(Apple);
		}
	};
	/**
	 * 鼠标move时绘制动态粒子
	 */
	Apple.mousemove = function () {

		var particle, theta, force, touch, max, i, j, n;

		for (i = 0, n = Apple.touches.length; i < n; i++) {

			touch = Apple.touches[i], max = random(1, 4);
			for (j = 0; j < max; j++) {
				Apple.spawn(touch.x, touch.y);
			}
		}
	};

	Apple.click = function () {
		if (pointMoving) {
			return;
		}
		pointMoving = true;
		timer = setInterval(startFall, 10);
	}

	Apple.keyup = function (event) {
		if(pointMoving){
			return
		}
		if (event.keyCode == 13) {
			var text = document.getElementById("input").value;
			if (!text) {
				return;
			}
			createTextPoints(Apple, text)
		}
	}

	function startFall() {
		for (var i = 0; i < textPoints.length; i++) {
			if (textPoints[i].alive) {
				textPoints[i].textPointMove();
			} else {
				textPoints.splice(i, 1);
				i--;
			}
		}
		if (textPoints.length <= 0) {
			clearInterval(timer)
			pointMoving = false;
		}
	}

	/**
	 * 获取文字对应的粒子
	 * @param {*} Apple 
	 * @param {*} text 
	 */
	function createTextPoints(Apple, text) {
		textPoints = [];
		Apple.clear();
		Apple.fillStyle = "#000000";
		Apple.textAlign = "center";
		Apple.font = '180px cursive';
		Apple.fillText(text, Apple.width / 2, Apple.height / 2);
		getTextCoords(Apple);
	}
})()