// https://d33kshant.github.io/blog/implementing-q-learning-from-scratch/
class Game {
  dealer = [];
  player = [];

  end_rest = undefined;

  init() {
    this.end_rest = undefined;

    this.player = [];
    this.dealer = [];
    this.draw(this.player);
    this.draw(this.player);

    this.draw(this.dealer);
    this.draw(this.dealer);
  }

  getState() {
    return {
      player: this.returnSum(this.player),
      dealer: this.returnSum(this.dealer),
    };
  }
  draw(arr) {
    let val = Math.round(Math.random() * 9) + 1;
    if (val === 1) {
      val = "ace";
    }
    arr.push(val);
  }
  returnSum(arr) {
    let sum = 0;
    let ace = 0;

    for (const card of arr) {
      if (card === "ace") {
        ace++;
      } else {
        sum += Number(card);
      }
    }

    sum += ace * 11;

    while (sum > 21 && ace > 0) {
      sum -= 10;
      ace--;
    }

    return {
      sum,
      ace,
    };
  }
  Termination = () => {
    while (this.returnSum(this.dealer).sum < 17) {
      this.draw(this.dealer);
    }
    this.result();
  };
  hit = () => {
    this.draw(this.player);
    if (this.returnSum(this.player).sum > 21) {
      this.end_rest = -1;
    }
  };
  stick = () => {
    this.Termination();
  };
  result() {
    let player = this.returnSum(this.player).sum;
    let dealer = this.returnSum(this.dealer).sum;
    if (player > 21) {
      this.end_rest = -1;
      return -1;
    }
    if (dealer > 21) {
      this.end_rest = 1;
      return 1;
    }
    if (player > dealer) {
      this.end_rest = 1;
      return 1;
    }

    if (player === dealer) {
      this.end_rest = 0;
      return 0;
    }

    this.end_rest = -1;
    return -1;
  }
}

const g = new Game();

const ALPHA = 0.1; // aka learning rate
const GAMMA = 0.9; // aka how improtant current progress
//
// smaller alpha -> exploration
// bigger aplha -> explotation
//
// small gamma -> slower acceptation of expirience
// bigger gamma -> faster acceptation of expirience

class Client {
  qTable = new Map();

  actions = [g.hit, g.stick];
  epsilon = 1;

  get_q = (key) => {
    if (!this.qTable.has(key)) {
      this.qTable.set(key, new Array(this.actions.length).fill(0));
    }
    return this.qTable.get(key);
  };

  get_action(state) {
    let state_key = JSON.stringify(state);
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actions.length);
    } else {
      let ans = {
        val: -10,
        ind: 0,
      };
      for (let i = 0; i < this.actions.length; i++) {
        if (this.get_q(state_key)[i] > ans.val) {
          ans.val = this.get_q(state_key)[i];
          ans.ind = i;
        }
      }
      return ans.ind;
    }
  }
  learn(state, action, reward, next_state) {
    let state_key = JSON.stringify(state);
    let next_state_key = JSON.stringify(next_state);

    let predict = this.get_q(state_key)[action];
    let target = reward + GAMMA * Math.max(...this.get_q(next_state_key)); // worst case scenario max has value 0
    this.qTable.get(state_key)[action] += ALPHA * (target - predict); // as far as i understand this thing balances exploration and explotation values
  }
}

const agent = new Client();

const EPISODES = 200000;
const EPSILON_DECAY = 0.995;
const MIN_EPSILON = 0.01;

let wins = 0;
let ties = 0;
let loses = 0;
const win_array = [];
const win_losses_array = [];

for (let i = 0; i < EPISODES; i++) {
  g.init();
  let state = g.getState();
  let total_reward = 0;
  while (g.end_rest === undefined) {
    let action = agent.get_action(state);
    agent.actions[action]();
    let next_state = g.getState();
    let reward = 0;
    if (g.end_rest !== undefined) {
      reward += g.end_rest;
    }
    agent.learn(state, action, reward, next_state);
    state = next_state;
    total_reward += reward;
  }
  if (g.end_rest == 1) {
    wins++;
  } else if (g.end_rest == 0) {
    ties++;
  } else {
    loses++;
  }
  if ((i + 1) % 100 === 0) {
    win_array.push(wins / i);
    win_losses_array.push(wins / loses);
  }
  agent.epsilon = Math.max(MIN_EPSILON, agent.epsilon * EPSILON_DECAY); // less random
}

console.log("Total wins: ", wins);
console.log("Total loses: ", loses);
console.log("Total ties: ", ties);
console.log("win rate:", (wins / EPISODES) * 100, "%");
console.log("'good' rate:", ((wins + ties) / EPISODES) * 100, "%");
wins = 0;
ties = 0;
loses = 0;

const rwin_array = [];
const rwin_losses_array = [];
for (let i = 0; i < EPISODES; i++) {
  g.init();
  while (g.end_rest === undefined) {
    if (Math.random() > 0.5) {
      g.hit();
    } else {
      g.stick();
    }
  }
  if (g.end_rest == 1) {
    wins++;
  } else if (g.end_rest == 0) {
    ties++;
  } else {
    loses++;
  }
  if ((i + 1) % 100 === 0) {
    rwin_array.push(wins / i);
    rwin_losses_array.push(wins / loses);
  }
}

console.log("Total wins: ", wins);
console.log("Total loses: ", loses);
console.log("Total ties: ", ties);
console.log("Random win rate:", (wins / EPISODES) * 100, "%");
console.log("Random 'good' rate:", ((wins + ties) / EPISODES) * 100, "%");

const ctx = document.getElementById("QwinRate");
const labels = win_array.map((_, i) => ((i + 1) * 100).toString());
new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Win/episodes",
        data: win_array,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0,
      },
      {
        label: "Win/Losses",
        data: win_losses_array,
        fill: false,
        borderColor: "rgb(54, 162, 235)",
        tension: 0,
      },
    ],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: "Q-learning approach",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Rate from 0 to 1",
        },
        min: 0,
        max: 1,
        ticks: {
          // forces step size to be 50 units
          stepSize: 50,
        },
      },
    },
  },
});

const rctx = document.getElementById("RwinRate");
const rlabels = win_array.map((_, i) => ((i + 1) * 100).toString());
new Chart(rctx, {
  type: "line",
  data: {
    labels: rlabels,
    datasets: [
      {
        label: "Win/episodes",
        data: rwin_array,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0,
      },
      {
        label: "Win/Losses",
        data: rwin_losses_array,
        fill: false,
        borderColor: "rgb(54, 162, 235)",
        tension: 0,
      },
    ],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: "Random step approach",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Rate from 0 to 1",
        },
        min: 0,
        max: 1,
        ticks: {
          // forces step size to be 50 units
          stepSize: 50,
        },
      },
    },
  },
});
