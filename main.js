let select = false;
let round = 1; // 1=black 0=white

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

function resize_board() {
  if (vmin(80 + 25 + 25 + 10) > vmax(100) || vw(100) > 700) {
    $(".container").css("--piece-section-length", "60vmin");
  } else {
    $(".container").css("--piece-section-length", "80vmin");
  }
}

function move_piece(destination_cell) {
  $(".selected").detach().appendTo(destination_cell);
  $(".selected").attr("data-used", "1");
  $(".selected").removeClass("selected");
  select = false;
  round = 1 - round;
  setTimeout(() => {
    if (if_N_pieces_in_line(4)) {
      if_N_pieces_in_line(4) === "1" ? alert("黑方獲勝!") : alert("白方獲勝!");
    }
  }, 200);
}

function if_N_pieces_in_line(number) {
  let pieces_location = [];
  let check_null = false;
  let count_white = 0;
  let count_black = 0;

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
      // 如果這一列中有null存在
      if (pieces_location[i][j] == null) {
        check_null = true;
      }
      if (pieces_location[i][j] === "0") {
        count_white++;
      }
      if (pieces_location[i][j] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_white >= number || count_black >= number) {
          //如果這一列中有三個同色的棋子，且這一列中沒有null存在
          if (number === 3 && !check_null) {
            return false;
          }
          if (count_white >= number) return "0";
          if (count_black >= number) return "1";
        }
      }
    }
    count_white = 0;
    count_black = 0;
    check_null = false;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // 如果這一列中有null存在
      if (pieces_location[j][i] == null) {
        check_null = true;
      }
      if (pieces_location[j][i] === "0") {
        count_white++;
      }
      if (pieces_location[j][i] === "1") {
        count_black++;
      }
      if (j === 3) {
        if (count_white >= number || count_black >= number) {
          //如果這一列中有三個同色的棋子，且這一列中沒有null存在
          if (number === 3 && !check_null) {
            return false;
          }
          if (count_white >= number) return "0";
          if (count_black >= number) return "1";
        }
      }
    }
    count_white = 0;
    count_black = 0;
    check_null = false;
  }

  for (let i = 0; i < 4; i++) {
    // 如果這一列中有null存在
    if (pieces_location[i][i] == null) {
      check_null = true;
    }
    if (pieces_location[i][i] === "0") {
      count_white++;
    }
    if (pieces_location[i][i] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_white >= number || count_black >= number) {
        //如果這一列中有三個同色的棋子，且這一列中沒有null存在
        if (number === 3 && !check_null) {
          return false;
        }
        if (count_white >= number) return "0";
        if (count_black >= number) return "1";
      }
    }
  }
  count_white = 0;
  count_black = 0;
  check_null = false;

  for (let i = 0, j = 3; i < 4, j >= 0; i++, j--) {
    // 如果這一列中有null存在
    if (pieces_location[i][j] == null) {
      check_null = true;
    }
    if (pieces_location[i][j] === "0") {
      count_white++;
    }
    if (pieces_location[i][j] === "1") {
      count_black++;
    }
    if (i === 3) {
      if (count_white >= number || count_black >= number) {
        //如果這一列中有三個同色的棋子，且這一列中沒有null存在
        if (number === 3 && !check_null) {
          return false;
        }
        if (count_white >= number) return "0";
        if (count_black >= number) return "1";
      }
    }
  }
  return false;
}

resize_board();

$(window).on("resize", function () {
  resize_board();
});

$(".piece").on("click", function (event) {
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
        parseInt(if_N_pieces_in_line(3)) !== 1 - round)
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

$(".cell").on("click", function (event) {
  event.stopPropagation();

  // 如果目前沒有已選取的棋子，或該cell內已有棋子
  if (!select || $(this).children().length > 0) {
    return false;
  }
  move_piece($(this));
});
