let line_record = [
  [], // [在此可能連線中，machine方所有棋子的size]
  [], // [在此可能連線中，player方所有棋子的size]
];

let line_record2 = [
  [], // [在此可能連線中，machine方所有棋子的size]
  [], // [在此可能連線中，player方所有棋子的size]
];

function machine_move_piece() {
  let best_move = calc_best_move();
  if (best_move == undefined) return false;

  let origin_piece = $(`[data-position=${best_move[0]}]`)
    .children(".piece")
    .last();
  let destination_cell = $(`[data-position=${best_move[1]}]`);

  origin_piece.addClass("selected");

  setTimeout(() => {
    origin_piece.detach().appendTo(destination_cell);
    origin_piece.attr("data-used", "1");
    update_board_record(best_move[0], best_move[1]);
    move_record.push([best_move[0], best_move[1]]);
    $(".restart-btn").removeClass("disabled");
    change_round();
    check_if_win();
  }, 400);
}

function calc_best_move() {
  let all_possible_moves = [];
  let if_player_has_3_pieces_in_line =
    jQuery.inArray(1 - manVSMachine, if_N_pieces_in_line(3)) !== -1;

  let machine_unused_pieces = [
    unused_pieces_record[manVSMachine][0].at(-1),
    unused_pieces_record[manVSMachine][1].at(-1),
    unused_pieces_record[manVSMachine][2].at(-1),
  ];

  for (let i = 0; i < machine_unused_pieces.length; i++) {
    if (machine_unused_pieces[i] == undefined) continue;

    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        if (pieces_location_record[j][k].length === 0) {
          all_possible_moves.push([
            (manVSMachine + 4).toString() + i.toString(),
            j.toString() + k.toString(),
          ]);
        } else if (
          pieces_location_record[j][k].at(-1)[1] <
            machine_unused_pieces[i][1] &&
          (pieces_location_record[j][k].at(-1)[0] === manVSMachine ||
            (pieces_location_record[j][k].at(-1)[0] !== manVSMachine &&
              if_player_has_3_pieces_in_line))
        ) {
          // 若所在位置(有比較小的棋子) 且
          //    (和machine所執棋子同色 或 (和machine所執棋子不同色 且 玩家已三子連線))

          all_possible_moves.push([
            (manVSMachine + 4).toString() + i.toString(),
            j.toString() + k.toString(),
          ]);
        }
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (pieces_location_record[i][j].length === 0) continue;

      if (pieces_location_record[i][j].at(-1)[0] === manVSMachine) {
        // 若該子屬於machine持方，則可以選擇作為起手子
        for (let k = 0; k < 4; k++) {
          for (let l = 0; l < 4; l++) {
            if (k === i && l === j) continue;

            if (
              pieces_location_record[k][l].length === 0 ||
              pieces_location_record[k][l].at(-1)[1] <
                pieces_location_record[i][j].at(-1)[1]
            ) {
              all_possible_moves.push([
                i.toString() + j.toString(),
                k.toString() + l.toString(),
              ]);
            }
          }
        }
      }
    }
  }

  let highest_score = [0, 0]; // [<當前最高積分>, <i>]

  // 逐一檢查每一個可能的移動
  for (let l = 0; l < all_possible_moves.length; l++) {
    // if (l !== 0) continue;
    // if (l !== all_possible_moves.length - 1) continue;
    let origin_x = parseInt(all_possible_moves[l][0].slice(0, 1));
    let origin_y = parseInt(all_possible_moves[l][0].slice(1, 2));
    let dest_x = parseInt(all_possible_moves[l][1].slice(0, 1));
    let dest_y = parseInt(all_possible_moves[l][1].slice(1, 2));
    let line_score = 0;
    let duplicate_record = JSON.parse(JSON.stringify(pieces_location_record));
    let moving_piece;

    if (origin_x > 3) {
      // 若從場外拿棋子
      moving_piece = machine_unused_pieces[origin_y];
    } else {
      // 若從場上拿棋子
      moving_piece = duplicate_record[origin_x][origin_y].pop();
    }

    duplicate_record[dest_x][dest_y].push(moving_piece);

    let free_pieces = get_free_pieces(duplicate_record);

    // 逐一檢查棋盤上所有可能連線
    for (let i = 0; i < 10; i++) {
      let current_line = [];

      if (i < 4) {
        // i = 0,1,2,3
        for (let j = 0; j < 4; j++) {
          // 橫行
          current_line.push(duplicate_record[i][j]);
        }
      } else if (i >= 4 && i < 8) {
        // i = 4,5,6,7
        for (let j = 0; j < 4; j++) {
          // 直行
          current_line.push(duplicate_record[j][i - 4]);
        }
      } else if (i === 8) {
        for (let j = 0; j < 4; j++) {
          // 左上右下
          current_line.push(duplicate_record[j][j]);
        }
      } else if (i === 9) {
        for (let j = 0; j < 4; j++) {
          // 左下右上
          current_line.push(duplicate_record[j][3 - j]);
        }
      }

      for (let k = 0; k < 4; k++) {
        if (current_line[k].length === 0) continue;

        if (current_line[k].at(-1)[0] === manVSMachine) {
          // manchine方棋子個數
          line_record[0].push(current_line[k].at(-1)[1]);
        } else {
          // player方棋子個數
          line_record[1].push(current_line[k].at(-1)[1]);
        }
      }

      let score = calc_line_score(line_record, i);
      line_score += score;
    }

    // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
    if (
      line_score > highest_score[0] ||
      (line_score === highest_score[0] && Math.random() < 0.1)
    ) {
      highest_score[0] = line_score;
      highest_score[1] = l;
    }
  }

  return all_possible_moves[highest_score[1]];
}

function calc_line_score(record, current_line_index) {
  let score = 0;

  // 落子後
  // 加上machine方棋子size
  for (let i = 0; i < record[0].length; i++) {
    score += record[0][i];
  }

  // 扣掉player方棋子size
  for (let i = 0; i < record[1].length; i++) {
    score -= record[1][i];
  }

  // machine方棋子數量為4
  if (record[0].length === 4) {
    score += 3000000;
  }

  // player方棋子數量為4
  if (record[1].length === 4) {
    score -= 5000000;
  }

  // machine方棋子數量為0，且player方棋子數量為3
  if (record[0].length === 0 && record[1].length === 3) {
    score -= 100000;
  }

  // machine方棋子數量為1，player方棋子數量為3，且machine方棋子size不為4
  if (
    record[0].length === 1 &&
    record[1].length === 3 &&
    jQuery.inArray(4, record[0]) === -1
  ) {
    score -= 10000;
  }

  // 計算machine方size=4的數量
  // let machine_piece_counts_sort_by_size = record[0].reduce(
  //   (count, item) => ((count[item] = count[item] + 1 || 1), count),
  //   {}
  // );

  // machine方棋子數量為3，player方棋子數量為1，且player方棋子size不為4 or
  // machine方棋子數量為3，player方棋子數量為0
  if (
    (record[0].length === 3 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 3 && record[1].length === 0)
  ) {
    // 若player方棋子size=3，且machine方棋子size=4的數量為3
    // if (record[1][0] === 3 && machine_piece_counts_sort_by_size[4] === 3) {
    //   score -= 3000;
    // }
    score += 3000;
  }

  if (
    (record[0].length === 2 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 2 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 2 && record[1].length === 0)
  ) {
    score += 800;
  }

  if (
    (record[0].length === 1 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 1 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) === -1) ||
    (record[0].length === 1 && record[1].length === 0)
  ) {
    score += 70;
  }

  if (
    record[0].length === 3 &&
    record[1].length === 1 &&
    jQuery.inArray(4, record[1]) !== -1
  ) {
    score += 3;
  }

  if (
    (record[0].length === 2 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) !== -1) ||
    (record[0].length === 2 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) !== -1)
  ) {
    score += 2;
  }

  if (
    (record[0].length === 1 &&
      record[1].length === 2 &&
      jQuery.inArray(4, record[1]) !== -1) ||
    (record[0].length === 1 &&
      record[1].length === 1 &&
      jQuery.inArray(4, record[1]) !== -1)
  ) {
    score += 1;
  }

  line_record[0] = [];
  line_record[1] = [];

  return score;
}

function get_free_pieces(duplicate_record) {
  // 逐一檢查棋盤上所有可能連線
  let free_pieces = [
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
  ];

  for (let i = 0; i < 10; i++) {
    let current_line = [];

    if (i < 4) {
      // i = 0,1,2,3
      for (let j = 0; j < 4; j++) {
        // 橫行
        current_line.push(duplicate_record[i][j]);
      }
    } else if (i >= 4 && i < 8) {
      // i = 4,5,6,7
      for (let j = 0; j < 4; j++) {
        // 直行
        current_line.push(duplicate_record[j][i - 4]);
      }
    } else if (i === 8) {
      for (let j = 0; j < 4; j++) {
        // 左上右下
        current_line.push(duplicate_record[j][j]);
      }
    } else if (i === 9) {
      for (let j = 0; j < 4; j++) {
        // 左下右上
        current_line.push(duplicate_record[j][3 - j]);
      }
    }

    for (let k = 0; k < 4; k++) {
      if (current_line[k].length === 0) continue;

      if (current_line[k].at(-1)[0] === manVSMachine) {
        // manchine方棋子個數
        line_record2[0].push(current_line[k].at(-1)[1]);
      } else {
        // player方棋子個數
        line_record2[1].push(current_line[k].at(-1)[1]);
      }
    }

    let who_has_one_only = -1;

    if (line_record2[0].length === 1 && line_record2[1].length === 3) {
      // machine方棋子數量為1，player方棋子數量為3
      who_has_one_only = manVSMachine;
    } else if (line_record2[0].length === 3 && line_record2[1].length === 1) {
      // machine方棋子數量為3，player方棋子數量為1
      who_has_one_only = 1 - manVSMachine;
    }

    if (who_has_one_only === -1) {
      continue;
    }

    for (let k = 0; k < 4; k++) {
      // 現在正在第i條連線的第k的位置
      if (current_line[k].at(-1)[0] === who_has_one_only) {
        if (
          current_line[k].at(-2) != undefined &&
          current_line[k].at(-2)[0] !== current_line[k].at(-1)[0]
        ) {
          // 判斷為不自由棋子
          if (i < 4) {
            // i = 0,1,2,3 橫行
            free_pieces[i][k].push(current_line[k].at(-1));
          } else if (i >= 4 && i < 8) {
            // i = 4,5,6,7 直行
            free_pieces[k][i - 4].push(current_line[k].at(-1));
          } else if (i === 8) {
            // 左上右下
            free_pieces[k][k].push(current_line[k].at(-1));
          } else if (i === 9) {
            // 右上左下
            free_pieces[k][3 - k].push(current_line[k].at(-1));
          }
        }
      }
    }

    line_record2[0] = [];
    line_record2[1] = [];
  }

  // 不小心判斷成不自由的棋子，應把duplicated_record取最上面的棋子，扣掉不自由的棋子，才會得到自由棋子

  return free_pieces;
}
