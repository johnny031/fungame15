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

function remove_piece(destination_cell) {
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
  let count = 1;

  $(".cell").each(function (index) {
    if (index % 4 === 0) {
      pieces_location.push([]);
    }
    pieces_location[Math.floor(index / 4)].push(
      $(this).children(".piece").last().attr("data-color")
    );
  });

  for (let i = 0; i < 4; i++) {
    for (let j = 1; j < 4; j++) {
      if (
        pieces_location[i][j] != null &&
        pieces_location[i][j] === pieces_location[i][j - 1]
      ) {
        count++;
        if (count >= number) {
          if (
            number === 3 &&
            pieces_location[i][0] != null &&
            pieces_location[i][3] != null
          ) {
            return false;
          }
          return pieces_location[i][j];
        }
      } else {
        count = 1;
      }
    }
    count = 1;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 1; j < 4; j++) {
      if (
        pieces_location[j][i] != null &&
        pieces_location[j][i] === pieces_location[j - 1][i]
      ) {
        count++;
        if (count >= number) {
          if (
            number === 3 &&
            pieces_location[0][i] != null &&
            pieces_location[3][i] != null
          ) {
            return false;
          }
          return pieces_location[j][i];
        }
      } else {
        count = 1;
      }
    }
    count = 1;
  }

  for (let i = 1; i < 4; i++) {
    if (
      pieces_location[i][i] != null &&
      pieces_location[i][i] === pieces_location[i - 1][i - 1]
    ) {
      count++;
      if (count >= number) {
        if (
          number === 3 &&
          pieces_location[0][0] != null &&
          pieces_location[3][3] != null
        ) {
          return false;
        }
        return pieces_location[i][i];
      }
    } else {
      count = 1;
    }
  }
  count = 1;

  for (let i = 1, j = 2; i < 4, j >= 0; i++, j--) {
    if (
      pieces_location[i][j] != null &&
      pieces_location[i][j] === pieces_location[i - 1][j + 1]
    ) {
      count++;
      if (count >= number) {
        if (
          number === 3 &&
          pieces_location[0][3] != null &&
          pieces_location[3][0] != null
        ) {
          return false;
        }
        return pieces_location[i][j];
      }
    } else {
      count = 1;
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
    remove_piece($(this).parent(".cell"));
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
  if (!select) {
    return false;
  }
  remove_piece($(this));
});
