function one() {
  console.log('bad function')
  throw new Error('error from bad function')
}

function two() {
  try {
    one()
  } catch (e) {
    console.log(e)
  }
}
