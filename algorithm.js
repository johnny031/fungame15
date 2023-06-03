function machine_move_piece() {
  let origin = calc_best_move()[0];
  let destination_cell = $(`[data-position=${calc_best_move()[1]}]`);

  $(`[data-position=${origin}]`).children(".piece").last().addClass("selected");

  setTimeout(() => {
    $(".selected").detach().appendTo(destination_cell);

    change_round();
  }, 1000);
}

$("body").on("click", function () {
  console.log(calc_best_move()[1]);
});

function calc_best_move() {
  return ["40", "00"];
}
