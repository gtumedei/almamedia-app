export const getCareerFromAlmaEsami = () => {
  const rows = document
    .querySelector("table.iceDataTblOutline")
    ?.querySelectorAll("tr.riga0, tr.riga1")
  if (!rows || rows.length == 0) return null

  // TODO
  const name = document.querySelector(".titoloPagina")?.innerHTML ?? ""
  const career: Career = {
    name,
    courses: [],
  }

  for (const row of rows) {
    const cols = row.querySelectorAll(".colonna")
    if (cols.length < 6) continue
    const cfus = Number(cols[4].innerHTML)
    const isComplete = true // TODO
    const grade = 0 // TODO
    const course: Course = {
      cfus,
      grade: isComplete ? grade : null,
    }
    career.courses.push(course)
  }

  return career
}
