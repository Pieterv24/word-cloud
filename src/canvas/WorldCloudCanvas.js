import { html, LitElement, css } from '@lion/core';

const config = {
  trace: true,
  spiralResolution: 1, //Lower = better resolution
  spiralLimit: 360 * 5,
  lineHeight: 0.8,
  xWordPadding: 0,
  yWordPadding: 3,
  font: "sans-serif"
}

export class WordCloudCanvas extends LitElement {
  static get properties() {
    return {
      words: { type: Array }
    }
  }

  static get styles() {
    return css`
      :host {
        height: 100%;
        width: 100%;
      }

      #word-cloud{
        min-height: 400px;
        min-width: 400px;
        margin: 0 auto;
      }
    `;
  }

  constructor() {
    super();

    this.words = [];
  }

  createWordObject(word, freq, index) {
    let wordContainer = document.createElement("div");
    wordContainer.style.position = "absolute";
    wordContainer.style.fontSize = freq + "px";
    wordContainer.style.lineHeight = config.lineHeight;
    /*    wordContainer.style.transform = "translateX(-50%) translateY(-50%)";*/
    wordContainer.appendChild(document.createTextNode(word));
    wordContainer.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('removeWord', {
        bubbles: true,
        composed: true,
        detail: index
      }))
    });

    return wordContainer;
  }

  placeWord(word, x, y) {

    this.cloud.appendChild(word);
    word.style.left = x - word.offsetWidth/2 + "px";
    word.style.top = y - word.offsetHeight/2 + "px";

    this.wordsDown.push(word.getBoundingClientRect());
  }

  trace(x, y) {
  //     traceCanvasCtx.lineTo(x, y);
  //     traceCanvasCtx.stroke();
    traceCanvasCtx.fillRect(x, y, 1, 1);
  }

  spiral(i, callback) {
    this.angle = config.spiralResolution * i;
    this.x = (1 + this.angle) * Math.cos(this.angle);
    this.y = (1 + this.angle) * Math.sin(this.angle);
    return callback ? callback() : null;
  }

  intersect(word, x, y) {
    this.cloud.appendChild(word);

    word.style.left = x - word.offsetWidth/2 + "px";
    word.style.top = y - word.offsetHeight/2 + "px";

    var currentWord = word.getBoundingClientRect();

    this.cloud.removeChild(word);

    for(var i = 0; i < this.wordsDown.length; i+=1){
        var comparisonWord = this.wordsDown[i];

        if(!(currentWord.right + config.xWordPadding < comparisonWord.left - config.xWordPadding ||
             currentWord.left - config.xWordPadding > comparisonWord.right + config.wXordPadding ||
             currentWord.bottom + config.yWordPadding < comparisonWord.top - config.yWordPadding ||
             currentWord.top - config.yWordPadding > comparisonWord.bottom + config.yWordPadding)){

            return true;
        }
    }

    return false;
  }

  drawCloud() {
    const wordlist = [...this.words].map((w) => {
      return {
        word: w,
        freq: Math.floor(Math.random() * 50 + 10)
      }
    });

    for (var i = 0; i < wordlist.length; i += 1) {

      var word = this.createWordObject(wordlist[i].word, wordlist[i].freq, i);

      for (var j = 0; j < config.spiralLimit; j++) {
        //If the spiral function returns true, we've placed the word down and can break from the j loop
        if (this.spiral(j, () => {
            if (!this.intersect(word, this.startPoint.x + this.x, this.startPoint.y + this.y)) {
              this.placeWord(word, this.startPoint.x + this.x, this.startPoint.y + this.y);
              return true;
            }
        })) {
          break;
        }
      }
    }
  }

  clearCloud() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.wordsDown = [];
    if (this.cloud.children.length > 0) {
      const nodes = [...this.cloud.children];
      nodes.forEach(node => {
        if (node.nodeName !== 'CANVAS') {
          this.cloud.removeChild(node);
        }
      });
    }
  }

  setupCloud() {
    this.cloud = this.shadowRoot.getElementById('word-cloud');
    this.cloud.style.position = "relative";
    this.cloud.style.fontFamily = config.font;

    this.traceCanvas = document.createElement('canvas');
    this.traceCanvas.width = this.cloud.offsetWidth;
    this.traceCanvas.height = this.cloud.offsetHeight;
    this.traceCanvasCtx = this.traceCanvas.getContext("2d");
    this.cloud.appendChild(this.traceCanvas);

    this.startPoint = {
      x: this.cloud.offsetWidth / 2,
      y: this.cloud.offsetHeight / 2
    }

    this.wordsDown = [];
  }

  firstUpdated() {
    this.setupCloud();
  }

  updated() {
    super.update();
    this.clearCloud();
    this.drawCloud();
  }

  render() {
    return html`
      <div id='word-cloud'></div>
    `;
  }
}
