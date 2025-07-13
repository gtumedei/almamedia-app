import { Career, Course } from "~/lib/models.ts"

// This function gets serialized and passed down to the browser tab. As such, it must not reference any functions or variables outside its inner scope.
const getCareerFromAlmaEsami = () => {
  const NAME_REGEX_IT = /(?<=Piano di studi - ).*?(?= \()/
  const NAME_REGEX_EN = /(?<=Study plan ).*?(?= \()/

  const normalizeStudentName = (name: string) => {
    // Test against the italian regex
    const itMatch = name.match(NAME_REGEX_IT)?.[0]
    if (itMatch) return itMatch
    // Test against the english regex
    const enMatch = name.match(NAME_REGEX_EN)?.[0]
    if (enMatch) return enMatch
    return "Studente"
  }

  const normalizeCourseGrade = (grade: string) => {
    const normalizedGrade = grade
      .replace("verbalizzato: ", "") // remove 'verbalizzato'
      .replace("e lode", "") // remove 'e lode' if present
      .replace(/^\s+|\s+$/, "") // trim
    return isNaN(Number(normalizedGrade)) ? normalizedGrade : Number(normalizedGrade)
  }

  const rows = document
    .querySelector("table.iceDataTblOutline")
    ?.querySelectorAll("tr.riga0, tr.riga1")
  if (!rows || rows.length == 0) return null

  const name = normalizeStudentName(document.querySelector(".titoloPagina")?.innerHTML ?? "")
  const career: Career = { name, courses: [] }

  for (const row of rows) {
    const cols = row.querySelectorAll(".colonna")
    if (cols.length < 6) continue

    const cfus = Number(cols[4].innerHTML)
    const grade = cols[5].innerHTML

    // We take into consideration only the grades that are "Verbalizzato" or "Riconosciuto"
    const course: Course = { cfus, grade: null }
    if (grade.indexOf("verbalizzato") >= 0 || grade.indexOf("Riconosciuto") >= 0) {
      const normalizedGrade = normalizeCourseGrade(grade)
      // @ts-ignore Type 'string | number' is not assignable to type 'number | "ID" | "ST" | null'.
      course.grade = normalizedGrade
    }
    career.courses.push(course)
  }

  console.log("AlmaMedia career loaded", career)
  return career
}

export const executeGetCareerScript = async (): Promise<Career | null | undefined> => {
  const [tab] = await chrome.tabs.query({ active: true })
  if (!tab.id) return null
  const [res] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getCareerFromAlmaEsami,
  })
  return res.result
}
