import { createStore } from "solid-js/store"
import { Career, computeAvgGrade, computeCfus, computeGraduationBase } from "./lib/models"
import { createUniqueId, For } from "solid-js"

type CourseForm = { id: string; grade: string; cfus: string }

const App = () => {
  const career: Career = {
    name: "Peter Parker",
    courses: [],
  }

  const createNewCourse = () => ({ id: createUniqueId(), cfus: "", grade: "" })

  const [additionalCourses, setAdditionalCourses] = createStore<CourseForm[]>([createNewCourse()])

  const onBlur = async (course: CourseForm) => {
    if (
      course.id == additionalCourses[additionalCourses.length - 1].id &&
      course.grade != "" &&
      course.cfus != ""
    ) {
      setAdditionalCourses((items) => [...items, createNewCourse()])
      await new Promise((r) => setTimeout(r, 0))
      const newInput = document.querySelector(
        `[data-course-id="${additionalCourses[additionalCourses.length - 1].id}"] input`
      ) as HTMLInputElement | null
      newInput?.focus()
    }
  }

  return (
    <main class="w-full flex flex-col items-center text-center text-base divide-y divide-base-content/10">
      <section class="w-full flex flex-col px-6 py-8">
        <h1 class="text-2xl font-medium mb-6">
          Benvenuto, <strong>{career.name}</strong>!
        </h1>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-accent/10 text-accent text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Media</h2>
            <p>
              <span class="text-xl font-semibold">{computeAvgGrade(career)}</span> / 30
            </p>
          </div>
          <div class="bg-secondary/10 text-secondary text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Crediti</h2>
            <p>
              <span class="text-xl font-semibold">{computeCfus(career)}</span> CFU
            </p>
          </div>
          <div class="bg-primary/10 text-primary text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Base laurea</h2>
            <p>
              <span class="text-xl font-semibold">{computeGraduationBase(career)}</span> / 110
            </p>
          </div>
        </div>
      </section>
      <section class="grow w-full px-6 py-8 overflow-y-auto">
        <h2 class="text-lg font-medium mb-1">Prossimi esami</h2>
        <p class="text-base-content/70 mb-6">
          Scopri come può cambiare la tua media in tempo reale!
        </p>
        <div class="flex flex-col gap-4">
          <For each={additionalCourses}>
            {(course) => (
              <div class="join" data-course-id={course.id}>
                <input
                  type="number"
                  class="join-item input"
                  placeholder="Voto"
                  min={18}
                  max={30}
                  value={course.grade}
                  onChange={(e) =>
                    setAdditionalCourses((c) => c.id == course.id, "grade", e.target.value)
                  }
                  onBlur={() => onBlur(course)}
                />
                <input
                  type="number"
                  class="join-item input"
                  placeholder="Crediti"
                  min={0}
                  value={course.cfus}
                  onChange={(e) =>
                    setAdditionalCourses((c) => c.id == course.id, "cfus", e.target.value)
                  }
                  onBlur={() => onBlur(course)}
                />
                <button
                  class="join-item btn btn-soft btn-error btn-square"
                  disabled={course.id == additionalCourses[additionalCourses.length - 1].id}
                  onClick={() =>
                    setAdditionalCourses((courses) => courses.filter((c) => c.id != course.id))
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 6L6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </For>
        </div>
      </section>
      <div class="w-full grid grid-cols-2 gap-4 p-6">
        <button class="btn btn-info">Calcola</button>
        <button class="btn btn-soft btn-error">Reset</button>
      </div>
    </main>
  )
}

export default App
