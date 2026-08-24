import React from "react"
import { SkillCard } from "./SkillCard"
import type { SkillListProps } from "../types"

export const SkillList: React.FC<SkillListProps> = ({
  skills,
  selectedSkill,
  onSelectSkill,
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Installed skill versions</h2>
        <span className="text-xs text-slate-500">{skills.length} shown</span>
      </div>
      {skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
          Tidak ada skill yang cocok dengan filter.
        </div>
      ) : (
        skills.map((skill) => {
          const identity = `${skill.skillId}@${skill.version}`
          const isSelected = selectedSkill
            ? `${selectedSkill.skillId}@${selectedSkill.version}` === identity
            : false

          return (
            <SkillCard
              key={identity}
              skill={skill}
              isSelected={isSelected}
              onSelect={onSelectSkill}
            />
          )
        })
      )}
    </section>
  )
}
