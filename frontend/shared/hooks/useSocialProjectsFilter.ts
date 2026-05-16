'use client';

import { useMemo, useState } from "react";

interface FilterableProject {
  titulo: string;
  estado?: string;
}

const DIACRITICS_REGEX = /[̀-ͯ]/g;

const normalize = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "").trim();

export function useSocialProjectsFilter<T extends FilterableProject>(
  projects: T[],
) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = useMemo(() => {
    const normalizedSearch = normalize(search);

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch === "" ||
        normalize(project.titulo).startsWith(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || project.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const isAnyFilterActive = search.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredProjects,
    isAnyFilterActive,
    clearFilters,
  };
}
