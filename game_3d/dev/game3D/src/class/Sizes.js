
export class GameSizes {
    width = window.innerWidth;
    height = window.innerHeight;

    constructor(remote) {
        if (remote) {
            this.width = 1920;
            this.height = 1080;
        }
    }
}