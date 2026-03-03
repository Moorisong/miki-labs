export class Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    number: number;
    color: string;
    isGoals: boolean = false;

    constructor(x: number, y: number, radius: number, number: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.number = number;
        this.color = color;

        const baseSpeed = 3 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * baseSpeed;
        this.vy = Math.abs(Math.sin(angle) * baseSpeed) + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000';
        ctx.font = `bold ${this.radius}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(this.number.toString(), this.x, this.y);
        ctx.shadowBlur = 0;
    }
}
