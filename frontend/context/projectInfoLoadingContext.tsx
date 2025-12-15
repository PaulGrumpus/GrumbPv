'use client'

import { createContext, ReactNode, useState } from 'react';
import { ProjectInfoLoadingContextType, projectInfoLoadingState } from '@/types/loading';

const defaultProvider: ProjectInfoLoadingContextType = {
  projectInfoLoadingState: "pending",
  setprojectInfoLoadingState: () => {},
};

const ProjectInfoLoadingCtx = createContext<ProjectInfoLoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const ProjectInfoLoadingProvider = ({ children }: Props) => {
    const [projectInfoLoadingState, setprojectInfoLoadingState] = useState<projectInfoLoadingState>("pending");

    return (
        <ProjectInfoLoadingCtx.Provider value={{ projectInfoLoadingState, setprojectInfoLoadingState }}>
            {children}
        </ProjectInfoLoadingCtx.Provider>  
    );
};

export { ProjectInfoLoadingCtx, ProjectInfoLoadingProvider };