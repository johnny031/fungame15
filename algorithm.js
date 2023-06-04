let line_record = [
  [0, false], // [在此可能連線中，machine方的棋子個數, 其中是否有size=4的]
  [0, false], // [在此可能連線中，player方的棋子個數, 其中是否有size=4的]
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
    change_round();
  }, 400);
}

$("body").on("dblclick", function () {
  // console.log(test_machine_unused_pieces);
  // console.log(pieces_location_record);
});

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

  let duplicate_record = JSON.parse(JSON.stringify(pieces_location_record));
  let highest_score = [0, 0]; // [<當前最高積分>, <i>]

  for (let i = 0; i < all_possible_moves.length; i++) {
    // 逐一檢查每一個可能的移動
    if (i !== 0) continue;
    let origin_x = parseInt(all_possible_moves[i][0].slice(0, 1));
    let origin_y = parseInt(all_possible_moves[i][0].slice(1, 2));
    let dest_x = parseInt(all_possible_moves[i][1].slice(0, 1));
    let dest_y = parseInt(all_possible_moves[i][1].slice(1, 2));
    let line_score = 0;

    if (origin_x > 3) {
      // 若從場外拿棋子
      let moving_piece = machine_unused_pieces[origin_y];
      duplicate_record[dest_x][dest_y].push(moving_piece);

      // 逐一檢查落子處之所有可能連線
      // 連線一: 直行
      for (let i = 0; i < 4; i++) {
        if (duplicate_record[i][dest_y].length === 0) continue;

        if (duplicate_record[i][dest_y].at(-1)[0] === manVSMachine) {
          // manchine方棋子個數
          line_record[0][0]++;
          if (duplicate_record[i][dest_y].at(-1)[1] === 4) {
            line_record[0][1] = true;
          }
        } else {
          // player方棋子個數
          line_record[1][0]++;
          if (duplicate_record[i][dest_y].at(-1)[1] === 4) {
            line_record[1][1] = true;
          }
        }
      }

      line_score += calc_line_score(line_record);

      // 連線二: 橫行
      for (let i = 0; i < 4; i++) {
        if (duplicate_record[dest_x][i].length === 0) continue;

        if (duplicate_record[dest_x][i].at(-1)[0] === manVSMachine) {
          // manchine方棋子個數
          line_record[0][0]++;
          if (duplicate_record[dest_x][i].at(-1)[1] === 4) {
            line_record[0][1] = true;
          }
        } else {
          // player方棋子個數
          line_record[1][0]++;
          if (duplicate_record[dest_x][i].at(-1)[1] === 4) {
            line_record[1][1] = true;
          }
        }
      }

      line_score += calc_line_score(line_record);

      // 連線三: 左上右下斜線
      if (dest_x === dest_y) {
        for (let i = 0; i < 4; i++) {
          if (duplicate_record[i][i].length === 0) continue;

          if (duplicate_record[i][i].at(-1)[0] === manVSMachine) {
            // manchine方棋子個數
            line_record[0][0]++;
            if (duplicate_record[i][i].at(-1)[1] === 4) {
              line_record[0][1] = true;
            }
          } else {
            // player方棋子個數
            line_record[1][0]++;
            if (duplicate_record[i][i].at(-1)[1] === 4) {
              line_record[1][1] = true;
            }
          }
        }
        line_score += calc_line_score(line_record);
      }

      // 連線四: 左下右上斜線
      if (dest_x + dest_y === 3) {
        for (let i = 0; i < 4; i++) {
          if (duplicate_record[i][3 - i].length === 0) continue;

          if (duplicate_record[i][3 - i].at(-1)[0] === manVSMachine) {
            // manchine方棋子個數
            line_record[0][0]++;
            if (duplicate_record[i][3 - i].at(-1)[1] === 4) {
              line_record[0][1] = true;
            }
          } else {
            // player方棋子個數
            line_record[1][0]++;
            if (duplicate_record[i][3 - i].at(-1)[1] === 4) {
              line_record[1][1] = true;
            }
          }
        }
        line_score += calc_line_score(line_record);
      }

      // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
      if (line_score > highest_score[0]) {
        highest_score = [line_score, i];
      }

      line_score = 0;
    } else {
      // 若從場上拿棋子
      // 逐一檢查起子處之所有可能連線
      // 逐一檢查落子處之所有可能連線
      // 加總所有連線的積分
      // 將此落子處的總積分和當前最高積分比較，若較高，則更新之，並記錄i
    }

    // 由highest_score的i找到all_possible_moves中積分最高的移動，並return之
  }

  // console.log(duplicate_record);
  // console.log(pieces_location_record);
  /////

  console.log(all_possible_moves);

  return all_possible_moves[
    Math.floor(Math.random() * all_possible_moves.length)
  ];
}

function calc_line_score(record) {
  let score = 0;

  if (record[0][0] === 4) {
    score += 8;
  }

  if (record[0][0] === 1 && record[1][0] === 3 && record[0][1]) {
    score += 7;
  }

  if (
    ((record[0][0] === 3 && record[1][0] === 1) ||
      (record[0][0] === 3 && record[1][0] === 0)) &&
    !record[1][1]
  ) {
    score += 6;
  }

  if (
    ((record[0][0] === 2 && record[1][0] === 2) ||
      (record[0][0] === 2 && record[1][0] === 1) ||
      (record[0][0] === 2 && record[1][0] === 0)) &&
    !record[1][1]
  ) {
    score += 5;
  }

  if (
    ((record[0][0] === 1 && record[1][0] === 2) ||
      (record[0][0] === 1 && record[1][0] === 1) ||
      (record[0][0] === 1 && record[1][0] === 0)) &&
    !record[1][1]
  ) {
    score += 4;
  }

  if (record[0][0] === 3 && record[1][0] === 1 && record[1][1]) {
    score += 3;
  }

  if (
    ((record[0][0] === 2 && record[1][0] === 2) ||
      (record[0][0] === 2 && record[1][0] === 1)) &&
    record[1][1]
  ) {
    score += 2;
  }

  if (
    ((record[0][0] === 1 && record[1][0] === 2) ||
      (record[0][0] === 1 && record[1][0] === 1)) &&
    record[1][1]
  ) {
    score += 1;
  }

  line_record = [
    [0, false],
    [0, false],
  ];

  return score;
}
