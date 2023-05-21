export class Post {
    pub: string; 
    alias: string;
    timestamp: number;
    text: string;
    score: number = 0;

    constructor(pub: string, alias: string, timestamp: number, text: string) {
        this.pub = pub;
        this.alias = alias;
        this.timestamp = timestamp;
        this.text = text;
    }
}