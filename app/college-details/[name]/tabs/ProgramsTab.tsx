'use client';

import { GraduationCap, BookOpen, Microscope } from 'lucide-react';
import { CollegeData } from '../types';

interface Props { college: CollegeData }

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="section-title">
      <span className="section-icon">{icon}</span>
      {children}
    </h2>
  );
}

function ProgramGrid({ programs, variant }: { programs: string[]; variant: 'ug' | 'pg' | 'phd' }) {
  const badge: Record<string, string> = { ug: 'UG', pg: 'PG', phd: 'PhD' };
  return (
    <div className="programs-grid">
      {programs.map((p, i) => (
        <div
          className={`program-card program-card--${variant}`}
          key={i}
          style={{ '--i': i } as React.CSSProperties}
        >
          <span className={`program-badge program-badge--${variant}`}>{badge[variant]}</span>
          <span className="program-name">{p}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgramsTab({ college }: Props) {
  return (
    <div className="tab-content">

      <section className="content-section">
        <SectionTitle icon={<GraduationCap size={20} />}>
          Undergraduate Programs
          {(college.ug_programs?.length ?? 0) > 0 && (
            <span className="count-chip">{college.ug_programs.length}</span>
          )}
        </SectionTitle>
        {(college.ug_programs?.length ?? 0) > 0
          ? <ProgramGrid programs={college.ug_programs} variant="ug" />
          : <p className="no-data">No UG programs data available</p>}
      </section>

      <section className="content-section">
        <SectionTitle icon={<BookOpen size={20} />}>
          Postgraduate Programs
          {(college.pg_programs?.length ?? 0) > 0 && (
            <span className="count-chip">{college.pg_programs.length}</span>
          )}
        </SectionTitle>
        {(college.pg_programs?.length ?? 0) > 0
          ? <ProgramGrid programs={college.pg_programs} variant="pg" />
          : <p className="no-data">No PG programs data available</p>}
      </section>

      <section className="content-section">
        <SectionTitle icon={<Microscope size={20} />}>
          PhD Programs
          {(college.phd_programs?.length ?? 0) > 0 && (
            <span className="count-chip">{college.phd_programs.length}</span>
          )}
        </SectionTitle>
        {(college.phd_programs?.length ?? 0) > 0
          ? <ProgramGrid programs={college.phd_programs} variant="phd" />
          : <p className="no-data">No PhD programs data available</p>}
      </section>
    </div>
  );
}
