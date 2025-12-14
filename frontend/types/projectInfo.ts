import { Job } from "./jobs";
import { Gig } from "./gigs";
import { JobApplication } from "./jobApplication";
import { JobMilestone } from "./jobMilestone";
import { Bid } from "./bid";

export interface ProjectInfoContextType {
    jobsInfo: Job[];
    gigsInfo: Gig[];
    bidsInfo: Bid[];
    jobApplicationsInfo: JobApplication[];
    jobMilestonesInfo: JobMilestone[];
    setJobsInfo: React.Dispatch<React.SetStateAction<Job[]>>;
    setGigsInfo: React.Dispatch<React.SetStateAction<Gig[]>>;
    setBidsInfo: React.Dispatch<React.SetStateAction<Bid[]>>;
    setJobApplicationsInfo: React.Dispatch<React.SetStateAction<JobApplication[]>>;
    setJobMilestonesInfo: React.Dispatch<React.SetStateAction<JobMilestone[]>>;
    projectInfoError: string;
    setProjectInfoError: React.Dispatch<React.SetStateAction<string>>;
}