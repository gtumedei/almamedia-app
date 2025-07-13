import { Component, createMemo, createResource, createUniqueId, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { executeGetCareerScript } from "~/lib/almaesami.ts"
import {
  Career,
  computeAvgGrade,
  computeCfus,
  computeGraduationBase,
  Course,
} from "~/lib/models.ts"
import TablerCircleX from "~icons/tabler/circle-x"
import TablerExclamationCircle from "~icons/tabler/exclamation-circle"
import TablerX from "~icons/tabler/x"

const App = () => {
  const [career] = createResource(executeGetCareerScript)

  return (
    <Show when={career()} fallback={<ErrorView />}>
      <CareerView career={career()!} />
    </Show>
  )
}

type CourseFormRow = {
  id: string
  grade: { value: string; isValid: boolean }
  cfus: { value: string; isValid: boolean }
}

const CareerView: Component<{ career: Career }> = (props) => {
  const createNewCourse = (): CourseFormRow => ({
    id: createUniqueId(),
    cfus: { value: "", isValid: true },
    grade: { value: "", isValid: true },
  })

  const [additionalCourses, setAdditionalCourses] = createStore<CourseFormRow[]>([
    createNewCourse(),
  ])

  const simulatedCareer = createMemo(() => {
    const validAdditionalCourses = additionalCourses
      .filter((c) => c.cfus.isValid && c.grade.isValid)
      .map((c) => ({ cfus: Number(c.cfus.value), grade: Number(c.grade.value) } satisfies Course))
    const res: Career = {
      name: props.career.name,
      courses: [...props.career.courses, ...validAdditionalCourses],
    }
    return res
  })

  const addCourseRow = async () => {
    setAdditionalCourses((items) => [...items, createNewCourse()])
    // Wait for the UI to update, then focus the newly added vote input
    await new Promise((r) => setTimeout(r, 0))
    const newInput = document.querySelector(
      `[data-course-id="${additionalCourses[additionalCourses.length - 1].id}"] input`
    ) as HTMLInputElement | null
    newInput?.focus()
  }

  const onBlur = async (
    course: CourseFormRow,
    field: "grade" | "cfus",
    inputElem: HTMLInputElement
  ) => {
    // Validate
    setAdditionalCourses((c) => c.id == course.id, field, { isValid: inputElem.checkValidity() })
    // Add a new row when the last one is a valid course and loses focus
    if (
      course.id == additionalCourses[additionalCourses.length - 1].id &&
      course.grade.value != "" &&
      course.cfus.value != ""
    ) {
      await addCourseRow()
    }
  }

  return (
    <main class="w-full flex flex-col items-center text-center text-base divide-y divide-base-content/10">
      <section class="w-full flex flex-col px-6 pt-8 pb-6">
        <div class="mb-8">
          <img src="/icon128.png" alt="" class="h-10 w-10 mb-2 m-auto" />
          <h1 class="text-2xl font-semibold tracking-wide">AlmaMedia</h1>
          <p class="text-base-content/70">{props.career.name}</p>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-accent/10 text-accent text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Media</h2>
            <p>
              <span class="text-xl font-semibold">
                {computeAvgGrade(simulatedCareer()).toFixed(2)}
              </span>{" "}
              / 30
            </p>
          </div>
          <div class="bg-secondary/10 text-secondary text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Crediti</h2>
            <p>
              <span class="text-xl font-semibold">{computeCfus(simulatedCareer())}</span> CFU
            </p>
          </div>
          <div class="bg-primary/10 text-primary text-sm py-4 rounded-xl">
            <h2 class="font-medium opacity-70 mb-1">Base laurea</h2>
            <p>
              <span class="text-xl font-semibold">
                {computeGraduationBase(simulatedCareer()).toFixed(2)}
              </span>{" "}
              / 110
            </p>
          </div>
        </div>
      </section>
      <section class="grow max-h-72 w-full p-6 overflow-y-auto">
        <h2 class="text-lg font-medium mb-1">Prossimi esami</h2>
        <p class="text-base-content/70 mb-6">
          Scopri come può cambiare la tua media in tempo reale!
        </p>
        <div class="flex flex-col gap-4">
          <For each={additionalCourses}>
            {(course) => (
              <div class="flex gap-2">
                <div class="join grow" data-course-id={course.id}>
                  <label class="join-item input">
                    <input
                      type="number"
                      placeholder="Voto"
                      min={18}
                      max={30}
                      value={course.grade.value}
                      onChange={(e) =>
                        setAdditionalCourses((c) => c.id == course.id, "grade", {
                          value: e.target.value,
                        })
                      }
                      onBlur={(e) => onBlur(course, "grade", e.target)}
                    />
                    {!course.grade.isValid && (
                      <div class="tooltip tooltip-error" data-tip="Voto ≥ 18 e ≤ 30">
                        <TablerExclamationCircle class="text-base text-error" />
                      </div>
                    )}
                  </label>
                  <label class="join-item input">
                    <input
                      type="number"
                      placeholder="Crediti"
                      min={1}
                      value={course.cfus.value}
                      onChange={(e) =>
                        setAdditionalCourses((c) => c.id == course.id, "cfus", {
                          value: e.target.value,
                        })
                      }
                      onBlur={(e) => onBlur(course, "cfus", e.target)}
                    />
                    {!course.cfus.isValid && (
                      <div class="tooltip tooltip-error" data-tip="CFU > 0">
                        <TablerExclamationCircle class="text-base text-error" />
                      </div>
                    )}
                  </label>
                </div>
                <button
                  type="button"
                  class="btn btn-soft btn-error btn-square"
                  disabled={course.id == additionalCourses[additionalCourses.length - 1].id}
                  onClick={() =>
                    setAdditionalCourses((courses) => courses.filter((c) => c.id != course.id))
                  }
                >
                  <TablerX class="h-6 w-6" />
                </button>
              </div>
            )}
          </For>
          <button
            type="button"
            class="btn btn-soft btn-error w-1/2 mt-2 mx-auto"
            onClick={() => setAdditionalCourses([createNewCourse()])}
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  )
}

const ErrorView = () => {
  return (
    <main class="w-full flex flex-col gap-2 p-2">
      <div role="alert" class="alert alert-error w-full">
        <TablerCircleX class="text-base mb-auto" />
        <span>
          <strong>Oops</strong>!<br />
          AlmaMedia non riesce a recuperare la tua carriera da studente.
        </span>
      </div>
      <div class="text-sm text-base-content/70 px-2 [&_p]:my-2 [&_a]:text-info [&_a:hover]:underline">
        <p>
          Verifica di aver aperto l'estensione sulla pagina <i>"Riepilogo Esami Studente"</i> di
          AlmaEsami.
        </p>
        <p>
          Puoi segnalare problemi con l'estensione inviando una mail a{" "}
          <a href="mailto:nome.cognome@dominio.com">nome.cognome@dominio.com</a> o{" "}
          <a href="https://github.com/riccardo-trebbi/almamedia-app/issues" target="_blank">
            aprendo una issue
          </a>{" "}
          su GitHub.
        </p>
      </div>
    </main>
  )
}

export default App
