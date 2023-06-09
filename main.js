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
        move_record.push([]);
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
        move_record.push([]);
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
    let if_4_pieces_in_line_white = if_N_pieces_in_line(4)[0].length !== 0;
    let if_4_pieces_in_line_black = if_N_pieces_in_line(4)[1].length !== 0;

    // 若發現有四子連線
    if (if_4_pieces_in_line_white || if_4_pieces_in_line_black) {
      clearInterval(interval_timer_bar_b);
      clearInterval(interval_timer_bar_w);
      //若黑白雙方均有四子連線，拿起棋子時對方已勝利
      if (if_4_pieces_in_line_white && if_4_pieces_in_line_black) {
        round === 1
          ? win_animation(1, manVSMachine)
          : win_animation(0, manVSMachine);
        cancel = true;
      } else {
        if_4_pieces_in_line_black && win_animation(1, manVSMachine);
        if_4_pieces_in_line_white && win_animation(0, manVSMachine);
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

  $(".big-btn-div").hide();
  $(".container").empty();
  $(".container-in-tutorial").empty();
  $(".piece").attr("style", "pointer-events: auto;");

  $(".container").append(`
    <div class="info-div">
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
      <a>
        <i class="fas fa-ellipsis-v"></i>
      </a>
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
    <div class="info-div">
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
      <a>
        <i class="fas fa-ellipsis-v"></i>
      </a>
    </div
    `);

  $(".container-in-tutorial").append(`
    <div class="piece-section">
      <div class="piece-stack">
        <div class="piece" data-color="1" data-size="1"></div>
        <div class="piece" data-color="1" data-size="2"></div>
        <div class="piece" data-color="1" data-size="3"></div>
        <div class="piece" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-color="1" data-size="1"></div>
        <div class="piece" data-color="1" data-size="2"></div>
        <div class="piece" data-color="1" data-size="3"></div>
        <div class="piece" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-color="1" data-size="1"></div>
        <div class="piece" data-color="1" data-size="2"></div>
        <div class="piece" data-color="1" data-size="3"></div>
        <div class="piece" data-color="1" data-size="4"></div>
      </div>
    </div>
    <div class="board">
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
    </div>   
    <div class="piece-section">
      <div class="piece-stack">
        <div class="piece" data-color="0" data-size="1"></div>
        <div class="piece" data-color="0" data-size="2"></div>
        <div class="piece" data-color="0" data-size="3"></div>
        <div class="piece" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-color="0" data-size="1"></div>
        <div class="piece" data-color="0" data-size="2"></div>
        <div class="piece" data-color="0" data-size="3"></div>
        <div class="piece" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-color="0" data-size="1"></div>
        <div class="piece" data-color="0" data-size="2"></div>
        <div class="piece" data-color="0" data-size="3"></div>
        <div class="piece" data-color="0" data-size="4"></div>
      </div>
    </div>
    `);

  if (manVSMachine === -1) {
    // 雙人對戰
    $(".container").attr("style", "--board-rotate: 0deg");
  }

  if (manVSMachine === 1) {
    // 選擇白色
    $(".container").attr("style", "--board-rotate: 0deg");
    $(
      ".info-div:first-of-type .retract-btn, .info-div:first-of-type .restart-btn"
    ).hide();
  }

  if (manVSMachine === 0) {
    // 選擇黑色
    $(".container").attr("style", "--board-rotate: 180deg");
    $(".info-div:first-of-type .setting-btn").attr("style", "display: inline;");
    $(
      ".info-div:last-of-type .retract-btn, .info-div:last-of-type .restart-btn"
    ).hide();
  }
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

  let which_line_has_3_pieces = if_N_pieces_in_line(3)[1 - round];
  let dest_piece_position = $(this).parent(".cell").attr("data-position");
  let valid_position = [];

  for (let i = 0; i < which_line_has_3_pieces.length; i++) {
    if (which_line_has_3_pieces[i] < 4) {
      // 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        valid_position.push(
          which_line_has_3_pieces[i].toString() + j.toString()
        );
      }
    } else if (
      which_line_has_3_pieces[i] >= 4 &&
      which_line_has_3_pieces[i] < 8
    ) {
      // 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        valid_position.push(
          j.toString() + (which_line_has_3_pieces[i] - 4).toString()
        );
      }
    } else if (which_line_has_3_pieces[i] === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        valid_position.push(j.toString() + j.toString());
      }
    } else if (which_line_has_3_pieces[i] === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        valid_position.push(j.toString() + (3 - j).toString());
      }
    }
  }

  // 若目前有已選擇的棋子，且點選的棋子在場內
  if (select && $(this).attr("data-used") === "1") {
    if (
      parseInt($(".selected").attr("data-size")) <=
        parseInt($(this).attr("data-size")) ||
      (parseInt($(this).attr("data-color")) === 1 - round &&
        $(".selected").attr("data-used") === "0" &&
        if_N_pieces_in_line(3)[1 - round].length === 0) ||
      (parseInt($(this).attr("data-color")) === 1 - round &&
        $(".selected").attr("data-used") === "0" &&
        if_N_pieces_in_line(3)[1 - round].length !== 0 &&
        jQuery.inArray(dest_piece_position, valid_position) === -1)
    ) {
      // 如果行動棋子比目標棋子小，
      // 或 (從場外拿棋子欲蓋住對方棋子時，對方尚未3子連線)
      // 或 (從場外拿棋子欲蓋住對方棋子時，對方已3子連線，但目標棋子並非在此連線上)
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
    if (move_record[move_record.length - 1].length === 0) {
      move_record.pop();
      change_round(true);
      if (manVSMachine === -1) {
        retract_move(1);
      }
      continue;
    }

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

  if (move_record.length === 0) {
    $(".retract-btn, .restart-btn").addClass("disabled");
  } else if (move_record.length < 2 && manVSMachine > -1) {
    $(".retract-btn").addClass("disabled");
  }
});

$(document).on("click", ".setting-btn", function () {
  $(".setting-div, .overlay").show();
});

$(document).on("click", ".overlay", function () {
  $(".setting-div, .overlay").hide();
  $(".tutorial-content").hide();
  $(".setting-content").show();
  $(".setting-div").css("height", "auto");

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

$(document).on("click", ".restart-btn, .again", function () {
  if (move_record.length === 0) return false;

  render_board();

  // 若為單機模式，且machine方執黑子，重置後，machine移動棋子
  if (manVSMachine === 1 && move_record.length === 0) {
    machine_move_piece();
    return false;
  }

  move_record.length === 0 && $(".restart-btn").addClass("disabled");
});

function if_N_pieces_in_line(number, pieces_location = pieces_location_record) {
  // [<白>, <黑>]
  let result = [[], []];

  let all_lines = get_all_lines(pieces_location);
  let all_lines_record = get_all_lines_record(all_lines);

  loop1: for (let i = 0; i < all_lines_record.length; i++) {
    if (all_lines_record[i][0].length === number) {
      if (
        number === 3 &&
        all_lines_record[i][1].length === 1 &&
        all_lines_record[i][1][0] === 4
      ) {
        continue loop1;
      }
      result[0].push(i);
    } else if (all_lines_record[i][1].length === number) {
      if (
        number === 3 &&
        all_lines_record[i][0].length === 1 &&
        all_lines_record[i][0][0] === 4
      ) {
        continue loop1;
      }
      result[1].push(i);
    }
  }

  return result;
}

$(".tutorial-btn").on("click", function () {
  $(".setting-div").css("height", "65vmax");
  $(".tutorial-content").show();
  $(".setting-content").hide();
  tutor_animation_1();
  tutor_animation_2();
  tutor_animation_3();
  tutor_animation_4();
  tutor_animation_5();
  tutor_animation_6();
  tutor_animation_7();
});

$(".back-btn").on("click", function () {
  $(".tutorial-content").hide();
  $(".setting-content").show();
  $(".setting-div").css("height", "auto");
});

function tutor_animation_1() {
  let piece = $(
    ".container-in-tutorial.first .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let origin_cell = $(
    ".container-in-tutorial.first .piece-section:last-of-type .piece-stack:last-of-type"
  );
  let dest_cell = $(
    ".container-in-tutorial.first .board .cell:nth-last-of-type(6)"
  );

  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_1();
  }, 2200);
}

function tutor_animation_2() {
  let piece2 = $(
    ".container-in-tutorial.second .piece-section:last-of-type .piece-stack:nth-of-type(2) .piece[data-color='0'][data-size='3']"
  );

  let dest_cell1 = $(
    ".container-in-tutorial.second .board .cell:nth-last-of-type(8)"
  );

  piece2.detach().appendTo(dest_cell1);

  let piece = $(
    ".container-in-tutorial.second .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let origin_cell = $(
    ".container-in-tutorial.second .piece-section:last-of-type .piece-stack:last-of-type"
  );
  let dest_cell = $(
    ".container-in-tutorial.second .board .cell:nth-last-of-type(8)"
  );

  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_2();
  }, 2200);
}

function tutor_animation_3() {
  let piece1 = $(
    ".container-in-tutorial.third .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let piece = $(
    ".container-in-tutorial.third .board .cell:nth-last-of-type(7) .piece"
  );

  let origin_cell = $(
    ".container-in-tutorial.third .board .cell:nth-last-of-type(7)"
  );

  piece1.detach().appendTo(origin_cell);

  let dest_cell = $(
    ".container-in-tutorial.third .board .cell:nth-last-of-type(5)"
  );

  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_3();
  }, 2200);
}

function tutor_animation_4() {
  let piece1 = $(
    ".container-in-tutorial.fourth .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let piece2 = $(
    ".container-in-tutorial.fourth .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='3']"
  );

  let piece = $(
    ".container-in-tutorial.fourth .board .cell:nth-last-of-type(12) .piece"
  );

  let origin_cell = $(
    ".container-in-tutorial.fourth .board .cell:nth-last-of-type(12)"
  );

  piece1.detach().appendTo(origin_cell);

  let dest_cell = $(
    ".container-in-tutorial.fourth .board .cell:nth-last-of-type(6)"
  );

  piece2.detach().appendTo(dest_cell);

  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_4();
  }, 2200);
}

function tutor_animation_5() {
  let piece3 = $(
    ".container-in-tutorial.fifth .piece-section:first-of-type .piece-stack:nth-of-type(2) .piece[data-color='1'][data-size='3']"
  );
  let piece4 = $(
    ".container-in-tutorial.fifth .piece-section:first-of-type .piece-stack:nth-of-type(2) .piece[data-color='1'][data-size='4']"
  );
  let piece2 = $(
    ".container-in-tutorial.fifth .piece-section:first-of-type .piece-stack:nth-of-type(2) .piece[data-color='1'][data-size='2']"
  );

  let dest_cell1 = $(
    ".container-in-tutorial.fifth .board .cell:nth-last-of-type(7)"
  );

  let dest_cell2 = $(
    ".container-in-tutorial.fifth .board .cell:nth-last-of-type(11)"
  );

  let dest_cell3 = $(
    ".container-in-tutorial.fifth .board .cell:nth-last-of-type(15)"
  );

  piece2.detach().appendTo(dest_cell1);
  piece3.detach().appendTo(dest_cell2);
  piece4.detach().appendTo(dest_cell3);

  let piece = $(
    ".container-in-tutorial.fifth .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let origin_cell = $(
    ".container-in-tutorial.fifth .piece-section:last-of-type .piece-stack:last-of-type"
  );
  let dest_cell = $(
    ".container-in-tutorial.fifth .board .cell:nth-last-of-type(7)"
  );

  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_5();
  }, 2200);
}

function tutor_animation_6() {
  let piece1 = $(
    ".container-in-tutorial.sixth .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='3']"
  );

  let piece2 = $(
    ".container-in-tutorial.sixth .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='4']"
  );

  let piece3 = $(
    ".container-in-tutorial.sixth .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='1']"
  );

  let piece4 = $(
    ".container-in-tutorial.sixth .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='2']"
  );

  let piece0 = $(
    ".container-in-tutorial.sixth .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let piece = $(
    ".container-in-tutorial.sixth .board .cell:nth-last-of-type(12) .piece[data-color='0'][data-size='4']"
  );

  let cell1 = $(
    ".container-in-tutorial.sixth .board .cell:nth-last-of-type(11)"
  );
  let cell2 = $(
    ".container-in-tutorial.sixth .board .cell:nth-last-of-type(10)"
  );

  let cell3 = $(
    ".container-in-tutorial.sixth .board .cell:nth-last-of-type(9)"
  );

  let origin_cell = $(
    ".container-in-tutorial.sixth .board .cell:nth-last-of-type(12)"
  );

  piece1.detach().appendTo(origin_cell);
  piece2.detach().appendTo(cell1);
  piece3.detach().appendTo(cell2);
  piece4.detach().appendTo(cell3);
  piece0.detach().appendTo(origin_cell);
  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(cell3);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_6();
  }, 2200);
}

function tutor_animation_7() {
  let piece1 = $(
    ".container-in-tutorial.seventh .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='3']"
  );

  let piece2 = $(
    ".container-in-tutorial.seventh .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='4']"
  );

  let piece3 = $(
    ".container-in-tutorial.seventh .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='1']"
  );

  let piece8 = $(
    ".container-in-tutorial.seventh .piece-section:first-of-type .piece-stack:first-of-type .piece[data-color='1'][data-size='3']"
  );

  let piece5 = $(
    ".container-in-tutorial.seventh .piece-section:last-of-type .piece-stack:first-of-type .piece[data-color='0'][data-size='2']"
  );

  let piece6 = $(
    ".container-in-tutorial.seventh .piece-section:last-of-type .piece-stack:first-of-type .piece[data-color='0'][data-size='1']"
  );

  let piece7 = $(
    ".container-in-tutorial.seventh .piece-section:last-of-type .piece-stack:first-of-type .piece[data-color='0'][data-size='3']"
  );

  let piece4 = $(
    ".container-in-tutorial.seventh .piece-section:first-of-type .piece-stack:last-of-type .piece[data-color='1'][data-size='2']"
  );

  let piece0 = $(
    ".container-in-tutorial.seventh .piece-section:last-of-type .piece-stack:last-of-type .piece[data-color='0'][data-size='4']"
  );

  let piece = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(12) .piece[data-color='0'][data-size='4']"
  );

  let cell1 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(11)"
  );
  let cell2 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(10)"
  );

  let cell3 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(9)"
  );

  let origin_cell = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(12)"
  );

  let dest_cell = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(5)"
  );

  let cell4 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(6)"
  );
  let cell5 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(7)"
  );

  let cell6 = $(
    ".container-in-tutorial.seventh .board .cell:nth-last-of-type(8)"
  );

  piece1.detach().appendTo(origin_cell);
  piece2.detach().appendTo(cell1);
  piece3.detach().appendTo(cell2);
  piece4.detach().appendTo(cell3);
  piece5.detach().appendTo(cell4);
  piece6.detach().appendTo(cell5);
  piece7.detach().appendTo(cell6);
  piece8.detach().appendTo(dest_cell);
  piece0.detach().appendTo(origin_cell);
  piece.addClass("selected-piece-in-tutorial");

  setTimeout(() => {
    piece.detach().appendTo(dest_cell);
    piece.removeClass("selected-piece-in-tutorial");
  }, 800);

  setTimeout(function () {
    piece.detach().appendTo(origin_cell);
    tutor_animation_7();
  }, 2200);
}

$(document).on("click", ".fa-ellipsis-v", function () {
  $(".info-div:first-of-type").animate({ top: "-=5rem" }, 120);
  $(".info-div:first-of-type").animate({ top: "+=5rem" }, 120);

  $(".timer_section").toggle();
  $(".setting-section").toggle();

  $(".info-div:last-of-type").animate({ top: "+=5rem" }, 120);
  $(".info-div:last-of-type").animate({ top: "-=5rem" }, 120);
});

function win_animation(color, mode) {
  let height = $(window).height();
  let width = $(window).width();
  let message;
  let message_color;
  let font_size_big = "24vmin";
  let font_size_small = "16vmin";

  $(".piece").attr("style", "pointer-events: none;");

  if (mode === -1) {
    color === 0 ? (message = "白方獲勝") : (message = "黑方獲勝");
    message_color = "#32cc32";
  } else {
    color !== mode ? (message = "獲勝") : (message = "落敗");
    color !== mode ? (message_color = "#32cc32") : (message_color = "#a2a2a2");
  }

  if (Math.min(width, height) > 560) {
    font_size_big = "15vmin";
    font_size_small = "10vmin";
  }

  $(".alert-animation").show();
  $(".alert-message").html(message);
  $(".alert-message").attr("style", `--color: ${message_color}`);

  if (height < width) {
    $(".alert-message, .bg-2").animate(
      { top: "+=100vh" },
      { duration: 600, easing: "linear" }
    );
    $(".bg-1").animate({ top: "-=100vh" }, { duration: 600, easing: "linear" });
    $(".alert-message").animate(
      { fontSize: font_size_big },
      { duration: 400, easing: "linear" }
    );
    $(".alert-message").animate(
      { fontSize: font_size_small },
      { duration: 300, easing: "linear" }
    );
    $(".bg-1, .bg-2").delay(700).animate({ opacity: "0" }, { duration: 300 });
    $(".alert-message").animate(
      { left: "+=50vmax", top: "-=50vmax", fontSize: "5vmin" },
      {
        duration: 500,
        complete: function () {
          $(".alert-message, .bg-1, .bg-2").removeAttr("style");
          $(".big-btn-div").show();
          $(".alert-animation").hide();
        },
      }
    );
  } else {
    $(".alert-message, .bg-2").animate(
      { left: "-=100vw" },
      { duration: 600, easing: "linear" }
    );
    $(".bg-1").animate(
      { left: "+=100vw" },
      { duration: 600, easing: "linear" }
    );
    $(".alert-message").animate(
      { fontSize: font_size_big },
      { duration: 400, easing: "linear" }
    );
    $(".alert-message").animate(
      { fontSize: font_size_small },
      { duration: 300, easing: "linear" }
    );
    $(".bg-1, .bg-2").delay(700).animate({ opacity: "0" }, { duration: 300 });
    $(".alert-message").animate(
      { left: "+=50vmax", top: "+=50vmax", fontSize: "5vmin" },
      {
        duration: 500,
        complete: function () {
          $(".alert-message, .bg-1, .bg-2").removeAttr("style");
          $(".big-btn-div").show();
          $(".alert-animation").hide();
        },
      }
    );
  }
}

$(".cancel").on("click", function () {
  $(".big-btn-div").hide();
});

$(".rule-title").on("dblclick", function () {
  $(".piece").attr("style", "pointer-events: auto;");
});
