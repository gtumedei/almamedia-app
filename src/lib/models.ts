export type Course = {
  cfus: number
  grade: number | "ID" | "ST" | null
}

export type Career = {
  name: string
  courses: Course[]
}

export const computeAvgGrade = (career: Career) => {
  let gradesSum = 0
  let cfusSum = 0
  for (const course of career.courses) {
    if (typeof course.grade != "number") continue
    gradesSum += course.grade * course.cfus
    cfusSum += course.cfus
  }
  const avg = cfusSum > 0 ? gradesSum / cfusSum : 0
  return avg
}

export const computeCfus = (career: Career) => {
  let cfusSum = 0
  for (const course of career.courses) {
    if (course.grade != null) {
      cfusSum += course.cfus
    }
  }
  return cfusSum
}

export const computeGraduationBase = (career: Career) => (computeAvgGrade(career) * 110) / 30
