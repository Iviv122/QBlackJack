class Game {
  result = undefined;

  dealer = [];
  player = [];

  Start() {}

  Action(val) {
    if (val == 1) {
      hit();
    } else {
      stick();
    }
  }
  draw(arr) {
    // append card
  }
  returnSum(arr) {
    return arr.reduce((acc, val) =>
      acc + val
    , 0);
  }
  Termination() {
    while (this.returnSum(this.dealer) <=17) {
      draw(this.dealer);
    }
    if)
  }
  Reset() {
    this.result = undefined;
  }
}
