import React from "react"
import { useSkills } from "./hooks"
import {
  SkillHeader,
  SkillSummaryCards,
  SkillFilters,
  SkillList,
  SkillDetail,
  SkillConfirmationModal,
  SkillOperatorNotice,
} from "./components"

export const SkillsPage: React.FC = () => {
  const {
    catalog,
    filtered,
    selected,
    query,
    status,
    confirm,
    isLoading,
    isError,
    isPendingToggle,
    isToggleError,
    toggleErrorMessage,
    summary,
    setQuery,
    setStatus,
    handleSelectSkill,
    handleOpenToggleModal,
    handleCloseToggleModal,
    handleToggleSkill,
    refetch,
  } = useSkills()

  return (
    <div className="w-full space-y-6">
      <SkillHeader registryState={catalog?.registryState} />

      <SkillSummaryCards summary={summary} />

      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
          Loading skill registry…
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 text-sm text-rose-200"
        >
          Skill registry tidak dapat dimuat.{" "}
          <button
            type="button"
            onClick={() => {
              void refetch()
            }}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <SkillFilters
            query={query}
            onQueryChange={setQuery}
            status={status}
            onStatusChange={setStatus}
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <SkillList
              skills={filtered}
              selectedSkill={selected}
              onSelectSkill={handleSelectSkill}
            />
            <SkillDetail
              skill={selected}
              onToggle={handleOpenToggleModal}
              busy={isPendingToggle}
            />
          </div>
          <SkillOperatorNotice />
        </>
      )}

      <SkillConfirmationModal
        confirm={confirm}
        isPending={isPendingToggle}
        isError={isToggleError}
        errorMessage={toggleErrorMessage}
        onClose={handleCloseToggleModal}
        onConfirm={handleToggleSkill}
      />
    </div>
  )
}

export default SkillsPage
