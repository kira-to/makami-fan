let stars = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('hero');
    for (let i = 0; i < 500; i++) {
        stars.push(new Star());
    }
}

function draw() {
    background(17, 17, 17, 80); // slightly transparent background
    for (let star of stars) {
        star.update();
        star.show();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Star {
    constructor() {
        this.x = random(-width, width);
        this.y = random(-height, height);
        this.z = random(width);
        this.pz = this.z;
    }

    update() {
        this.z = this.z - 10;
        if (this.z < 1) {
            this.z = width;
            this.x = random(-width, width);
            this.y = random(-height, height);
            this.pz = this.z;
        }
    }

    show() {
        fill(255);
        noStroke();

        let sx = map(this.x / this.z, 0, 1, 0, width);
        let sy = map(this.y / this.z, 0, 1, 0, height);

        let r = map(this.z, 0, width, 16, 0);
        ellipse(sx, sy, r, r);

        let px = map(this.x / this.pz, 0, 1, 0, width);
        let py = map(this.y / this.pz, 0, 1, 0, height);

        this.pz = this.z;

        stroke(255);
        line(px, py, sx, sy);
    }
}