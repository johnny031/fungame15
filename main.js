let select = false;
let round = 1; // 1=black 0=white
let interval_timer_bar_b;
let interval_timer_bar_w;
let timer_b = 4;
let timer_w = 4;
let fram_per_sec = 10;
let timer_on = false;
let if_setting_changed = false;
let manVSMachine = -1; // -1: 雙人對戰, 0: machine執白子, 1: machine執黑子
let move_record = [];
let unused_pieces_record = [
  [
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  ],
  [
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  ],
];
let pieces_location_record = [
  [[], [], [], []],
  [[], [], [], []],
  [[], [], [], []],
  [[], [], [], []],
];

function startTimerBar_w() {
  let seconds;
  interval_timer_bar_w = setInterval(frame, 1000 / fram_per_sec);

  function frame() {
    seconds = parseInt(Math.ceil(timer_w + 1) % 60, 10);
    $("#second_w").text(seconds);

    if (timer_w + 1 <= 0) {
      clearInterval(interval_timer_bar_w);
      if (timer_on) {
        change_round();
        if (manVSMachine === round) {
          machine_move_piece();
        }
      }
    } else {
      timer_w -= 1 / fram_per_sec;
      timer_w = Math.round(timer_w * 10) / 10;
      if (timer_w < 2 && timer_on) {
        $("#second_w").addClass("shake");
      }

      $(".timer-bar.white").attr(
        "style",
        `--bar-width: ${(100 * (timer_w + 1)) / 40}%`
      );
    }
  }
}

function startTimerBar_b() {
  let seconds;
  interval_timer_bar_b = setInterval(frame, 1000 / fram_per_sec);

  function frame() {
    seconds = parseInt(Math.ceil(timer_b + 1) % 60, 10);
    $("#second_b").text(seconds);

    if (timer_b + 1 <= 0) {
      clearInterval(interval_timer_bar_b);
      if (timer_on) {
        change_round();
        if (manVSMachine === round) {
          machine_move_piece();
        }
      }
    } else {
      timer_b -= 1 / fram_per_sec;
      timer_b = Math.round(timer_b * 10) / 10;
      if (timer_b < 2 && timer_on) {
        $("#second_b").addClass("shake");
      }
      $(".timer-bar.black").attr(
        "style",
        `--bar-width: ${(100 * (timer_b + 1)) / 40}%`
      );
    }
  }
}

function change_round(retract = false) {
  select = false;
  $(".selected").removeClass("selected");
  $(".timer-bar").addClass("transition-smooth");
  round = 1 - round;
  if (!retract) {
    round === 1 ? (timer_w += 10) : (timer_b += 10);
  }
  round === 1 ? startTimerBar_b() : startTimerBar_w();
  round === 1
    ? clearInterval(interval_timer_bar_w)
    : clearInterval(interval_timer_bar_b);

  if (timer_b >= 39) timer_b = 39;
  if (timer_w >= 39) timer_w = 39;

  $("#second_w, #second_b").removeClass("shake");

  $("#second_b").text(Math.round(timer_b) + 1);
  $("#second_w").text(Math.round(timer_w) + 1);

  $(".timer-bar.black").attr(
    "style",
    `--bar-width: ${(100 * (Math.round(timer_b) + 1)) / 40}%`
  );
  $(".timer-bar.white").attr(
    "style",
    `--bar-width: ${(100 * (Math.round(timer_w) + 1)) / 40}%`
  );

  setTimeout(() => {
    $(".timer-bar").removeClass("transition-smooth");
  }, 500);
}

function update_board_record(
  origin_position,
  destination_position,
  retract = false
) {
  let origin_x = parseInt(origin_position.slice(0, 1));
  let origin_y = parseInt(origin_position.slice(1, 2));

  let dest_x = parseInt(destination_position.slice(0, 1));
  let dest_y = parseInt(destination_position.slice(1, 2));
  let the_moving_piece;
  if (retract) {
    // 悔一手
    the_moving_piece = pieces_location_record[dest_x][dest_y].pop();

    if (origin_x > 3) {
      unused_pieces_record[origin_x - 4][origin_y].push(the_moving_piece);
    } else {
      pieces_location_record[origin_x][origin_y].push(the_moving_piece);
    }
  } else {
    if (origin_x > 3) {
      the_moving_piece = unused_pieces_record[origin_x - 4][origin_y].pop();
    } else {
      the_moving_piece = pieces_location_record[origin_x][origin_y].pop();
    }
    pieces_location_record[dest_x][dest_y].push(the_moving_piece);
  }
}

function check_if_win() {
  let cancel = false;

  setTimeout(() => {
    let if_4_black_pieces_in_line =
      jQuery.inArray(1, if_N_pieces_in_line(4)) !== -1;
    let if_4_white_pieces_in_line =
      jQuery.inArray(0, if_N_pieces_in_line(4)) !== -1;

    // 若發現有四子連線
    if (if_N_pieces_in_line(4).length !== 0) {
      clearInterval(interval_timer_bar_b);
      clearInterval(interval_timer_bar_w);
      //若黑白雙方均有四子連線，拿起棋子時對方已勝利
      if (if_4_black_pieces_in_line && if_4_white_pieces_in_line) {
        round === 1
          ? alert("黑方獲勝!\n(拿起棋子時對方已經獲勝)")
          : alert("白方獲勝!\n(拿起棋子時對方已經獲勝)");
        if (confirm("是否重置盤面?")) {
          render_board();
        } else {
          cancel = true;
        }
      }
      if_4_black_pieces_in_line && alert("黑方獲勝!");
      if_4_white_pieces_in_line && alert("白方獲勝!");

      if (confirm("是否重置盤面?")) {
        render_board();
      } else {
        cancel = true;
      }
    }
    if (cancel) return false;

    if (manVSMachine === round) {
      machine_move_piece();
    }
  }, 200);
}

function move_piece(destination_cell) {
  let origin_position = $(".selected").parent().attr("data-position");
  let destination_position = destination_cell.attr("data-position");

  update_board_record(origin_position, destination_position);

  // update move record
  move_record.push([origin_position, destination_position]);

  $(".selected").detach().appendTo(destination_cell);
  $(".selected").attr("data-used", "1");
  $(".retract-btn, .restart-btn").removeClass("disabled");
  change_round();
  check_if_win();
}

function render_board() {
  clearInterval(interval_timer_bar_b);
  clearInterval(interval_timer_bar_w);
  round = 1;
  timer_b = 4;
  timer_w = 4;
  move_record = [];
  unused_pieces_record = [
    [
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
    ],
    [
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
    ],
  ];
  pieces_location_record = [
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
  ];

  $(".container").empty();
  $(".container").append(`
    <span class="setting-section">
      <a class="btn retract-btn disabled"><i class="fas fa-undo-alt"></i>悔棋</a> 
      <a class="btn restart-btn disabled"><i class="fas fa-sync-alt"></i>重置</a>
      <a class="btn setting-btn"><i class="fas fa-cog"></i>設定</a>
    </span>
    <div class="timer_section">
      <div class="timer-bar-wrapper">
        <div class="timer-bar black"></div>
      </div>
      <span class="timer-number" id="second_b">5</span>
    </div>
    <div class="piece-section">
      <div class="piece-stack" data-position="50">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack" data-position="51">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack" data-position="52">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
      </div>
    </div>
    <div class="board">
      <div class="cell" data-position="00"></div>
      <div class="cell" data-position="01"></div>
      <div class="cell" data-position="02"></div>
      <div class="cell" data-position="03"></div>
      <div class="cell" data-position="10"></div>
      <div class="cell" data-position="11"></div>
      <div class="cell" data-position="12"></div>
      <div class="cell" data-position="13"></div>
      <div class="cell" data-position="20"></div>
      <div class="cell" data-position="21"></div>
      <div class="cell" data-position="22"></div>
      <div class="cell" data-position="23"></div>
      <div class="cell" data-position="30"></div>
      <div class="cell" data-position="31"></div>
      <div class="cell" data-position="32"></div>
      <div class="cell" data-position="33"></div>
    </div>   
    <div class="piece-section">
      <div class="piece-stack" data-position="40">
        <div class="piece" data-used="0" data-color="0" data-size="1"></div>
        <div class="piece" data-used="0" data-color="0" data-size="2"></div>
        <div class="piece" data-used="0" data-color="0" data-size="3"></div>
        <div class="piece" data-used="0" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack" data-position="41">
        <div class="piece" data-used="0" data-color="0" data-size="1"></div>
        <div class="piece" data-used="0" data-color="0" data-size="2"></div>
        <div class="piece" data-used="0" data-color="0" data-size="3"></div>
        <div class="piece" data-used="0" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack" data-position="42">
        <div class="piece" data-used="0" data-color="0" data-size="1"></div>
        <div class="piece" data-used="0" data-color="0" data-size="2"></div>
        <div class="piece" data-used="0" data-color="0" data-size="3"></div>
        <div class="piece" data-used="0" data-color="0" data-size="4"></div>
      </div>
    </div>
    <div class="timer_section">
      <div class="timer-bar-wrapper">
        <div class="timer-bar white"></div>
      </div>
      <span class="timer-number" id="second_w">5</span>
    </div>
    <span class="setting-section">
      <a class="btn retract-btn disabled"><i class="fas fa-undo-alt"></i>悔棋</a>
      <a class="btn restart-btn disabled"><i class="fas fa-sync-alt"></i>重置</a>
      <a class="btn setting-btn"><i class="fas fa-cog"></i>設定</a>
    </span>
    `);

  if (manVSMachine === -1) {
    // 雙人對戰
    $(".container").attr("style", "--board-rotate: 0deg");
  }

  if (manVSMachine === 1) {
    // 選擇白色
    $(".container").attr("style", "--board-rotate: 0deg");
    $(
      ".setting-section:first-of-type .retract-btn, .setting-section:first-of-type .restart-btn"
    ).hide();
  }

  if (manVSMachine === 0) {
    // 選擇黑色
    $(".container").attr("style", "--board-rotate: 180deg");
    $(".setting-section:first-of-type .setting-btn").attr(
      "style",
      "display: inline;"
    );
    $(
      ".setting-section:last-of-type .setting-btn, .setting-section:last-of-type .retract-btn, .setting-section:last-of-type .restart-btn"
    ).hide();
  }
}

function if_N_pieces_in_line(number) {
  let pieces_location = [];
  let count_white = 0;
  let count_black = 0;
  let which_color_has_N_pieces_in_line = [];

  $(".cell").each(function (index) {
    if (index % 4 === 0) {
      pieces_location.push([]);
    }
    pieces_location[Math.floor(index / 4)].push(
      $(this).children(".piece").last().attr("data-color")
    );
  });

  for (let i = 0; i < 4; i++) {
    loop1: for (let j = 0; j < 4; j++) {
      if (pieces_location[i][j] === "0") {
        count_white++;
      }
      if (pieces_location[i][j] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_black * count_white === 3) {
          let color = 0;
          if (count_black === 1) color = 1;

          for (let k = 1; k <= 4; k++) {
            let size = $(`.cell:nth-of-type(${i * 4 + k})`)
              .children(`[data-color=${color}]`)
              .last()
              .attr("data-size");

            if (size == 4) {
              break loop1;
            }
          }
        }
        if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
        if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
      }
    }
    count_white = 0;
    count_black = 0;
  }

  for (let i = 0; i < 4; i++) {
    loop1: for (let j = 0; j < 4; j++) {
      if (pieces_location[j][i] === "0") {
        count_white++;
      }
      if (pieces_location[j][i] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_black * count_white === 3) {
          let color = 0;
          if (count_black === 1) color = 1;

          for (let k = 0; k <= 3; k++) {
            let size = $(`.cell:nth-of-type(${k * 4 + i + 1})`)
              .children(`[data-color=${color}]`)
              .last()
              .attr("data-size");

            if (size == 4) {
              break loop1;
            }
          }
        }

        if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
        if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
      }
    }
    count_white = 0;
    count_black = 0;
  }

  loop1: for (let i = 0; i < 4; i++) {
    if (pieces_location[i][i] === "0") {
      count_white++;
    }
    if (pieces_location[i][i] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_black * count_white === 3) {
        let color = 0;
        if (count_black === 1) color = 1;

        for (let k = 1; k <= 16; k += 5) {
          let size = $(`.cell:nth-of-type(${k})`) // 1,6,11,16
            .children(`[data-color=${color}]`)
            .last()
            .attr("data-size");

          if (size == 4) {
            break loop1;
          }
        }
      }

      if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
      if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
    }
  }
  count_white = 0;
  count_black = 0;

  loop1: for (let i = 0, j = 3; i < 4, j >= 0; i++, j--) {
    if (pieces_location[i][j] === "0") {
      count_white++;
    }
    if (pieces_location[i][j] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_black * count_white === 3) {
        let color = 0;
        if (count_black === 1) color = 1;

        for (let k = 4; k <= 13; k += 3) {
          let size = $(`.cell:nth-of-type(${k})`) // 4,7,10,13
            .children(`[data-color=${color}]`)
            .last()
            .attr("data-size");

          if (size == 4) {
            break loop1;
          }
        }
      }

      if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
      if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
    }
  }

  return which_color_has_N_pieces_in_line;
}

render_board();

$(document).on("click", ".piece", function (event) {
  event.stopPropagation();

  // 若選擇已選取的棋子，則取消選取之
  if ($(this).hasClass("selected")) {
    $(this).removeClass("selected");
    select = false;
    return false;
  }

  // 若(目前有已選擇的棋子) and
  // (點選的棋子為己方的棋子) and
  // (點選的棋子並非已選擇的棋子) and
  // (點選的棋子在場外 or 點選棋子的大小>=已選擇棋子的大小)
  if (
    select &&
    parseInt($(this).attr("data-color")) === round &&
    !$(this).hasClass("selected") &&
    ($(this).attr("data-used") === "0" ||
      parseInt($(this).attr("data-size")) >=
        parseInt($(".selected").attr("data-size")))
  ) {
    $(".selected").removeClass("selected");
    $(this).addClass("selected");
    return false;
  }

  // 若目前有已選擇的棋子，且點選的棋子在場內
  if (select && $(this).attr("data-used") === "1") {
    if (
      parseInt($(".selected").attr("data-size")) <=
        parseInt($(this).attr("data-size")) ||
      (parseInt($(this).attr("data-color")) === 1 - round &&
        $(".selected").attr("data-used") === "0" &&
        jQuery.inArray(1 - round, if_N_pieces_in_line(3)) === -1)
    ) {
      // 如果行動棋子比目標棋子小，或(從場外拿棋子欲蓋住對方棋子時，對方尚未3子連線)
      return false;
    }
    move_piece($(this).parent(".cell"));
    return false;
  }

  // 在沒有已選取棋子的情況下選擇對方棋子，或選擇對方在場外的棋子
  // 選擇對方棋子 and (選擇的棋子在場外 or 目前沒有已選取棋子)
  if (
    $(this).attr("data-color") != round &&
    ($(this).attr("data-used") === "0" || !select)
  ) {
    return false;
  }

  // 如果現在為單機模式，且沒有已選取的棋子，且選擇的棋子為machine方的，則return false
  if (
    manVSMachine > -1 &&
    !select &&
    $(this).attr("data-color") == manVSMachine
  ) {
    return false;
  }

  // 如果現在沒有已選取的棋子，且選擇的棋子為己方的，則選取之
  if (!select && $(this).attr("data-color") == round) {
    $(this).addClass("selected");
    select = true;
  }
});

$(document).on("click", ".cell", function (event) {
  event.stopPropagation();

  // 如果目前沒有已選取的棋子，或該cell內已有棋子
  if (!select || $(this).children().length > 0) {
    return false;
  }
  move_piece($(this));
});

function retract_move(number) {
  for (let i = 0; i < number; i++) {
    update_board_record(
      move_record[move_record.length - 1][0],
      move_record[move_record.length - 1][1],
      true
    );

    // move piece
    let origin = $(`[data-position=${move_record[move_record.length - 1][0]}]`);
    let destination = $(
      `[data-position=${move_record[move_record.length - 1][1]}]`
    )
      .children(".piece")
      .last();

    destination.detach().appendTo(origin);

    move_record.pop();

    if (origin.attr("class") === "piece-stack") {
      origin.children(".piece").last().attr("data-used", "0");
    }
    change_round(true);
  }
}

$(document).on("click", ".retract-btn", function () {
  if (
    move_record.length === 0 ||
    (move_record.length < 2 && manVSMachine > -1)
  ) {
    return false;
  }

  if (!confirm("確定要悔一手嗎？")) return false;

  if (manVSMachine === 1 && move_record.length % 2 === 1) {
    retract_move(2);
  }

  if (manVSMachine === 1 && move_record.length % 2 === 0) {
    retract_move(1);
  }

  if (manVSMachine === 0 && move_record.length % 2 === 0) {
    retract_move(2);
  }

  if (manVSMachine === 0 && move_record.length % 2 === 1) {
    retract_move(1);
  }

  if (manVSMachine === -1) retract_move(1);

  if (
    move_record.length === 0 ||
    (move_record.length < 2 && manVSMachine > -1)
  ) {
    $(".retract-btn, .restart-btn").addClass("disabled");
  }
});

$(document).on("click", ".setting-btn", function () {
  $(".setting-div, .overlay").show();
});

$(document).on("click", ".overlay", function () {
  $(".setting-div, .overlay").hide();

  if (if_setting_changed) {
    if (manVSMachine === 1) {
      machine_move_piece();
    }
    if_setting_changed = false;
  }
});

$("input[type=radio][name=mode]").change(function () {
  if_setting_changed = true;
  if (this.value == 0) {
    // 切換為雙人對戰
    $(".select-color-section").slideUp();
    manVSMachine = -1;
    render_board();
    $("input[type=radio][name=color]").prop("checked", false);
  } else if (this.value == 1) {
    // 切換為單機對戰
    $(".select-color-section").slideDown();

    // 選擇白色
    manVSMachine = 1;
    render_board();
    $("input[type=radio][name=color]#white").prop("checked", true);
  }
});

$("input[type=radio][name=color]").change(function () {
  if_setting_changed = true;
  if (this.value == 0) {
    // 選擇白色
    manVSMachine = 1;
    render_board();
  } else if (this.value == 1) {
    // 選擇黑色
    manVSMachine = 0;
    render_board();
  }
});

$("#timer-checkbox").change(function () {
  if (this.checked) {
    // 限制時間
    timer_on = true;
  } else {
    // 取消限制時間
    timer_on = false;
  }
});

$(document).on("click", "body", function () {
  if (select) {
    $(".selected").removeClass("selected");
    select = false;
  }
});

$(document).on("click", ".restart-btn", function () {
  if (move_record.length === 0) return false;

  if (!confirm("確定要重置嗎？")) return false;

  render_board();

  // 若為單機模式，且machine方執黑子，重置後，machine移動棋子
  if (manVSMachine === 1 && move_record.length === 0) {
    machine_move_piece();
    return false;
  }

  move_record.length === 0 && $(".restart-btn").addClass("disabled");
});
