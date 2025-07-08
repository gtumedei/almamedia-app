export type Course = {
  cfus: number
  grade: number | "ID" | "ST" | null
}

export type Career = {
  name: string
  courses: Course[]
}

export const computeAvgGrade = (career: Career) => 28.56

export const computeCfus = (career: Career) => 69

export const computeGraduationBase = (career: Career) => 108.98
