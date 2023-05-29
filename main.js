let select = false;
let round = 1; // 1=black 0=white
let interval_timer_bar_b;
let interval_timer_bar_w;
let timer_b = 4;
let timer_w = 4;
let fram_per_sec = 10;
let timer_on = false;

function vh(percent) {
  var h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  return (percent * h) / 100;
}

function vw(percent) {
  var w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  return (percent * w) / 100;
}

function vmin(percent) {
  return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
  return Math.max(vh(percent), vw(percent));
}

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

function resize_board() {
  $(".container").css(
    "--piece-section-width",
    "calc((100vmax - var(--piece-section-length)) / 2 - 2vmin)"
  );
  if (vmin(80 + 25 + 25 + 10) - vmax(100) > -32) {
    $(".container").css("--piece-section-length", "45vmin");
    $(".container").css("--piece-section-width", "15vmin");
  } else if (vw(100) > 800) {
    $(".container").css("--piece-section-length", "60vmin");
  } else {
    $(".container").css("--piece-section-length", "80vmin");
  }
}

function change_round() {
  select = false;
  $(".selected").removeClass("selected");
  round = 1 - round;
  round === 1 ? (timer_w += 10) : (timer_b += 10);
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
}

function move_piece(destination_cell) {
  $(".selected").detach().appendTo(destination_cell);
  $(".selected").attr("data-used", "1");
  change_round();

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
        confirm("是否重置盤面?") && render_board();
        return false;
      }
      if_4_black_pieces_in_line && alert("黑方獲勝!");
      if_4_white_pieces_in_line && alert("白方獲勝!");

      confirm("是否重置盤面?") && render_board();
    }
  }, 200);
}

function render_board() {
  round = 1;
  timer_b = 4;
  timer_w = 4;

  $(".container").empty();
  $(".container").append(`
    <div class="timer_section">
      <div class="timer-bar-wrapper">
        <div class="timer-bar black"></div>
      </div>
      <span class="timer-number" id="second_b">5</span>
    </div>
    <div class="piece-section">
      <div class="piece-stack">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-used="0" data-color="1" data-size="1"></div>
        <div class="piece" data-used="0" data-color="1" data-size="2"></div>
        <div class="piece" data-used="0" data-color="1" data-size="3"></div>
        <div class="piece" data-used="0" data-color="1" data-size="4"></div>
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
        <div class="piece" data-used="0" data-color="0" data-size="1"></div>
        <div class="piece" data-used="0" data-color="0" data-size="2"></div>
        <div class="piece" data-used="0" data-color="0" data-size="3"></div>
        <div class="piece" data-used="0" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack">
        <div class="piece" data-used="0" data-color="0" data-size="1"></div>
        <div class="piece" data-used="0" data-color="0" data-size="2"></div>
        <div class="piece" data-used="0" data-color="0" data-size="3"></div>
        <div class="piece" data-used="0" data-color="0" data-size="4"></div>
      </div>
      <div class="piece-stack">
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
  `);
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
    for (let j = 0; j < 4; j++) {
      if (pieces_location[i][j] === "0") {
        count_white++;
      }
      if (pieces_location[i][j] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
        if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
      }
    }
    count_white = 0;
    count_black = 0;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (pieces_location[j][i] === "0") {
        count_white++;
      }
      if (pieces_location[j][i] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
        if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
      }
    }
    count_white = 0;
    count_black = 0;
  }

  for (let i = 0; i < 4; i++) {
    if (pieces_location[i][i] === "0") {
      count_white++;
    }
    if (pieces_location[i][i] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
      if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
    }
  }
  count_white = 0;
  count_black = 0;

  for (let i = 0, j = 3; i < 4, j >= 0; i++, j--) {
    if (pieces_location[i][j] === "0") {
      count_white++;
    }
    if (pieces_location[i][j] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_white >= number) which_color_has_N_pieces_in_line.push(0);
      if (count_black >= number) which_color_has_N_pieces_in_line.push(1);
    }
  }

  return which_color_has_N_pieces_in_line;
}

render_board();
resize_board();

$(window).on("resize", function () {
  resize_board();
});

$(document).on("click", ".piece", function (event) {
  event.stopPropagation();

  // 若選擇已選取的棋子，則取消選取之
  if ($(this).hasClass("selected")) {
    $(this).removeClass("selected");
    select = false;
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

$(document).on("dblclick", ".timer_section", function () {
  confirm("請問要將設定改為「限制時間」嗎？\n若點選取消，則改為「不限制時間」")
    ? (timer_on = true)
    : (timer_on = false);
});
